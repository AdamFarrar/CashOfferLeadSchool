import { describe, it, expect, beforeEach, vi } from "vitest";
import { emitDomainEvent } from "../src/emitter";
import { registerListener, registerListenerAll, clearAllListeners } from "../src/registry";

// =============================================================================
// Event Emitter Tests
// =============================================================================

describe("emitDomainEvent", () => {
    beforeEach(() => {
        clearAllListeners();
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "info").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("calls registered listener with domain event", async () => {
        const received: any[] = [];
        registerListener("user_registered", async (event) => {
            received.push(event);
        });

        await emitDomainEvent({
            eventKey: "user_registered",
            payload: { email: "test@test.com" },
            actor: { type: "user", id: "u-1" },
            subject: { type: "user", id: "u-1" },
        });

        expect(received).toHaveLength(1);
        expect(received[0].eventKey).toBe("user_registered");
        expect(received[0].payload.email).toBe("test@test.com");
    });

    it("generates UUID for eventId", async () => {
        const received: any[] = [];
        registerListener("feedback_submitted", async (event) => {
            received.push(event);
        });

        await emitDomainEvent({
            eventKey: "feedback_submitted",
            payload: {},
            actor: { type: "user", id: "u-1" },
            subject: { type: "feedback", id: "fb-1" },
        });

        expect(received[0].eventId).toBeTruthy();
        expect(typeof received[0].eventId).toBe("string");
    });

    it("sets correlationId from options or generates one", async () => {
        const received: any[] = [];
        registerListener("user_registered", async (event) => {
            received.push(event);
        });

        await emitDomainEvent({
            eventKey: "user_registered",
            payload: {},
            actor: { type: "user", id: "u-1" },
            subject: { type: "user", id: "u-1" },
            correlationId: "my-correlation",
        });

        expect(received[0].correlationId).toBe("my-correlation");
    });

    it("sets causationId to null when not provided", async () => {
        const received: any[] = [];
        registerListener("user_registered", async (event) => {
            received.push(event);
        });

        await emitDomainEvent({
            eventKey: "user_registered",
            payload: {},
            actor: { type: "user", id: "u-1" },
            subject: { type: "user", id: "u-1" },
        });

        expect(received[0].causationId).toBeNull();
    });

    it("calls wildcard listeners too", async () => {
        const specific: any[] = [];
        const wildcard: any[] = [];
        registerListener("user_registered", async (e) => specific.push(e));
        registerListenerAll(async (e) => wildcard.push(e));

        await emitDomainEvent({
            eventKey: "user_registered",
            payload: {},
            actor: { type: "user", id: "u-1" },
            subject: { type: "user", id: "u-1" },
        });

        expect(specific).toHaveLength(1);
        expect(wildcard).toHaveLength(1);
    });

    it("warns when no listeners are registered", async () => {
        await emitDomainEvent({
            eventKey: "user_registered",
            payload: {},
            actor: { type: "user", id: "u-1" },
            subject: { type: "user", id: "u-1" },
        });

        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("No listeners")
        );
    });

    it("isolates listener failures with Promise.allSettled", async () => {
        const received: any[] = [];
        registerListener("user_registered", async () => {
            throw new Error("boom");
        });
        registerListener("user_registered", async (event) => {
            received.push(event);
        });

        // Should not throw despite first listener failing
        await emitDomainEvent({
            eventKey: "user_registered",
            payload: {},
            actor: { type: "user", id: "u-1" },
            subject: { type: "user", id: "u-1" },
        });

        expect(received).toHaveLength(1);
    });

    it("sets occurredAt as ISO string", async () => {
        const received: any[] = [];
        registerListener("user_registered", async (e) => received.push(e));

        await emitDomainEvent({
            eventKey: "user_registered",
            payload: {},
            actor: { type: "user", id: "u-1" },
            subject: { type: "user", id: "u-1" },
        });

        expect(new Date(received[0].occurredAt).toISOString()).toBe(received[0].occurredAt);
    });
});
