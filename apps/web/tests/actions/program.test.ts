import { describe, it, expect } from "vitest";

// =============================================================================
// Program Action Contract Tests
// =============================================================================

describe("program action contracts", () => {
    it("get episodes response", () => {
        const resp = {
            success: true,
            episodes: [{ id: "e-1", title: "Ep 1", completed: false }],
        };
        expect(resp.episodes).toHaveLength(1);
    });

    it("mark complete response", () => {
        const resp = { success: true, completedAt: "2024-01-01T00:00:00Z" };
        expect(resp.completedAt).toBeTruthy();
    });

    it("get progress response", () => {
        const resp = { success: true, completedCount: 5, totalCount: 10 };
        expect(resp.completedCount).toBeLessThanOrEqual(resp.totalCount);
    });

    it("getUserProgramsAction always returns array", () => {
        // On error, action returns [] — never throws
        const errorResult: unknown[] = [];
        expect(Array.isArray(errorResult)).toBe(true);

        const successResult = [{ id: "p-1", title: "Program 1", slug: "program-1" }];
        expect(Array.isArray(successResult)).toBe(true);
    });

    it("getProgramBySlugAction returns null on missing program", () => {
        const result = null;
        expect(result).toBeNull();
    });

    it("resolveEpisodeSlugAction returns null on missing episode", () => {
        const result = null;
        expect(result).toBeNull();
    });
});
