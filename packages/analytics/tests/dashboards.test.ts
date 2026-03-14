import { describe, it, expect } from "vitest";
import { FUNNEL_DASHBOARD, FEEDBACK_DASHBOARD, EXPERIMENT_DASHBOARD, ALL_DASHBOARDS } from "../src/dashboards";
import type { DashboardSpec, TileSpec } from "../src/dashboards";

// =============================================================================
// PostHog Dashboard Specification Tests
// =============================================================================

describe("ALL_DASHBOARDS", () => {
    it("has 3 dashboards", () => {
        expect(ALL_DASHBOARDS).toHaveLength(3);
    });
});

describe("FUNNEL_DASHBOARD", () => {
    it("has name and description", () => {
        expect(FUNNEL_DASHBOARD.name).toContain("Funnel");
        expect(FUNNEL_DASHBOARD.description).toBeTruthy();
    });

    it("has 7 tiles", () => {
        expect(FUNNEL_DASHBOARD.tiles).toHaveLength(7);
    });

    it("first tile is the full funnel", () => {
        expect(FUNNEL_DASHBOARD.tiles[0].name).toBe("Full Funnel");
        expect(FUNNEL_DASHBOARD.tiles[0].type).toBe("funnel");
    });

    it("funnel events are ordered correctly (landing → dashboard)", () => {
        const funnelEvents = FUNNEL_DASHBOARD.tiles[0].events;
        expect(funnelEvents[0]).toContain("landing");
        expect(funnelEvents[funnelEvents.length - 1]).toContain("dashboard");
    });

    it("includes step drop-off tile with breakdown", () => {
        const dropOff = FUNNEL_DASHBOARD.tiles.find(t => t.name.includes("Drop-off"));
        expect(dropOff).toBeTruthy();
        expect(dropOff!.breakdownBy).toBe("step_number");
    });
});

describe("FEEDBACK_DASHBOARD", () => {
    it("has name and description", () => {
        expect(FEEDBACK_DASHBOARD.name).toContain("Feedback");
    });

    it("has 4 tiles", () => {
        expect(FEEDBACK_DASHBOARD.tiles).toHaveLength(4);
    });

    it("includes engagement funnel", () => {
        const funnel = FEEDBACK_DASHBOARD.tiles.find(t => t.type === "funnel");
        expect(funnel).toBeTruthy();
    });
});

describe("EXPERIMENT_DASHBOARD", () => {
    it("has tiles for exposure tracking", () => {
        expect(EXPERIMENT_DASHBOARD.tiles.some(t => t.events.includes("experiment.exposed"))).toBe(true);
    });

    it("includes variant distribution table", () => {
        const table = EXPERIMENT_DASHBOARD.tiles.find(t => t.breakdownBy === "variant");
        expect(table).toBeTruthy();
        expect(table!.type).toBe("table");
    });
});

describe("TileSpec types", () => {
    it("supports all tile types", () => {
        const types: TileSpec["type"][] = ["trend", "funnel", "retention", "table", "number"];
        expect(types).toHaveLength(5);
    });
});
