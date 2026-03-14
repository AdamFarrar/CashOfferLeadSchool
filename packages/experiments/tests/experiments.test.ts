import { describe, it, expect } from "vitest";
import { experiments, getExperimentsByStatus, getActiveExperimentsForPage } from "../src/experiments";
import type { ExperimentDefinition } from "../src/types";

// =============================================================================
// Experiment Registry Tests
// =============================================================================

describe("experiments registry", () => {
    it("is a Record of ExperimentDefinitions", () => {
        expect(typeof experiments).toBe("object");
    });

    it("all entries have valid status values", () => {
        const validStatuses = ["draft", "running", "paused", "completed", "archived"];
        for (const exp of Object.values(experiments)) {
            expect(validStatuses).toContain(exp.status);
        }
    });

    it("all entries have at least 2 variants", () => {
        for (const exp of Object.values(experiments)) {
            expect(exp.variants.length).toBeGreaterThanOrEqual(2);
        }
    });
});

describe("getExperimentsByStatus", () => {
    it("returns empty array when no experiments match", () => {
        expect(getExperimentsByStatus("running")).toEqual([]);
    });

    it("returns array (not null/undefined)", () => {
        const result = getExperimentsByStatus("draft");
        expect(Array.isArray(result)).toBe(true);
    });
});

describe("getActiveExperimentsForPage", () => {
    it("returns empty array when no running experiments target page", () => {
        expect(getActiveExperimentsForPage("/nonexistent-page")).toEqual([]);
    });

    it("returns array (not null/undefined)", () => {
        const result = getActiveExperimentsForPage("/");
        expect(Array.isArray(result)).toBe(true);
    });
});
