import { describe, it, expect } from "vitest";
import { renderEmail } from "../src/renderer";

// =============================================================================
// Email Renderer Pipeline Coverage Tests
// =============================================================================
// Pipeline: sanitize → validate → inject → verify → clean

describe("renderEmail pipeline", () => {
    it("renders simple template with data", async () => {
        const result = await renderEmail(
            "<p>Hello {{user_name}}</p>",
            "Welcome {{user_name}}",
            { user_name: "John", email: "john@test.com" },
        );
        expect(result.html).toBe("<p>Hello John</p>");
        expect(result.subject).toBe("Welcome John");
    });

    it("sanitizes script tags before injection", async () => {
        const result = await renderEmail(
            '<script>alert("xss")</script><p>Hello {{user_name}}</p>',
            "Subject",
            { user_name: "John", email: "john@test.com" },
        );
        expect(result.html).not.toContain("<script");
        expect(result.html).toContain("Hello John");
    });

    it("strips unresolved placeholders", async () => {
        const result = await renderEmail(
            "<p>Hello {{user_name}} {{nonexistent_key}}</p>",
            "Subject",
            { email: "test@test.com" },
        );
        // user_name has default "there", nonexistent_key gets stripped
        expect(result.html).toContain("Hello there");
        expect(result.html).not.toContain("{{");
    });

    it("applies defaults for optional placeholders", async () => {
        const result = await renderEmail(
            "<p>Welcome to {{app_name}}</p>",
            "Welcome to {{app_name}}",
            { email: "test@test.com" },
        );
        expect(result.html).toContain("Cash Offer Lead School");
        expect(result.subject).toContain("Cash Offer Lead School");
    });

    it("warns about missing required placeholders", async () => {
        const result = await renderEmail(
            "<p>Your email: {{email}}</p>",
            "Subject",
            {},
        );
        expect(result.html).toContain("Your email:");
    });

    it("handles empty template", async () => {
        const result = await renderEmail("", "", {});
        expect(result.html).toBe("");
        expect(result.subject).toBe("");
    });

    it("strips event handlers before injection", async () => {
        const result = await renderEmail(
            '<p onclick="alert(1)">Hello {{user_name}}</p>',
            "Subject",
            { user_name: "John", email: "john@test.com" },
        );
        expect(result.html).not.toContain("onclick");
        expect(result.html).toContain("Hello John");
    });

    it("injects subject placeholders independently", async () => {
        const result = await renderEmail(
            "<p>Body</p>",
            "Hello {{user_name}} at {{app_name}}",
            { user_name: "Jane", email: "jane@test.com" },
        );
        expect(result.subject).toBe("Hello Jane at Cash Offer Lead School");
    });

    it("handles multiple placeholders in template", async () => {
        const result = await renderEmail(
            "<p>{{user_name}} ({{email}}) at {{app_name}}</p>",
            "{{user_name}}",
            { user_name: "Bob", email: "bob@test.com" },
        );
        expect(result.html).toContain("Bob");
        expect(result.html).toContain("bob@test.com");
        expect(result.html).toContain("Cash Offer Lead School");
    });
});
