import { describe, it, expect } from "vitest";
import type { EventEnvelope } from "../src/event-envelope";

// =============================================================================
// Event Envelope Tests
// =============================================================================
// Tests that the EventEnvelope generic type satisfies its contract.
// =============================================================================

describe("EventEnvelope type shape", () => {
    it("creates a valid event envelope with required fields", () => {
        const envelope: EventEnvelope<{ action: string }> = {
            event_id: "evt_123",
            event_name: "page_view",
            event_version: 1,
            timestamp: Date.now(),
            properties: { action: "click" },
        };

        expect(envelope.event_id).toBe("evt_123");
        expect(envelope.event_name).toBe("page_view");
        expect(envelope.event_version).toBe(1);
        expect(envelope.properties.action).toBe("click");
    });

    it("supports optional context fields", () => {
        const envelope: EventEnvelope<{ page: string }> = {
            event_id: "evt_456",
            event_name: "navigation",
            event_version: 2,
            timestamp: Date.now(),
            user_id: "user-1",
            organization_id: "org-1",
            session_id: "sess-abc",
            properties: { page: "/dashboard" },
        };

        expect(envelope.user_id).toBe("user-1");
        expect(envelope.organization_id).toBe("org-1");
        expect(envelope.session_id).toBe("sess-abc");
    });

    it("supports experiment tracking", () => {
        const envelope: EventEnvelope<{ variant_shown: string }> = {
            event_id: "evt_789",
            event_name: "experiment_exposure",
            event_version: 1,
            timestamp: Date.now(),
            active_experiments: [
                { id: "exp-onboarding", variant: "B" },
                { id: "exp-pricing", variant: "control" },
            ],
            properties: { variant_shown: "B" },
        };

        expect(envelope.active_experiments).toHaveLength(2);
        expect(envelope.active_experiments![0].variant).toBe("B");
    });

    it("supports traffic segmentation context", () => {
        const envelope: EventEnvelope<{ cta: string }> = {
            event_id: "evt_seg",
            event_name: "cta_click",
            event_version: 1,
            timestamp: Date.now(),
            segmentation: {
                channel: "organic",
                device_type: "desktop",
                region: "US",
            } as any,
            properties: { cta: "get_started" },
        };

        expect(envelope.segmentation).toBeDefined();
    });

    it("enforces typed properties", () => {
        interface CheckoutProps {
            amount: number;
            currency: string;
            items: number;
        }

        const envelope: EventEnvelope<CheckoutProps> = {
            event_id: "evt_checkout",
            event_name: "checkout_started",
            event_version: 1,
            timestamp: Date.now(),
            properties: {
                amount: 29900,
                currency: "usd",
                items: 1,
            },
        };

        expect(envelope.properties.amount).toBe(29900);
        expect(envelope.properties.currency).toBe("usd");
    });
});
