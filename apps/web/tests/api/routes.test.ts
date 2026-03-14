import { describe, it, expect } from "vitest";

// =============================================================================
// API Route Export Tests
// =============================================================================

describe("Health API route", () => {
    it("module exports GET", async () => {
        const mod = await import("../../app/api/health/route");
        expect(mod.GET).toBeDefined();
    });
});

describe("Stripe webhook route", () => {
    it("module exports POST", async () => {
        const mod = await import("../../app/api/stripe/webhook/route");
        expect(mod.POST).toBeDefined();
    });
});
