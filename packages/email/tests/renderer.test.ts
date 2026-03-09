import { describe, it, expect } from "vitest";
import { renderEmail } from "../src/renderer";

// =============================================================================
// Email Renderer Unit Tests
// =============================================================================

describe("renderEmail", () => {
    it("should inject placeholder values into HTML", () => {
        const html = "<h1>Hello {{user_name}}</h1><p>Welcome to {{app_name}}</p>";
        const subject = "Welcome {{user_name}}";
        const data = { user_name: "Alice", app_name: "Test App" };

        const result = renderEmail(html, subject, data);

        expect(result.html).toContain("Hello Alice");
        expect(result.html).toContain("Welcome to Test App");
        expect(result.subject).toBe("Welcome Alice");
    });

    it("should leave unreplaced placeholders as empty strings", () => {
        const html = "<p>Hi {{user_name}}, click {{some_url}}</p>";
        const subject = "Test";
        const data = { user_name: "Bob" };

        const result = renderEmail(html, subject, data);

        expect(result.html).toContain("Hi Bob");
        expect(result.html).not.toContain("{{some_url}}");
    });

    it("should sanitize XSS in input HTML", () => {
        const html = '<p>Hello</p><script>alert("xss")</script>';
        const subject = "Test";
        const data = {};

        const result = renderEmail(html, subject, data);

        expect(result.html).not.toContain("<script>");
        expect(result.html).toContain("Hello");
    });

    it("should handle empty HTML gracefully", () => {
        const result = renderEmail("", "Subject", {});
        expect(result.html).toBe("");
        expect(result.subject).toBe("Subject");
    });

    it("should handle multiple occurrences of same placeholder", () => {
        const html = "<p>{{user_name}} said hello to {{user_name}}</p>";
        const subject = "Hi {{user_name}}";
        const data = { user_name: "Carol" };

        const result = renderEmail(html, subject, data);

        expect(result.html).toContain("Carol said hello to Carol");
        expect(result.subject).toBe("Hi Carol");
    });
});
