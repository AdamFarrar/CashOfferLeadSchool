// =============================================================================
// @cocs/automation — Action Dispatcher
// =============================================================================
// INSERT ON CONFLICT for idempotency → execute → update status.
// Uses Promise.allSettled for executor isolation.
// =============================================================================

import type { DomainEvent } from "@cocs/events";
import type { PlannedAction, ChannelExecutor, ExecutorContext, ExecutorResult } from "./types";
import { db } from "@cocs/database/client";
import { automationActionLog } from "@cocs/database/schema";
import { eq, and } from "drizzle-orm";
import { emailExecutor } from "./executors/email";
import { webhookExecutor } from "./executors/webhook";
import { noopExecutor } from "./executors/noop";

// ── Channel Executor Registry ──
const EXECUTORS: Record<string, ChannelExecutor> = {
    email: emailExecutor,
    webhook: webhookExecutor,
    notification: noopExecutor,
};

/**
 * Dispatch planned actions via channel executors.
 * Idempotency: INSERT ON CONFLICT DO NOTHING — if (eventId, ruleId)
 * already exists, the insert silently skips and action is not re-executed.
 */
export async function dispatchActions(
    actions: PlannedAction[],
    event: DomainEvent,
): Promise<void> {
    const context: ExecutorContext = {
        eventId: event.eventId,
        eventKey: event.eventKey,
        correlationId: event.correlationId,
        causationId: event.causationId,
        organizationId: event.organizationId,
        userId: event.actor.id,
    };

    const results = await Promise.allSettled(
        actions.map(action => executeAction(action, event, context))
    );

    const failed = results.filter(r => r.status === "rejected").length;
    if (failed > 0) {
        console.error(
            `[AUTOMATION] ${failed}/${results.length} actions failed | ` +
            `event=${event.eventKey} id=${event.eventId}`
        );
    }
}

async function executeAction(
    action: PlannedAction,
    event: DomainEvent,
    context: ExecutorContext,
): Promise<void> {
    // 1. Insert planned action — idempotency guard
    const inserted = await insertActionLog(action, context, "planned");
    if (!inserted) {
        // Duplicate event — already processed this (eventId, ruleId) pair
        console.info(
            `[AUTOMATION] Skipped duplicate | rule="${action.ruleName}" event=${context.eventId}`
        );
        return;
    }

    // 2. Execute via channel executor
    const executor = EXECUTORS[action.channel];
    if (!executor) {
        await updateActionStatus(context.eventId, action.ruleId, "failed", `Unknown channel: ${action.channel}`);
        return;
    }

    let result: ExecutorResult;
    try {
        result = await executor.execute(action, event.payload, context);
    } catch (err) {
        await updateActionStatus(
            context.eventId, action.ruleId, "failed",
            err instanceof Error ? err.message : String(err),
        );
        return;
    }

    // 3. Update status
    if (result.success) {
        await updateActionStatus(context.eventId, action.ruleId, "completed", undefined, result.messageId);
    } else {
        await updateActionStatus(context.eventId, action.ruleId, "failed", result.error);
    }
}

/**
 * Insert an action log entry. Returns false if (eventId, ruleId) already exists
 * (idempotency — ON CONFLICT DO NOTHING).
 */
async function insertActionLog(
    action: PlannedAction,
    context: ExecutorContext,
    status: "planned" | "completed" | "failed",
): Promise<boolean> {
    try {
        const result = await db
            .insert(automationActionLog)
            .values({
                eventId: context.eventId,
                eventKey: context.eventKey,
                correlationId: context.correlationId,
                causationId: context.causationId,
                ruleId: action.ruleId,
                ruleName: action.ruleName,
                channel: action.channel,
                actionType: action.actionType,
                actionConfig: action.actionConfig,
                status,
                organizationId: context.organizationId,
                userId: context.userId,
            })
            .onConflictDoNothing({
                target: [automationActionLog.eventId, automationActionLog.ruleId],
            })
            .returning({ id: automationActionLog.id });

        return result.length > 0; // If empty, row already existed
    } catch (err) {
        console.error("[AUTOMATION] Failed to insert action log:", err);
        return false;
    }
}

async function updateActionStatus(
    eventId: string,
    ruleId: string,
    status: "completed" | "failed",
    errorMessage?: string,
    messageId?: string,
): Promise<void> {
    try {
        await db
            .update(automationActionLog)
            .set({
                status,
                errorMessage: errorMessage ?? null,
                executorMessageId: messageId ?? null,
            })
            .where(
                and(
                    eq(automationActionLog.eventId, eventId),
                    eq(automationActionLog.ruleId, ruleId),
                ),
            );
    } catch (err) {
        console.error("[AUTOMATION] Failed to update action status:", err);
    }
}
