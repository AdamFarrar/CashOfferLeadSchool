// =============================================================================
// @cocs/automation — Rule Evaluator
// =============================================================================
// Loads rules from DB, evaluates conditions against event payload.
// =============================================================================

import type { DomainEvent } from "@cocs/events";
import type { AutomationRule, ConditionExpression } from "./types";
import { db } from "@cocs/database/client";
import { automationRule } from "@cocs/database/schema";
import { eq, and, or, isNull } from "drizzle-orm";

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

    const rows = await db
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
 * Returns false on malformed input — never throws to caller.
 */
export function evaluateCondition(
    condition: ConditionExpression,
    payload: Record<string, unknown>,
): boolean {
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

    // AND/OR sub-conditions
    if (condition.and) {
        result = result && condition.and.every(sub => evaluateCondition(sub, payload));
    }
    if (condition.or) {
        result = result || condition.or.some(sub => evaluateCondition(sub, payload));
    }

    return result;
}
