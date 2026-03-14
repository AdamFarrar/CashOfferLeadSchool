import { describe, it, expect } from "vitest";
import { resolveContract } from "../src/contract-mapper";
import type { DomainEvent } from "@cols/events";

// =============================================================================
// Contract Mapper Unit Tests
// =============================================================================

const makeEvent = (overrides: Partial<Omit<DomainEvent, "eventKey">> & { eventKey?: string } = {}): DomainEvent => ({
    eventId: "evt-1",
    eventKey: "user_registered",
    eventVersion: 1,
    occurredAt: new Date().toISOString(),
    correlationId: "corr-1",
    causationId: null,
    actor: { type: "user", id: "user-1" },
    subject: { type: "user", id: "user-1" },
    organizationId: null,
    payload: {},
    ...overrides,
} as DomainEvent);

describe("resolveContract", () => {
    it("should return null for user_registered (tracked client-side)", () => {
        const event = makeEvent({
            eventKey: "user_registered",
            payload: { method: "email", emailHash: "abc123" },
        });

        const result = resolveContract(event);
        expect(result).toBeNull();
    });

    it("should map email_verified to AuthEmailVerificationCompleted", () => {
        const event = makeEvent({
            eventKey: "email_verified",
            payload: { time_to_verify_s: 120 },
        });

        const result = resolveContract(event);
        expect(result).not.toBeNull();
        expect(result!.contract.name).toBe("auth.email_verification.completed");
        expect(result!.properties.time_to_verify_s).toBe(120);
    });

    it("should return null for unmapped events", () => {
        const event = makeEvent({ eventKey: "qualification_submitted" });
        expect(resolveContract(event)).toBeNull();
    });

    it("should default time_to_verify_s to 0 for missing payload", () => {
        const event = makeEvent({
            eventKey: "email_verified",
            payload: {},
        });

        const result = resolveContract(event);
        expect(result).not.toBeNull();
        expect(result!.properties.time_to_verify_s).toBe(0);
    });
});
