import { describe, it, expect } from "vitest";
import {
    validatePlaceholders,
    injectPlaceholders,
    PLACEHOLDER_REGISTRY,
} from "../src/placeholders";
import type { PlaceholderDefinition } from "../src/placeholders";

// =============================================================================
// Email Placeholder Tests
// =============================================================================

describe("PLACEHOLDER_REGISTRY", () => {
    it("contains required placeholders", () => {
        const requiredKeys = PLACEHOLDER_REGISTRY
            .filter(p => p.required)
            .map(p => p.key);
        expect(requiredKeys).toContain("email");
    });

    it("has defaults for optional placeholders", () => {
        const withDefaults = PLACEHOLDER_REGISTRY.filter(p => p.defaultValue);
        expect(withDefaults.length).toBeGreaterThan(0);
        
        const appName = PLACEHOLDER_REGISTRY.find(p => p.key === "app_name");
        expect(appName?.defaultValue).toBe("Cash Offer Lead School");
    });

    it("each entry has key, description, and required flag", () => {
        for (const ph of PLACEHOLDER_REGISTRY) {
            expect(ph.key).toBeTruthy();
            expect(ph.description).toBeTruthy();
            expect(typeof ph.required).toBe("boolean");
        }
    });
});

describe("validatePlaceholders", () => {
    it("returns empty array when all required placeholders provided", () => {
        const html = "Hello {{user_name}}, your email is {{email}}";
        const data = { user_name: "John", email: "john@test.com" };
        expect(validatePlaceholders(html, data)).toEqual([]);
    });

    it("returns missing required placeholders", () => {
        const html = "Your email is {{email}}";
        const data = {};
        const missing = validatePlaceholders(html, data);
        expect(missing).toContain("email");
    });

    it("ignores optional placeholders without data", () => {
        const html = "Hello {{user_name}}";
        const data = {};
        expect(validatePlaceholders(html, data)).toEqual([]);
    });

    it("returns empty for templates with no placeholders", () => {
        const html = "<p>Static content</p>";
        expect(validatePlaceholders(html, {})).toEqual([]);
    });
});

describe("injectPlaceholders", () => {
    it("replaces registered placeholders", () => {
        const html = "Hello {{user_name}}, email: {{email}}";
        const result = injectPlaceholders(html, {
            user_name: "Alice",
            email: "alice@test.com",
        });
        expect(result).toContain("Alice");
        expect(result).toContain("alice@test.com");
    });

    it("applies defaults for missing optional values", () => {
        const html = "Welcome to {{app_name}}";
        const result = injectPlaceholders(html, {});
        expect(result).toContain("Cash Offer Lead School");
    });

    it("replaces custom template vars not in registry", () => {
        const html = "Your code is {{custom_code}}";
        const result = injectPlaceholders(html, { custom_code: "ABC123" });
        expect(result).toContain("ABC123");
    });

    it("leaves nothing when no data and no defaults", () => {
        const html = "Org: {{organization_name}}";
        const result = injectPlaceholders(html, {});
        expect(result).toBe("Org: ");
    });
});
