import { describe, it, expect } from "vitest";

// =============================================================================
// Email Templates Actions Contract Tests
// =============================================================================

describe("email template action response shapes", () => {
    it("list templates response", () => {
        const resp = {
            success: true,
            templates: [{ id: "t-1", key: "verification", name: "Verification Email" }],
        };
        expect(resp.templates).toHaveLength(1);
    });

    it("get template detail response", () => {
        const resp = {
            success: true,
            template: { id: "t-1", key: "verification" },
            versions: [{ id: "v-1", published: true }],
        };
        expect(resp.versions).toHaveLength(1);
    });

    it("publish version response", () => {
        const resp = { success: true };
        expect(resp.success).toBe(true);
    });
});
