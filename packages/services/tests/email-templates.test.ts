import { describe, it, expect } from "vitest";

// =============================================================================
// Email Template Service — Pure Logic Tests
// =============================================================================
// Tests for extractable pure logic: key sanitization, input validation.
// Does NOT test DB operations (those are integration tests).
// =============================================================================

/**
 * Extracted key sanitization logic (mirror of createTemplate in email-templates.ts).
 * This is the function under test.
 */
function sanitizeTemplateKey(key: string): string {
    return key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
}

describe("Template Key Sanitization", () => {
    it("should lowercase the key", () => {
        expect(sanitizeTemplateKey("Welcome_Email")).toBe("welcome_email");
    });

    it("should replace spaces with underscores", () => {
        expect(sanitizeTemplateKey("my template")).toBe("my_template");
    });

    it("should replace special characters with underscores", () => {
        expect(sanitizeTemplateKey("My Template!!")).toBe("my_template__");
    });

    it("should preserve hyphens", () => {
        expect(sanitizeTemplateKey("welcome-email")).toBe("welcome-email");
    });

    it("should preserve underscores", () => {
        expect(sanitizeTemplateKey("welcome_email")).toBe("welcome_email");
    });

    it("should trim whitespace", () => {
        expect(sanitizeTemplateKey("  padded  ")).toBe("padded");
    });

    it("should handle empty string", () => {
        expect(sanitizeTemplateKey("")).toBe("");
    });

    it("should handle unicode characters", () => {
        expect(sanitizeTemplateKey("café")).toBe("caf_");
    });

    it("should replace multiple consecutive special chars", () => {
        expect(sanitizeTemplateKey("a!!!b")).toBe("a___b");
    });
});
