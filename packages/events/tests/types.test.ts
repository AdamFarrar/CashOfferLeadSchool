import { describe, it, expect } from "vitest";
import {
    DOMAIN_EVENTS,
} from "../src/types";
import type {
    DomainEventKey,
    EventActor,
    EventSubject,
    DomainEvent,
    EmitOptions,
    DomainEventListener,
} from "../src/types";

// =============================================================================
// Domain Events Types Tests
// =============================================================================

describe("DOMAIN_EVENTS registry", () => {
    it("contains all expected event keys", () => {
        expect(DOMAIN_EVENTS.USER_REGISTERED).toBe("user_registered");
        expect(DOMAIN_EVENTS.EMAIL_VERIFIED).toBe("email_verified");
        expect(DOMAIN_EVENTS.ENROLLMENT_COMPLETED).toBe("enrollment_completed");
        expect(DOMAIN_EVENTS.EPISODE_COMPLETED).toBe("episode_completed");
        expect(DOMAIN_EVENTS.FEEDBACK_SUBMITTED).toBe("feedback_submitted");
        expect(DOMAIN_EVENTS.BOOKING_SUBMITTED).toBe("booking_submitted");
    });

    it("has 12 registered events", () => {
        expect(Object.keys(DOMAIN_EVENTS)).toHaveLength(12);
    });

    it("all values are lowercase snake_case", () => {
        for (const value of Object.values(DOMAIN_EVENTS)) {
            expect(value).toMatch(/^[a-z_]+$/);
        }
    });
});

describe("EventActor type shape", () => {
    it("supports all actor types", () => {
        const types: EventActor["type"][] = ["user", "system", "automation", "admin"];
        expect(types).toHaveLength(4);
    });

    it("creates a valid actor", () => {
        const actor: EventActor = { type: "user", id: "user-123" };
        expect(actor.type).toBe("user");
    });
});

describe("DomainEvent type shape", () => {
    it("creates a valid domain event", () => {
        const event: DomainEvent = {
            eventId: "evt-1",
            eventKey: "user_registered",
            eventVersion: 1,
            correlationId: "corr-1",
            causationId: null,
            actor: { type: "user", id: "u-1" },
            subject: { type: "user", id: "u-1" },
            organizationId: "org-1",
            payload: { email: "test@test.com" },
            occurredAt: new Date().toISOString(),
        };
        expect(event.eventKey).toBe("user_registered");
        expect(event.causationId).toBeNull();
    });
});

describe("EmitOptions type shape", () => {
    it("creates valid emit options", () => {
        const opts: EmitOptions = {
            eventKey: "feedback_submitted",
            payload: { rating: 5 },
            actor: { type: "user", id: "u-1" },
            subject: { type: "feedback", id: "fb-1" },
        };
        expect(opts.organizationId).toBeUndefined();
    });
});
