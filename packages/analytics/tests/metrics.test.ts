import { describe, it, expect } from "vitest";
import { FUNNEL_STAGES, DROP_OFF_POINTS, conversionRate, TIMING_THRESHOLDS } from "../src/metrics";
import type { FunnelStageKey, DropOffSeverity } from "../src/metrics";

// =============================================================================
// Conversion Metrics Tests
// =============================================================================

describe("FUNNEL_STAGES", () => {
    it("has 12 ordered stages", () => {
        expect(FUNNEL_STAGES).toHaveLength(12);
    });

    it("starts with landing_viewed", () => {
        expect(FUNNEL_STAGES[0].key).toBe("landing_viewed");
    });

    it("ends with dashboard_first_viewed", () => {
        expect(FUNNEL_STAGES[FUNNEL_STAGES.length - 1].key).toBe("dashboard_first_viewed");
    });

    it("each stage has key, event, and label", () => {
        for (const stage of FUNNEL_STAGES) {
            expect(stage.key).toBeTruthy();
            expect(stage.event).toBeTruthy();
            expect(stage.label).toBeTruthy();
        }
    });

    it("all event names use dot notation", () => {
        for (const stage of FUNNEL_STAGES) {
            expect(stage.event).toMatch(/\./);
        }
    });
});

describe("DROP_OFF_POINTS", () => {
    it("has 5 defined drop-off points", () => {
        expect(DROP_OFF_POINTS).toHaveLength(5);
    });

    it("each has name, from, to, severity, description", () => {
        for (const point of DROP_OFF_POINTS) {
            expect(point.name).toBeTruthy();
            expect(point.from).toBeTruthy();
            expect(point.to).toBeTruthy();
            expect(["low", "medium", "high", "critical"]).toContain(point.severity);
            expect(point.description).toBeTruthy();
        }
    });

    it("has at least one critical drop-off", () => {
        const critical = DROP_OFF_POINTS.filter(p => p.severity === "critical");
        expect(critical.length).toBeGreaterThanOrEqual(1);
    });
});

describe("conversionRate", () => {
    it("returns 0 when from is 0", () => {
        expect(conversionRate(0, 100)).toBe(0);
    });

    it("returns 100 for perfect conversion", () => {
        expect(conversionRate(100, 100)).toBe(100);
    });

    it("returns 50 for half conversion", () => {
        expect(conversionRate(100, 50)).toBe(50);
    });

    it("rounds to 2 decimal places", () => {
        expect(conversionRate(3, 1)).toBe(33.33);
    });

    it("handles small numbers", () => {
        expect(conversionRate(1, 1)).toBe(100);
    });

    it("can exceed 100 (e.g., returning users)", () => {
        expect(conversionRate(50, 75)).toBe(150);
    });
});

describe("TIMING_THRESHOLDS", () => {
    it("has sane step timeout", () => {
        expect(TIMING_THRESHOLDS.stepTimeout).toBe(300);
    });

    it("has sane qualification time", () => {
        expect(TIMING_THRESHOLDS.expectedQualificationTime).toBe(180);
    });

    it("has 24h email verification timeout", () => {
        expect(TIMING_THRESHOLDS.emailVerificationTimeout).toBe(86400);
    });
});
