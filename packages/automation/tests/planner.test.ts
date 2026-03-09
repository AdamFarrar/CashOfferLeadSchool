import { describe, it, expect } from "vitest";
import { planActions } from "../src/planner";
import type { AutomationRule } from "../src/types";

// =============================================================================
// Planner Unit Tests
// =============================================================================

describe("planActions", () => {
    const makeRule = (overrides: Partial<AutomationRule> = {}): AutomationRule => ({
        id: "rule-1",
        eventKey: "user_registered",
        organizationId: null,
        name: "Test Rule",
        enabled: true,
        priority: 100,
        conditions: null,
        actionChannel: "email",
        actionType: "send_template",
        actionConfig: { templateKey: "welcome" },
        delayMs: 0,
        maxRetries: 0,
        retryDelayMs: 0,
        ...overrides,
    });

    it("should create one action per rule", () => {
        const rules = [makeRule(), makeRule({ id: "rule-2", name: "Rule 2" })];
        const actions = planActions(rules);
        expect(actions).toHaveLength(2);
    });

    it("should map rule fields to action correctly", () => {
        const rule = makeRule();
        const [action] = planActions([rule]);

        expect(action.ruleId).toBe("rule-1");
        expect(action.ruleName).toBe("Test Rule");
        expect(action.channel).toBe("email");
        expect(action.actionType).toBe("send_template");
        expect(action.actionConfig).toEqual({ templateKey: "welcome" });
    });

    it("should return empty array for no rules", () => {
        expect(planActions([])).toEqual([]);
    });
});
