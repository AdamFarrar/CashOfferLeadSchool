import { describe, it, expect } from "vitest";
import { evaluateCondition } from "../src/evaluator";
import type { ConditionExpression } from "../src/types";

// =============================================================================
// Rule Evaluator Unit Tests
// =============================================================================

describe("evaluateCondition", () => {
    const payload = {
        status: "active",
        score: 85,
        role: "admin",
        tags: "premium",
    };

    it("should match eq condition", () => {
        const cond: ConditionExpression = { field: "status", operator: "eq", value: "active" };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should NOT match eq when different", () => {
        const cond: ConditionExpression = { field: "status", operator: "eq", value: "inactive" };
        expect(evaluateCondition(cond, payload)).toBe(false);
    });

    it("should match neq condition", () => {
        const cond: ConditionExpression = { field: "status", operator: "neq", value: "inactive" };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should match gt condition", () => {
        const cond: ConditionExpression = { field: "score", operator: "gt", value: 80 };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should NOT match gt when equal", () => {
        const cond: ConditionExpression = { field: "score", operator: "gt", value: 85 };
        expect(evaluateCondition(cond, payload)).toBe(false);
    });

    it("should match gte when equal", () => {
        const cond: ConditionExpression = { field: "score", operator: "gte", value: 85 };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should match lt condition", () => {
        const cond: ConditionExpression = { field: "score", operator: "lt", value: 90 };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should match lte condition", () => {
        const cond: ConditionExpression = { field: "score", operator: "lte", value: 85 };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should match in condition", () => {
        const cond: ConditionExpression = { field: "role", operator: "in", value: ["admin", "owner"] };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should NOT match in when absent", () => {
        const cond: ConditionExpression = { field: "role", operator: "in", value: ["user", "guest"] };
        expect(evaluateCondition(cond, payload)).toBe(false);
    });

    it("should match contains condition", () => {
        const cond: ConditionExpression = { field: "tags", operator: "contains", value: "prem" };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should handle unknown operator gracefully", () => {
        const cond = { field: "status", operator: "regex" as any, value: ".*" };
        expect(evaluateCondition(cond, payload)).toBe(false);
    });

    it("should handle AND sub-conditions", () => {
        const cond: ConditionExpression = {
            field: "status", operator: "eq", value: "active",
            and: [{ field: "score", operator: "gt", value: 80 }],
        };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should fail AND when sub-condition fails", () => {
        const cond: ConditionExpression = {
            field: "status", operator: "eq", value: "active",
            and: [{ field: "score", operator: "gt", value: 90 }],
        };
        expect(evaluateCondition(cond, payload)).toBe(false);
    });

    it("should handle OR sub-conditions", () => {
        const cond: ConditionExpression = {
            field: "status", operator: "eq", value: "inactive",
            or: [{ field: "score", operator: "gt", value: 80 }],
        };
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should handle missing field gracefully", () => {
        const cond: ConditionExpression = { field: "nonexistent", operator: "eq", value: "anything" };
        expect(evaluateCondition(cond, payload)).toBe(false);
    });

    it("should handle gt with non-numeric field", () => {
        const cond: ConditionExpression = { field: "status", operator: "gt", value: 5 };
        expect(evaluateCondition(cond, payload)).toBe(false);
    });
});
