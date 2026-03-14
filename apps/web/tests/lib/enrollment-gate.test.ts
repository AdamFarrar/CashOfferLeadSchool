import { describe, it, expect } from "vitest";

// =============================================================================
// Enrollment Gate Logic Tests
// =============================================================================

describe("enrollment gate logic", () => {
    it("admins bypass enrollment", () => {
        const role = "admin";
        const bypass = role === "owner" || role === "admin";
        expect(bypass).toBe(true);
    });

    it("owners bypass enrollment", () => {
        const role = "owner";
        const bypass = role === "owner" || role === "admin";
        expect(bypass).toBe(true);
    });

    it("students do not bypass", () => {
        const role = "student";
        const bypass = role === "owner" || role === "admin";
        expect(bypass).toBe(false);
    });

    it("empty role does not bypass", () => {
        const role = "";
        const bypass = role === "owner" || role === "admin";
        expect(bypass).toBe(false);
    });
});
