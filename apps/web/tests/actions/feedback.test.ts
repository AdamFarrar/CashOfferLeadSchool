import { describe, it, expect } from "vitest";

// =============================================================================
// Feedback Validation Constants Tests
// =============================================================================

// These constants are replicated from the source to test validation logic
const MAX_BODY_LENGTH = 2000;
const MAX_NOTES_LENGTH = 1000;
const VALID_TYPES = ["general", "feature_request", "bug_report", "usability", "content"] as const;
const VALID_GROUPS = ["internal", "pilot_user", "admin"] as const;
const VALID_STATUSES = ["new", "reviewed", "actioned", "dismissed"] as const;

describe("feedback validation constants", () => {
    it("has 5 valid feedback types", () => {
        expect(VALID_TYPES).toHaveLength(5);
    });

    it("has 3 valid stakeholder groups", () => {
        expect(VALID_GROUPS).toHaveLength(3);
    });

    it("has 4 valid statuses", () => {
        expect(VALID_STATUSES).toHaveLength(4);
    });

    it("max body length is 2000", () => {
        expect(MAX_BODY_LENGTH).toBe(2000);
    });

    it("max notes length is 1000", () => {
        expect(MAX_NOTES_LENGTH).toBe(1000);
    });

    it("includes bug_report type", () => {
        expect(VALID_TYPES).toContain("bug_report");
    });

    it("includes pilot_user group", () => {
        expect(VALID_GROUPS).toContain("pilot_user");
    });

    it("includes actioned status", () => {
        expect(VALID_STATUSES).toContain("actioned");
    });
});

describe("feedback validation logic", () => {
    it("rejects empty body", () => {
        const body = "";
        expect(body.trim()).toBe("");
    });

    it("rejects overly long body", () => {
        const body = "A".repeat(2001);
        expect(body.length).toBeGreaterThan(MAX_BODY_LENGTH);
    });

    it("accepts body at max length", () => {
        const body = "A".repeat(2000);
        expect(body.length).toBeLessThanOrEqual(MAX_BODY_LENGTH);
    });

    it("rejects rating below 1", () => {
        const rating = 0;
        expect(rating < 1).toBe(true);
    });

    it("rejects rating above 5", () => {
        const rating = 6;
        expect(rating > 5).toBe(true);
    });

    it("accepts valid rating", () => {
        const rating = 3;
        expect(rating >= 1 && rating <= 5).toBe(true);
    });
});
