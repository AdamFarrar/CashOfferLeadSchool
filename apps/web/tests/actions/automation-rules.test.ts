import { describe, it, expect } from "vitest";

// =============================================================================
// Automation Rules Actions Contract Tests
// =============================================================================

describe("automation rule response shapes", () => {
    it("list response has rules array", () => {
        const resp = { success: true, rules: [{ id: "r-1", name: "Welcome Email", enabled: true }] };
        expect(resp.rules).toHaveLength(1);
    });

    it("create/update response has rule", () => {
        const resp = { success: true, rule: { id: "r-1", name: "New Rule" } };
        expect(resp.rule.id).toBeTruthy();
    });

    it("toggle response", () => {
        const resp = { success: true };
        expect(resp.success).toBe(true);
    });
});
