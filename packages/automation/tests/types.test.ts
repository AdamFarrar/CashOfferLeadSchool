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

describe("AutomationRule type shape", () => {
    it("creates a valid automation rule", () => {
        const rule: AutomationRule = {
            id: "rule-1",
            name: "Welcome Email",
            description: "Send welcome email on signup",
            eventKey: "user.signup",
            conditions: { field: "role", operator: "eq", value: "student" },
            actions: [
                {
                    channel: "email",
                    actionType: "send_template",
                    config: { templateId: "welcome" },
                },
            ],
            enabled: true,
            priority: 10,
            organizationId: "org-1",
        };

        expect(rule.enabled).toBe(true);
        expect(rule.actions).toHaveLength(1);
        expect(rule.actions[0].channel).toBe("email");
    });
});

describe("ConditionExpression type shape", () => {
    it("supports simple equality", () => {
        const cond: ConditionExpression = {
            field: "status",
            operator: "eq",
            value: "active",
        };
        expect(cond.operator).toBe("eq");
    });

    it("supports all comparison operators", () => {
        const operators: ConditionExpression["operator"][] = [
            "eq", "neq", "gt", "lt", "gte", "lte", "in", "contains",
        ];
        expect(operators).toHaveLength(8);
    });

    it("supports nested AND/OR conditions", () => {
        const cond: ConditionExpression = {
            field: "tier",
            operator: "eq",
            value: "premium",
            and: [
                { field: "verified", operator: "eq", value: true },
            ],
            or: [
                { field: "role", operator: "eq", value: "admin" },
            ],
        };
        expect(cond.and).toHaveLength(1);
        expect(cond.or).toHaveLength(1);
    });
});

describe("PlannedAction type shape", () => {
    it("creates a valid planned action", () => {
        const action: PlannedAction = {
            ruleId: "rule-1",
            ruleName: "Welcome Email",
            channel: "email",
            actionType: "send_template",
            actionConfig: { templateId: "welcome", delay: 0 },
        };
        expect(action.channel).toBe("email");
        expect(action.actionConfig.templateId).toBe("welcome");
    });
});

describe("ExecutorContext type shape", () => {
    it("creates a valid executor context", () => {
        const ctx: ExecutorContext = {
            eventId: "evt-1",
            eventKey: "user.signup",
            correlationId: "corr-1",
            causationId: null,
            organizationId: "org-1",
            userId: "user-1",
        };
        expect(ctx.causationId).toBeNull();
        expect(ctx.organizationId).toBe("org-1");
    });
});

describe("ExecutorResult type shape", () => {
    it("creates a success result", () => {
        const result: ExecutorResult = {
            success: true,
            messageId: "msg-123",
        };
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it("creates an error result", () => {
        const result: ExecutorResult = {
            success: false,
            error: "SMTP connection failed",
        };
        expect(result.success).toBe(false);
        expect(result.error).toBe("SMTP connection failed");
    });
});
