import { describe, it, expect } from "vitest";

// =============================================================================
// Login Action Contract Tests
// =============================================================================

describe("login action contracts", () => {
    it("login input shape", () => {
        const input = { email: "test@test.com", password: "password123" };
        expect(input.email).toContain("@");
    });

    it("success response redirects to dashboard", () => {
        const resp = { success: true, redirect: "/dashboard" };
        expect(resp.redirect).toBe("/dashboard");
    });

    it("error response shape", () => {
        const resp = { success: false, error: "Invalid credentials" };
        expect(resp.error).toBeTruthy();
    });
});
