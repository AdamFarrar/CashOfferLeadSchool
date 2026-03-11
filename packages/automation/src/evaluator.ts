// =============================================================================
// @cocs/automation — Rule Evaluator
// =============================================================================
// Loads rules from DB, evaluates conditions against event payload.
// Safety: MAX_CONDITION_DEPTH = 5 prevents recursive condition abuse.
// =============================================================================

import type { DomainEvent } from "@cocs/events";
import type { AutomationRule, ConditionExpression } from "./types";
import { db } from "@cocs/database/client";
import { automationRule } from "@cocs/database/schema";
import { eq, and, or, isNull } from "drizzle-orm";

/**
 * Maximum nesting depth for condition expressions.
 * Prevents infinite recursion from malformed or adversarial rules.
 */
export const MAX_CONDITION_DEPTH = 5;

/**
 * Find all enabled rules matching this event.
 * Resolution: org-specific rules + system (null org) rules.
 */
export async function evaluateRules(event: DomainEvent): Promise<AutomationRule[]> {

    const orgFilter = event.organizationId
        ? or(
            eq(automationRule.organizationId, event.organizationId),
            isNull(automationRule.organizationId),
        )
        : isNull(automationRule.organizationId);

    let rows;
    try {
        rows = await db
            .select()
            .from(automationRule)
            .where(
                and(
                    eq(automationRule.eventKey, event.eventKey),
                    eq(automationRule.enabled, true),
                    orgFilter,
                ),
            )
            .orderBy(automationRule.priority);
    } catch (err) {
        console.error(`[AUTOMATION:EVAL] DB query FAILED for event=${event.eventKey}:`, err);
        return [];
    }

    // Filter by condition match
    return rows.filter(row => {
        if (!row.conditions) return true;
        try {
            return evaluateCondition(
                row.conditions as ConditionExpression,
                event.payload,
            );
        } catch {
            console.warn(
                `[AUTOMATION] Condition evaluation failed for rule "${row.name}" (${row.id})`,
            );
            return false; // Malformed condition = skip, never crash
        }
    }).map(row => ({
        id: row.id,
        eventKey: row.eventKey,
        organizationId: row.organizationId,
        name: row.name,
        enabled: row.enabled,
        priority: row.priority,
        conditions: row.conditions as ConditionExpression | null,
        actionChannel: row.actionChannel,
        actionType: row.actionType,
        actionConfig: row.actionConfig as Record<string, unknown>,
        delayMs: row.delayMs,
        maxRetries: row.maxRetries,
        retryDelayMs: row.retryDelayMs,
    }));
}

/**
 * Evaluate a condition expression against event payload.
 * Returns false on malformed input or depth exceeded — never throws to caller.
 * @param depth - Current nesting depth (starts at 0). Exceeding MAX_CONDITION_DEPTH returns false.
 */
export function evaluateCondition(
    condition: ConditionExpression,
    payload: Record<string, unknown>,
    depth: number = 0,
): boolean {
    // Safety: bail out if condition tree is too deep
    if (depth >= MAX_CONDITION_DEPTH) {
        console.warn(
            `[AUTOMATION] Condition depth limit (${MAX_CONDITION_DEPTH}) exceeded. ` +
            `Returning false for safety.`,
        );
        return false;
    }

    const actual = payload[condition.field];
    let result = false;

    switch (condition.operator) {
        case "eq":
            result = actual === condition.value;
            break;
        case "neq":
            result = actual !== condition.value;
            break;
        case "gt":
            result = typeof actual === "number" && actual > (condition.value as number);
            break;
        case "lt":
            result = typeof actual === "number" && actual < (condition.value as number);
            break;
        case "gte":
            result = typeof actual === "number" && actual >= (condition.value as number);
            break;
        case "lte":
            result = typeof actual === "number" && actual <= (condition.value as number);
            break;
        case "in":
            result = Array.isArray(condition.value) && condition.value.includes(actual);
            break;
        case "contains":
            result = typeof actual === "string" && actual.includes(condition.value as string);
            break;
        default:
            return false;
    }

    // AND/OR sub-conditions (pass depth + 1)
    if (condition.and) {
        result = result && condition.and.every(sub => evaluateCondition(sub, payload, depth + 1));
    }
    if (condition.or) {
        result = result || condition.or.some(sub => evaluateCondition(sub, payload, depth + 1));
    }

    return result;
}

/**
 * Validate that a condition expression does not exceed the maximum depth.
 * Use this at rule creation/update time to reject overly-nested conditions.
 * @returns `{ valid: true }` or `{ valid: false, error: string }`
 */
export function validateConditionDepth(
    condition: ConditionExpression,
    currentDepth: number = 0,
): { valid: true } | { valid: false; error: string } {
    if (currentDepth >= MAX_CONDITION_DEPTH) {
        return {
            valid: false,
            error: `Condition nesting exceeds maximum depth of ${MAX_CONDITION_DEPTH}.`,
        };
    }

    const children = [
        ...(condition.and || []),
        ...(condition.or || []),
    ];

    for (const child of children) {
        const childResult = validateConditionDepth(child, currentDepth + 1);
        if (!childResult.valid) return childResult;
    }

    return { valid: true };
}
