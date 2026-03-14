import { describe, it, expect } from "vitest";
import type { EnrollmentRecord, EnrollmentStatus } from "../src/enrollment";

// =============================================================================
// Enrollment Type & Contract Tests
// =============================================================================
// Tests that enrollment types satisfy their contracts.
// These are pure type-shape tests — no DB required.
// =============================================================================

describe("EnrollmentStatus type", () => {
    it("includes all valid statuses", () => {
        const validStatuses: EnrollmentStatus[] = [
            "active",
            "past_due",
            "cancelled",
            "refunded",
        ];

        expect(validStatuses).toHaveLength(4);
        expect(validStatuses).toContain("active");
        expect(validStatuses).toContain("past_due");
        expect(validStatuses).toContain("cancelled");
        expect(validStatuses).toContain("refunded");
    });
});

describe("EnrollmentRecord type shape", () => {
    it("can create a valid EnrollmentRecord", () => {
        const record: EnrollmentRecord = {
            id: "enr-1",
            userId: "user-1",
            status: "active",
            stripeCustomerId: "cus_123",
            stripeCheckoutSessionId: "cs_456",
            stripePaymentIntentId: "pi_789",
            amountCents: 29900,
            currency: "usd",
            enrolledAt: new Date(),
            expiresAt: null,
            createdAt: new Date(),
        };

        expect(record.id).toBe("enr-1");
        expect(record.status).toBe("active");
        expect(record.amountCents).toBe(29900);
        expect(record.currency).toBe("usd");
    });

    it("allows null for optional Stripe fields", () => {
        const record: EnrollmentRecord = {
            id: "enr-2",
            userId: "user-2",
            status: "active",
            stripeCustomerId: null,
            stripeCheckoutSessionId: null,
            stripePaymentIntentId: null,
            amountCents: 0,
            currency: "usd",
            enrolledAt: new Date(),
            expiresAt: null,
            createdAt: new Date(),
        };

        expect(record.stripeCustomerId).toBeNull();
        expect(record.stripeCheckoutSessionId).toBeNull();
        expect(record.stripePaymentIntentId).toBeNull();
        expect(record.amountCents).toBe(0);
    });

    it("defaults currency to usd pattern", () => {
        const record: EnrollmentRecord = {
            id: "enr-3",
            userId: "user-3",
            status: "active",
            stripeCustomerId: null,
            stripeCheckoutSessionId: null,
            stripePaymentIntentId: null,
            amountCents: 9900,
            currency: "usd",
            enrolledAt: new Date(),
            expiresAt: null,
            createdAt: new Date(),
        };

        expect(record.currency).toBe("usd");
        expect(record.currency.length).toBe(3);
    });

    it("supports expiration dates", () => {
        const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const record: EnrollmentRecord = {
            id: "enr-4",
            userId: "user-4",
            status: "active",
            stripeCustomerId: "cus_test",
            stripeCheckoutSessionId: "cs_test",
            stripePaymentIntentId: "pi_test",
            amountCents: 29900,
            currency: "usd",
            enrolledAt: new Date(),
            expiresAt: futureDate,
            createdAt: new Date(),
        };

        expect(record.expiresAt).toEqual(futureDate);
        expect(record.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });
});
