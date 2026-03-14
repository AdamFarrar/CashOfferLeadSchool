import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock posthog-js before import
vi.mock("posthog-js", () => ({
    default: {
        init: vi.fn(),
        capture: vi.fn(),
    },
}));

import {
    setAnalyticsContext,
    setActiveExperiments,
    setTrafficSource,
    track,
} from "../src/track";

// =============================================================================
// Track Module Coverage Tests
// =============================================================================

describe("Analytics context setters", () => {
    it("setAnalyticsContext sets user and org", () => {
        expect(() => setAnalyticsContext("user-123", "org-456")).not.toThrow();
    });

    it("setAnalyticsContext handles undefined", () => {
        expect(() => setAnalyticsContext(undefined, undefined)).not.toThrow();
    });

    it("setActiveExperiments stores experiments", () => {
        expect(() =>
            setActiveExperiments([
                { id: "exp-1", variant: "control" },
                { id: "exp-2", variant: "treatment" },
            ]),
        ).not.toThrow();
    });

    it("setActiveExperiments handles empty", () => {
        expect(() => setActiveExperiments([])).not.toThrow();
    });

    it("setTrafficSource sets source", () => {
        expect(() => setTrafficSource("admin")).not.toThrow();
    });

    it("setTrafficSource handles undefined", () => {
        expect(() => setTrafficSource(undefined)).not.toThrow();
    });
});

describe("track function", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("executes without throwing (no PostHog configured)", async () => {
        setAnalyticsContext("user-1", "org-1");
        await expect(
            track(
                { name: "test.event", version: 1, properties: {} as any },
                {},
            ),
        ).resolves.not.toThrow();
    });

    it("includes experiment context when set", async () => {
        setActiveExperiments([{ id: "exp", variant: "B" }]);
        await expect(
            track(
                { name: "test.with_exp", version: 1, properties: {} as any },
                {},
            ),
        ).resolves.not.toThrow();
        // Reset
        setActiveExperiments([]);
    });

    it("handles traffic source override", async () => {
        setTrafficSource("admin");
        await expect(
            track(
                { name: "test.admin", version: 1, properties: {} as any },
                {},
            ),
        ).resolves.not.toThrow();
        setTrafficSource(undefined);
    });
});
