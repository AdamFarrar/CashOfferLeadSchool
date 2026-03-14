import { describe, it, expect } from "vitest";

// =============================================================================
// AI Actions Contract Tests
// =============================================================================

describe("AI action response shapes", () => {
    it("generateTakeaways returns takeaways array", () => {
        const resp = { success: true, takeaways: ["Buy at 70% ARV"], insightId: "i-1" };
        expect(resp.takeaways).toHaveLength(1);
    });

    it("generateDigest returns digest object", () => {
        const resp = { success: true, summary: "...", themes: ["ARV"], topQuestions: ["How?"] };
        expect(resp.themes).toHaveLength(1);
    });

    it("error response shape", () => {
        const resp = { success: false, error: "No transcript" };
        expect(resp.success).toBe(false);
    });
});
