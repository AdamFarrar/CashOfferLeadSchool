import { describe, it, expect, vi } from "vitest";
import { evaluateCondition, validateConditionDepth, MAX_CONDITION_DEPTH } from "../src/evaluator";
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

// =============================================================================
// Depth Limit Tests — MAX_CONDITION_DEPTH = 5
// =============================================================================

/** Helper: build a nested condition tree of given depth */
function buildNestedCondition(depth: number): ConditionExpression {
    const base: ConditionExpression = { field: "status", operator: "eq", value: "active" };
    if (depth <= 1) return base;
    return { ...base, and: [buildNestedCondition(depth - 1)] };
}

describe("evaluateCondition — depth limit", () => {
    const payload = { status: "active" };

    it(`MAX_CONDITION_DEPTH should be ${MAX_CONDITION_DEPTH}`, () => {
        expect(MAX_CONDITION_DEPTH).toBe(5);
    });

    it("should evaluate conditions within depth limit", () => {
        // Depth 4 (within limit of 5 levels: 0,1,2,3,4)
        const cond = buildNestedCondition(MAX_CONDITION_DEPTH);
        expect(evaluateCondition(cond, payload)).toBe(true);
    });

    it("should return false when depth limit is exceeded", () => {
        // Depth 6 exceeds limit of 5
        const cond = buildNestedCondition(MAX_CONDITION_DEPTH + 2);
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
        const result = evaluateCondition(cond, payload);
        expect(result).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("Condition depth limit"),
        );
        warnSpy.mockRestore();
    });

    it("should handle exact boundary depth correctly", () => {
        // depth = MAX - 1 should work (0-indexed, so levels 0..MAX-1 = MAX levels)
        const atLimit = buildNestedCondition(MAX_CONDITION_DEPTH);
        expect(evaluateCondition(atLimit, payload)).toBe(true);

        // depth = MAX + 1 should fail (level MAX is rejected)
        const overLimit = buildNestedCondition(MAX_CONDITION_DEPTH + 1);
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
        expect(evaluateCondition(overLimit, payload)).toBe(false);
        warnSpy.mockRestore();
    });
});

describe("validateConditionDepth", () => {
    it("should accept flat conditions", () => {
        const cond: ConditionExpression = { field: "x", operator: "eq", value: 1 };
        expect(validateConditionDepth(cond)).toEqual({ valid: true });
    });

    it("should accept conditions within depth limit", () => {
        const cond = buildNestedCondition(MAX_CONDITION_DEPTH);
        expect(validateConditionDepth(cond)).toEqual({ valid: true });
    });

    it("should reject conditions exceeding depth limit", () => {
        const cond = buildNestedCondition(MAX_CONDITION_DEPTH + 1);
        const result = validateConditionDepth(cond);
        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.error).toContain(`${MAX_CONDITION_DEPTH}`);
        }
    });
});

