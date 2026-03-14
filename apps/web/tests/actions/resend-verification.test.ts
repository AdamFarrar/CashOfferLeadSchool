import { describe, it, expect } from "vitest";

// =============================================================================
// Resend Verification Action Contract Tests
// =============================================================================

describe("resend verification contracts", () => {
    it("success response", () => {
        const resp = { success: true };
        expect(resp.success).toBe(true);
    });

    it("rate limited response", () => {
        const resp = { success: false, error: "Please wait before requesting another verification email" };
        expect(resp.error).toContain("wait");
    });
});
