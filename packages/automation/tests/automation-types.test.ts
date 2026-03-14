import { describe, it, expect } from "vitest";
import type {
    AutomationRule,
    ConditionExpression,
    PlannedAction,
    ChannelExecutor,
    ExecutorContext,
    ExecutorResult,
} from "../src/types";

// =============================================================================
// Automation Types Contract Tests
// =============================================================================

describe("AutomationRule", () => {
    it("satisfies the full interface", () => {
        const rule: AutomationRule = {
            id: "rule-1",
            eventKey: "user_registered",
            organizationId: null,
            name: "Welcome Email",
            enabled: true,
            priority: 1,
            conditions: null,
            actionChannel: "email",
            actionType: "send",
            actionConfig: { templateKey: "welcome" },
            delayMs: 0,
            maxRetries: 0,
            retryDelayMs: 0,
        };
        expect(rule.id).toBe("rule-1");
        expect(rule.enabled).toBe(true);
    });
});

describe("ConditionExpression", () => {
    it("supports all operators", () => {
        const operators: ConditionExpression["operator"][] = [
            "eq", "neq", "gt", "lt", "gte", "lte", "in", "contains",
        ];
        expect(operators).toHaveLength(8);
    });

    it("supports nested AND conditions", () => {
        const expr: ConditionExpression = {
            field: "payload.type",
            operator: "eq",
            value: "premium",
            and: [
                { field: "payload.amount", operator: "gt", value: 100 },
            ],
        };
        expect(expr.and).toHaveLength(1);
    });

    it("supports nested OR conditions", () => {
        const expr: ConditionExpression = {
            field: "payload.source",
            operator: "eq",
            value: "web",
            or: [
                { field: "payload.source", operator: "eq", value: "mobile" },
            ],
        };
        expect(expr.or).toHaveLength(1);
    });
});

describe("PlannedAction", () => {
    it("satisfies the interface", () => {
        const action: PlannedAction = {
            ruleId: "rule-1",
            ruleName: "Welcome Email",
            channel: "email",
            actionType: "send",
            actionConfig: { templateKey: "welcome" },
        };
        expect(action.channel).toBe("email");
    });
});

describe("ExecutorContext", () => {
    it("satisfies the interface", () => {
        const ctx: ExecutorContext = {
            eventId: "evt-1",
            eventKey: "user_registered",
            correlationId: "corr-1",
            causationId: null,
            organizationId: null,
            userId: "u-1",
        };
        expect(ctx.causationId).toBeNull();
    });
});

describe("ExecutorResult", () => {
    it("supports success", () => {
        const result: ExecutorResult = { success: true, messageId: "msg-1" };
        expect(result.success).toBe(true);
    });

    it("supports failure with error", () => {
        const result: ExecutorResult = { success: false, error: "SMTP timeout" };
        expect(result.error).toBe("SMTP timeout");
    });
});
