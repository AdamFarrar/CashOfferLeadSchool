import { describe, it, expect } from "vitest";
import { getAssignment } from "../src/assignment";
import type { ExperimentDefinition } from "../src/types";

// =============================================================================
// Deterministic Assignment Tests
// =============================================================================

function makeExperiment(overrides: Partial<ExperimentDefinition> = {}): ExperimentDefinition {
    return {
        key: "test_exp",
        name: "Test",
        description: "Test experiment",
        status: "running",
        variants: ["control", "variant_a"],
        trafficPercentage: 100,
        targetPages: ["/"],
        ...overrides,
    };
}

describe("getAssignment", () => {
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

    it("returns null for completed experiments without cached assignment", () => {
        const exp = makeExperiment({ status: "completed" });
        expect(getAssignment(exp, "user-1")).toBeNull();
    });

    it("assigns a variant for running experiments", () => {
        const exp = makeExperiment({ trafficPercentage: 100 });
        const assignment = getAssignment(exp, "user-1");
        expect(assignment).not.toBeNull();
        expect(assignment!.experimentKey).toBe("test_exp");
        expect(["control", "variant_a"]).toContain(assignment!.variant);
    });

    it("is deterministic — same user always gets same variant", () => {
        const exp = makeExperiment({ trafficPercentage: 100 });
        const a1 = getAssignment(exp, "user-stable");
        const a2 = getAssignment(exp, "user-stable");
        expect(a1!.variant).toBe(a2!.variant);
    });

    it("different users can get different variants", () => {
        const exp = makeExperiment({ trafficPercentage: 100 });
        const variants = new Set<string>();
        for (let i = 0; i < 50; i++) {
            const a = getAssignment(exp, `user-${i}`);
            if (a) variants.add(a.variant);
        }
        // With 50 users and 2 variants, both should appear
        expect(variants.size).toBe(2);
    });

    it("assigns timestamp on assignment", () => {
        const exp = makeExperiment({ trafficPercentage: 100 });
        const before = Date.now();
        const assignment = getAssignment(exp, "user-time");
        expect(assignment!.assignedAt).toBeGreaterThanOrEqual(before);
    });

    it("respects traffic percentage (0% = no one)", () => {
        const exp = makeExperiment({ trafficPercentage: 0 });
        // With 0%, nobody should be assigned
        let assigned = 0;
        for (let i = 0; i < 100; i++) {
            if (getAssignment(exp, `user-${i}`)) assigned++;
        }
        expect(assigned).toBe(0);
    });
});
