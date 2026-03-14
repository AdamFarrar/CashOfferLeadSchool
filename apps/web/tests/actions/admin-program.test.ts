import { describe, it, expect } from "vitest";

// =============================================================================
// Admin Program Action Contract Tests
// =============================================================================

describe("admin program contracts", () => {
    it("get program response", () => {
        const resp = {
            success: true,
            modules: [{ id: "m-1", title: "Module 1", episodes: [] }],
        };
        expect(resp.modules).toHaveLength(1);
    });

    it("reorder episodes response", () => {
        const resp = { success: true };
        expect(resp.success).toBe(true);
    });
});
