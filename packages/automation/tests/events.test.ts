import { describe, it, expect } from "vitest";
import { AUTOMATION_EVENTS } from "../src/events";
import { DOMAIN_EVENTS } from "@cols/events";

// =============================================================================
// Automation Events Registry Tests
// =============================================================================

describe("AUTOMATION_EVENTS", () => {
    it("is a non-empty array", () => {
        expect(AUTOMATION_EVENTS.length).toBeGreaterThan(0);
    });

    it("contains USER_REGISTERED", () => {
        expect(AUTOMATION_EVENTS).toContain(DOMAIN_EVENTS.USER_REGISTERED);
    });

    it("contains ENROLLMENT_COMPLETED", () => {
        expect(AUTOMATION_EVENTS).toContain(DOMAIN_EVENTS.ENROLLMENT_COMPLETED);
    });

    it("contains QUALIFICATION_SUBMITTED", () => {
        expect(AUTOMATION_EVENTS).toContain(DOMAIN_EVENTS.QUALIFICATION_SUBMITTED);
    });

    it("contains BOOKING_SUBMITTED", () => {
        expect(AUTOMATION_EVENTS).toContain(DOMAIN_EVENTS.BOOKING_SUBMITTED);
    });

    it("contains FEEDBACK_SUBMITTED", () => {
        expect(AUTOMATION_EVENTS).toContain(DOMAIN_EVENTS.FEEDBACK_SUBMITTED);
    });

    it("does NOT contain TEMPLATE_PUBLISHED (admin-only event)", () => {
        expect(AUTOMATION_EVENTS).not.toContain(DOMAIN_EVENTS.TEMPLATE_PUBLISHED);
    });

    it("does NOT contain AUTOMATION_RULE_CHANGED (prevent loops)", () => {
        expect(AUTOMATION_EVENTS).not.toContain(DOMAIN_EVENTS.AUTOMATION_RULE_CHANGED);
    });

    it("all entries are valid domain event keys", () => {
        const validKeys = Object.values(DOMAIN_EVENTS);
        for (const key of AUTOMATION_EVENTS) {
            expect(validKeys).toContain(key);
        }
    });

    it("has no duplicates", () => {
        const unique = new Set(AUTOMATION_EVENTS);
        expect(unique.size).toBe(AUTOMATION_EVENTS.length);
    });
});
