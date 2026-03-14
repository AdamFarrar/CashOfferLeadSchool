import { db } from "@cols/database/client";
import { automationRule } from "@cols/database/schema";
import { eq, and, desc, isNull } from "drizzle-orm";

// =============================================================================
// Automation Rule Service — Phase 1.6
// =============================================================================
// CRUD operations for automation rules.
// Organization scoping: system rules (null org) + org-specific rules.
// =============================================================================

interface CreateRuleInput {
    eventKey: string;
    name: string;
    organizationId: string | null;
    actionChannel: string;
    actionType: string;
    actionConfig: Record<string, unknown>;
    conditions?: unknown;
    priority?: number;
    delayMs?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    createdBy: string;
}

interface UpdateRuleInput {
    name?: string;
    enabled?: boolean;
    conditions?: unknown;
    actionConfig?: Record<string, unknown>;
    priority?: number;
    delayMs?: number;
    maxRetries?: number;
    retryDelayMs?: number;
}

export async function createAutomationRule(input: CreateRuleInput) {
    const [result] = await db
        .insert(automationRule)
        .values({
            eventKey: input.eventKey,
            name: input.name.trim(),
            organizationId: input.organizationId,
            actionChannel: input.actionChannel,
            actionType: input.actionType,
            actionConfig: input.actionConfig,
            conditions: input.conditions ?? null,
            priority: input.priority ?? 100,
            delayMs: input.delayMs ?? 0,
            maxRetries: input.maxRetries ?? 0,
            retryDelayMs: input.retryDelayMs ?? 0,
            createdBy: input.createdBy,
        })
        .returning();
    return result;
}

export async function updateAutomationRule(
    ruleId: string,
    data: UpdateRuleInput,
) {
    const [result] = await db
        .update(automationRule)
        .set({
            ...(data.name !== undefined && { name: data.name.trim() }),
            ...(data.enabled !== undefined && { enabled: data.enabled }),
            ...(data.conditions !== undefined && { conditions: data.conditions }),
            ...(data.actionConfig !== undefined && { actionConfig: data.actionConfig }),
            ...(data.priority !== undefined && { priority: data.priority }),
            ...(data.delayMs !== undefined && { delayMs: data.delayMs }),
            ...(data.maxRetries !== undefined && { maxRetries: data.maxRetries }),
            ...(data.retryDelayMs !== undefined && { retryDelayMs: data.retryDelayMs }),
            updatedAt: new Date(),
        })
        .where(eq(automationRule.id, ruleId))
        .returning();
    return result;
}

export async function deleteAutomationRule(ruleId: string) {
    await db
        .delete(automationRule)
        .where(eq(automationRule.id, ruleId));
}

export async function listAutomationRules(organizationId: string | null) {
    const orgFilter = organizationId
        ? eq(automationRule.organizationId, organizationId)
        : isNull(automationRule.organizationId);

    return db
        .select()
        .from(automationRule)
        .where(orgFilter)
        .orderBy(desc(automationRule.updatedAt));
}

export async function listAllAutomationRules() {
    return db
        .select()
        .from(automationRule)
        .orderBy(automationRule.eventKey, automationRule.priority);
}

export async function getAutomationRule(ruleId: string) {
    const result = await db
        .select()
        .from(automationRule)
        .where(eq(automationRule.id, ruleId))
        .limit(1);
    return result[0] ?? null;
}

export async function toggleAutomationRule(ruleId: string, enabled: boolean) {
    const [result] = await db
        .update(automationRule)
        .set({ enabled, updatedAt: new Date() })
        .where(eq(automationRule.id, ruleId))
        .returning();
    return result;
}
