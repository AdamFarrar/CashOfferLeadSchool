import { describe, it, expect, beforeEach } from "vitest";
import {
    registerListener,
    registerListenerAll,
    emitDomainEvent,
    clearAllListeners,
    DOMAIN_EVENTS,
} from "../src";
import type { DomainEvent } from "../src";

// =============================================================================
// Event Bus Unit Tests
// =============================================================================

describe("Event Bus", () => {
    beforeEach(() => clearAllListeners());
    it("should register a per-event listener and fire on matching event", async () => {
        let received: DomainEvent | null = null;
        registerListener(DOMAIN_EVENTS.USER_REGISTERED, async (event) => {
            received = event;
        });

        await emitDomainEvent({
            eventKey: DOMAIN_EVENTS.USER_REGISTERED,
            payload: { email: "test@test.com" },
            actor: { type: "user", id: "user-1" },
            subject: { type: "user", id: "user-1" },
        });

        expect(received).not.toBeNull();
        expect(received!.eventKey).toBe("user_registered");
        expect(received!.payload.email).toBe("test@test.com");
    });

    it("should populate eventId, correlationId, occurredAt automatically", async () => {
        let received: DomainEvent | null = null;
        registerListener(DOMAIN_EVENTS.FEEDBACK_SUBMITTED, async (event) => {
            received = event;
        });

        await emitDomainEvent({
            eventKey: DOMAIN_EVENTS.FEEDBACK_SUBMITTED,
            payload: {},
            actor: { type: "user", id: "user-1" },
            subject: { type: "user", id: "user-1" },
        });

        expect(received!.eventId).toBeDefined();
        expect(received!.correlationId).toBeDefined();
        expect(received!.occurredAt).toBeDefined();
    });

    it("should fire wildcard listeners for any event", async () => {
        let wildcardReceived: DomainEvent | null = null;
        registerListenerAll(async (event) => {
            wildcardReceived = event;
        });

        await emitDomainEvent({
            eventKey: DOMAIN_EVENTS.PASSWORD_REQUESTED,
            payload: {},
            actor: { type: "system", id: "test" },
            subject: { type: "user", id: "user-1" },
        });

        expect(wildcardReceived).not.toBeNull();
        expect(wildcardReceived!.eventKey).toBe("password_requested");
    });

    it("should NOT fire per-event listener for non-matching events", async () => {
        let fired = false;
        registerListener(DOMAIN_EVENTS.TEMPLATE_PUBLISHED, async () => {
            fired = true;
        });

        await emitDomainEvent({
            eventKey: DOMAIN_EVENTS.AUTOMATION_RULE_CHANGED,
            payload: {},
            actor: { type: "user", id: "user-1" },
            subject: { type: "user", id: "user-1" },
        });

        expect(fired).toBe(false);
    });

    it("should not throw when a listener throws", async () => {
        registerListener(DOMAIN_EVENTS.EMAIL_VERIFIED, async () => {
            throw new Error("boom");
        });

        await expect(emitDomainEvent({
            eventKey: DOMAIN_EVENTS.EMAIL_VERIFIED,
            payload: {},
            actor: { type: "system", id: "test" },
            subject: { type: "system", id: "test" },
        })).resolves.not.toThrow();
    });
});
