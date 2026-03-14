import { describe, it, expect } from "vitest";
import { TURNSTILE_SITE_KEY } from "../../app/lib/turnstile";

// =============================================================================
// Turnstile Configuration Tests
// =============================================================================

describe("TURNSTILE_SITE_KEY", () => {
    it("is defined", () => {
        expect(TURNSTILE_SITE_KEY).toBeTruthy();
    });

    it("is a string", () => {
        expect(typeof TURNSTILE_SITE_KEY).toBe("string");
    });

    it("has a reasonable length", () => {
        expect(TURNSTILE_SITE_KEY.length).toBeGreaterThan(5);
    });
});
