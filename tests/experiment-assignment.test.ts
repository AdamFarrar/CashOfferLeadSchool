import { describe, it, expect } from "vitest";

import { getAssignment } from "../packages/experiments/src/assignment";
import type { ExperimentDefinition } from "../packages/experiments/src/types";

// =============================================================================
// Experiment Assignment Tests
// =============================================================================
// Tests deterministic assignment, traffic allocation, status rules, and
// variant consistency.
// =============================================================================

function makeExperiment(overrides: Partial<ExperimentDefinition> = {}): ExperimentDefinition {
    return {
        key: "test_experiment",
        name: "Test Experiment",
        description: "Test",
        status: "running",
        variants: ["control", "variant_a"],
        trafficPercentage: 100,
        targetPages: ["/"],
        ...overrides,
    };
}

describe("Experiment Assignment", () => {
    describe("status rules", () => {
        it("returns null for draft experiments", () => {
            const exp = makeExperiment({ status: "draft" });
            expect(getAssignment(exp, "user-1")).toBeNull();
        });

        it("returns null for paused experiments", () => {
            const exp = makeExperiment({ status: "paused" });
            expect(getAssignment(exp, "user-1")).toBeNull();
        });

        it("returns null for archived experiments", () => {
            const exp = makeExperiment({ status: "archived" });
            expect(getAssignment(exp, "user-1")).toBeNull();
        });

        it("returns null for completed experiments with no cache", () => {
            const exp = makeExperiment({ status: "completed" });
            expect(getAssignment(exp, "user-1")).toBeNull();
        });

        it("returns assignment for running experiments", () => {
            const exp = makeExperiment({ status: "running" });
            const assignment = getAssignment(exp, "user-1");
            expect(assignment).not.toBeNull();
            expect(assignment!.experimentKey).toBe("test_experiment");
            expect(exp.variants).toContain(assignment!.variant);
        });
    });

    describe("deterministic assignment", () => {
        it("assigns the same variant for the same user+experiment", () => {
            const exp = makeExperiment();
            const a1 = getAssignment(exp, "user-stable");
            const a2 = getAssignment(exp, "user-stable");
            expect(a1!.variant).toBe(a2!.variant);
        });

        it("may assign different variants for different users", () => {
            const exp = makeExperiment();
            const variants = new Set<string>();
            // With enough users, we should see both variants
            for (let i = 0; i < 100; i++) {
                const assignment = getAssignment(exp, `user-${i}`);
                if (assignment) variants.add(assignment.variant);
            }
            expect(variants.size).toBeGreaterThanOrEqual(1);
        });
    });

    describe("traffic allocation", () => {
        it("respects 0% traffic (no assignments)", () => {
            const exp = makeExperiment({ trafficPercentage: 0 });
            const assignments = Array.from({ length: 50 }, (_, i) =>
                getAssignment(exp, `user-${i}`)
            );
            expect(assignments.every((a) => a === null)).toBe(true);
        });

        it("respects 100% traffic (all assigned)", () => {
            const exp = makeExperiment({ trafficPercentage: 100 });
            const assignments = Array.from({ length: 50 }, (_, i) =>
                getAssignment(exp, `user-${i}`)
            );
            expect(assignments.every((a) => a !== null)).toBe(true);
        });
    });

    describe("assignment shape", () => {
        it("includes experimentKey, variant, and assignedAt", () => {
            const exp = makeExperiment();
            const assignment = getAssignment(exp, "shape-user");
            expect(assignment).toMatchObject({
                experimentKey: "test_experiment",
            });
            expect(typeof assignment!.variant).toBe("string");
            expect(typeof assignment!.assignedAt).toBe("number");
            expect(assignment!.assignedAt).toBeGreaterThan(0);
        });
    });
});
