import { describe, it, expect } from "vitest";
import { getFallbackHtml, getFallbackSubject } from "../src/fallbacks";

// =============================================================================
// Fallback Email Template Tests
// =============================================================================

describe("getFallbackHtml", () => {
    it("returns verification template html", () => {
        const html = getFallbackHtml("verification");
        expect(html).toContain("Verify Your Email Address");
        expect(html).toContain("{{verification_url}}");
        expect(html).toContain("{{user_name}}");
    });

    it("returns password_reset template html", () => {
        const html = getFallbackHtml("password_reset");
        expect(html).toContain("Password Reset Request");
        expect(html).toContain("{{reset_url}}");
    });

    it("returns welcome template html", () => {
        const html = getFallbackHtml("welcome");
        expect(html).toContain("Welcome to {{app_name}}");
        expect(html).toContain("/dashboard");
    });

    it("returns default fallback for unknown keys", () => {
        const html = getFallbackHtml("nonexistent");
        expect(html).toContain("notification from {{app_name}}");
    });

    it("all templates have brand color", () => {
        const html = getFallbackHtml("verification");
        expect(html).toContain("#e32652");
    });

    it("all templates are valid HTML", () => {
        const html = getFallbackHtml("verification");
        expect(html).toContain("<!DOCTYPE html>");
        expect(html).toContain("</html>");
    });

    it("includes support email placeholder", () => {
        const html = getFallbackHtml("verification");
        expect(html).toContain("{{support_email}}");
    });

    it("includes preheader text", () => {
        const html = getFallbackHtml("verification");
        expect(html.toLowerCase()).toContain("verify");
    });
});

describe("getFallbackSubject", () => {
    it("returns verification subject", () => {
        expect(getFallbackSubject("verification")).toContain("Verify Your Email");
    });

    it("returns password_reset subject", () => {
        expect(getFallbackSubject("password_reset")).toContain("Password Reset");
    });

    it("returns welcome subject", () => {
        expect(getFallbackSubject("welcome")).toContain("Welcome");
    });

    it("returns default subject for unknown keys", () => {
        expect(getFallbackSubject("unknown")).toContain("Notification");
    });

    it("all subjects include app_name placeholder", () => {
        expect(getFallbackSubject("verification")).toContain("{{app_name}}");
        expect(getFallbackSubject("password_reset")).toContain("{{app_name}}");
        expect(getFallbackSubject("welcome")).toContain("{{app_name}}");
    });
});
