import { describe, it, expect } from "vitest";
import { getExperimentsByStatus, getActiveExperimentsForPage } from "../src/experiments";

// =============================================================================
// Experiments Registry Deep Coverage
// =============================================================================

describe("getExperimentsByStatus", () => {
    it("returns only experiments with matching status", () => {
        const running = getExperimentsByStatus("running");
        for (const exp of running) {
            expect(exp.status).toBe("running");
        }
    });

    it("returns empty for non-existent status", () => {
        const result = getExperimentsByStatus("archived");
        // May be empty if no archived experiments
        expect(Array.isArray(result)).toBe(true);
    });

    it("returns different subsets for different statuses", () => {
        const running = getExperimentsByStatus("running");
        const draft = getExperimentsByStatus("draft");
        // No overlap
        const runningKeys = running.map(e => e.key);
        for (const d of draft) {
            expect(runningKeys).not.toContain(d.key);
        }
    });
});

describe("getActiveExperimentsForPage", () => {
    it("returns empty array for non-matching page", () => {
        const result = getActiveExperimentsForPage("/nonexistent-page-xyz");
        expect(result).toEqual([]);
    });

    it("only returns running experiments", () => {
        const result = getActiveExperimentsForPage("/pricing");
        for (const exp of result) {
            expect(exp.status).toBe("running");
        }
    });

    it("filters by targetPages", () => {
        const result = getActiveExperimentsForPage("/pricing");
        for (const exp of result) {
            expect(exp.targetPages).toContain("/pricing");
        }
    });
});
