import { describe, it, expect } from "vitest";
import { resolveContract } from "../src/contract-mapper";
import type { DomainEvent } from "@cols/events";

// =============================================================================
// Contract Mapper Tests
// =============================================================================

function makeEvent(overrides: Partial<DomainEvent> = {}): DomainEvent {
    return {
        eventId: "evt-1",
        eventKey: "user_registered",
        eventVersion: 1,
        correlationId: "corr-1",
        causationId: null,
        actor: { type: "user", id: "u-1" },
        subject: { type: "user", id: "u-1" },
        organizationId: null,
        payload: {},
        occurredAt: new Date().toISOString(),
        metadata: undefined,
        ...overrides,
    };
}

describe("resolveContract", () => {
    it("maps email_verified to AuthEmailVerificationCompleted", () => {
        const result = resolveContract(makeEvent({
            eventKey: "email_verified",
            payload: { time_to_verify_s: 3600 },
        }));
        expect(result).not.toBeNull();
        expect(result!.contract).toBeTruthy();
        expect(result!.properties.time_to_verify_s).toBe(3600);
    });

    it("returns null for unmapped events", () => {
        expect(resolveContract(makeEvent({ eventKey: "feedback_submitted" }))).toBeNull();
    });

    it("returns null for user_registered (tracked client-side)", () => {
        expect(resolveContract(makeEvent({ eventKey: "user_registered" }))).toBeNull();
    });

    it("handles missing payload fields gracefully", () => {
        const result = resolveContract(makeEvent({
            eventKey: "email_verified",
            payload: {},
        }));
        expect(result).not.toBeNull();
        expect(result!.properties.time_to_verify_s).toBe(0);
    });
});
