// =============================================================================
// @cols/automation — Action Dispatcher
// =============================================================================
// INSERT ON CONFLICT for idempotency → execute → update status.
// Uses Promise.allSettled for executor isolation.
// =============================================================================

import type { DomainEvent } from "@cols/events";
import type { PlannedAction, ChannelExecutor, ExecutorContext, ExecutorResult } from "./types";
import { db } from "@cols/database/client";
import { automationActionLog } from "@cols/database/schema";
import { eq, and } from "drizzle-orm";
import { webhookExecutor } from "./executors/webhook";
import { noopExecutor } from "./executors/noop";

// ── Channel Executor Registry ──
// Email executor is lazy-loaded to avoid importing jsdom at startup.
// jsdom reads CSS files via __dirname which breaks in Next.js standalone bundles.
const EXECUTORS: Record<string, ChannelExecutor | (() => Promise<ChannelExecutor>)> = {
    email: async () => {
        const { emailExecutor } = await import("./executors/email");
        return emailExecutor;
    },
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
        return;
    }

    try {
        // 2. Resolve executor
        const entry = EXECUTORS[action.channel];
        if (!entry) {
            await updateActionStatus(context.eventId, action.ruleId, "failed", `Unknown channel: ${action.channel}`);
            return;
        }

        const executor: ChannelExecutor = typeof entry === "function" && !("execute" in entry)
            ? await (entry as () => Promise<ChannelExecutor>)()
            : entry as ChannelExecutor;

        // 3. Execute
        const result = await executor.execute(action, event.payload, context);

        // 4. Update status
        if (result.success) {
            await updateActionStatus(context.eventId, action.ruleId, "completed", undefined, result.messageId);
        } else {
            console.error(`[AUTOMATION] Action failed | channel=${action.channel} error=${result.error}`);
            await updateActionStatus(context.eventId, action.ruleId, "failed", result.error);
        }
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[AUTOMATION] Action exception | channel=${action.channel}:`, errorMsg);
        try {
            await updateActionStatus(context.eventId, action.ruleId, "failed", errorMsg);
        } catch (updateErr) {
            console.error(`[AUTOMATION:EXEC] Failed to update action status:`, updateErr);
        }
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
