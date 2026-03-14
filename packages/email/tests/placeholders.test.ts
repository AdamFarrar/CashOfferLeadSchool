import { describe, it, expect } from "vitest";
import {
    PLACEHOLDER_REGISTRY,
    validatePlaceholders,
    injectPlaceholders,
} from "../src/placeholders";
import type { PlaceholderDefinition } from "../src/placeholders";

// =============================================================================
// Placeholder System Deep Branch Coverage Tests
// =============================================================================

describe("PLACEHOLDER_REGISTRY", () => {
    it("has 8 placeholder definitions", () => {
        expect(PLACEHOLDER_REGISTRY).toHaveLength(8);
    });

    it("email is required", () => {
        const email = PLACEHOLDER_REGISTRY.find(p => p.key === "email");
        expect(email?.required).toBe(true);
    });

    it("user_name has default value", () => {
        const userName = PLACEHOLDER_REGISTRY.find(p => p.key === "user_name");
        expect(userName?.defaultValue).toBe("there");
    });

    it("app_name has default", () => {
        const appName = PLACEHOLDER_REGISTRY.find(p => p.key === "app_name");
        expect(appName?.defaultValue).toBe("Cash Offer Lead School");
    });

    it("all keys are unique", () => {
        const keys = PLACEHOLDER_REGISTRY.map(p => p.key);
        expect(new Set(keys).size).toBe(keys.length);
    });
});

describe("validatePlaceholders", () => {
    it("returns empty when all required placeholders present", () => {
        const html = "Hello {{user_name}}, verify at {{email}}";
        const data = { email: "test@test.com", user_name: "John" };
        expect(validatePlaceholders(html, data)).toEqual([]);
    });

    it("returns missing required placeholder", () => {
        const html = "Hello {{email}}";
        const data = {};
        const missing = validatePlaceholders(html, data);
        expect(missing).toContain("email");
    });

    it("does not flag optional placeholders as missing", () => {
        const html = "Hello {{user_name}}";
        const data = {};
        expect(validatePlaceholders(html, data)).toEqual([]);
    });

    it("handles template with no placeholders", () => {
        const html = "<p>Static content</p>";
        expect(validatePlaceholders(html, {})).toEqual([]);
    });

    it("handles unknown placeholders gracefully", () => {
        const html = "{{unknown_key}}";
        expect(validatePlaceholders(html, {})).toEqual([]);
    });
});

describe("injectPlaceholders", () => {
    it("injects values for registered placeholders", () => {
        const html = "Hello {{user_name}}, your email is {{email}}";
        const result = injectPlaceholders(html, { user_name: "John", email: "john@test.com" });
        expect(result).toBe("Hello John, your email is john@test.com");
    });

    it("uses default values for missing optional placeholders", () => {
        const html = "Hello {{user_name}}";
        const result = injectPlaceholders(html, {});
        expect(result).toBe("Hello there");
    });

    it("handles custom template vars not in registry", () => {
        const html = "{{custom_var}} content";
        const result = injectPlaceholders(html, { custom_var: "Custom" });
        expect(result).toBe("Custom content");
    });

    it("replaces app_name with default", () => {
        const html = "Welcome to {{app_name}}";
        const result = injectPlaceholders(html, {});
        expect(result).toBe("Welcome to Cash Offer Lead School");
    });

    it("replaces all occurrences of same placeholder", () => {
        const html = "{{email}} and {{email}}";
        const result = injectPlaceholders(html, { email: "a@b.com" });
        expect(result).toBe("a@b.com and a@b.com");
    });

    it("leaves empty string for missing non-default placeholders", () => {
        const html = "Link: {{verification_url}}";
        const result = injectPlaceholders(html, {});
        expect(result).toBe("Link: ");
    });
});

describe("PlaceholderDefinition type", () => {
    it("satisfies the interface", () => {
        const def: PlaceholderDefinition = {
            key: "test",
            description: "Test placeholder",
            required: false,
            defaultValue: "default",
        };
        expect(def.key).toBe("test");
    });
});
