// =============================================================================
// @cols/automation — Types
// =============================================================================

import type { DomainEventKey } from "@cols/events";

export interface AutomationRule {
    id: string;
    eventKey: string;
    organizationId: string | null;
    name: string;
    enabled: boolean;
    priority: number;
    conditions: ConditionExpression | null;
    actionChannel: string;
    actionType: string;
    actionConfig: Record<string, unknown>;
    delayMs: number;
    maxRetries: number;
    retryDelayMs: number;
}

/**
 * Condition expressions evaluate against event payload.
 * This is a data comparator, NOT an expression engine.
 * No eval(), no code execution, no function calls.
 */
export interface ConditionExpression {
    field: string;
    operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "in" | "contains";
    value: unknown;
    and?: ConditionExpression[];
    or?: ConditionExpression[];
}

export interface PlannedAction {
    ruleId: string;
    ruleName: string;
    channel: string;
    actionType: string;
    actionConfig: Record<string, unknown>;
}

export interface ChannelExecutor {
    channel: string;
    execute(
        action: PlannedAction,
        eventPayload: Record<string, unknown>,
        context: ExecutorContext,
    ): Promise<ExecutorResult>;
}

export interface ExecutorContext {
    eventId: string;
    eventKey: string;
    correlationId: string;
    causationId: string | null;
    organizationId: string | null;
    userId: string;
}

export interface ExecutorResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
