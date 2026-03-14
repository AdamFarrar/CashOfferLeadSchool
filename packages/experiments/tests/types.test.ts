import { describe, it, expect } from "vitest";
import type { ExperimentStatus, ExperimentDefinition, ExperimentAssignment } from "../src/types";

// =============================================================================
// Experiment Types Contract Tests
// =============================================================================

describe("ExperimentStatus", () => {
    it("defines all lifecycle states", () => {
        const statuses: ExperimentStatus[] = ["draft", "running", "paused", "completed", "archived"];
        expect(statuses).toHaveLength(5);
    });
});

describe("ExperimentDefinition", () => {
    it("satisfies the full interface", () => {
        const def: ExperimentDefinition = {
            key: "test_exp",
            name: "Test",
            description: "desc",
            status: "draft",
            variants: ["control", "variant_a"],
            trafficPercentage: 50,
            targetPages: ["/"],
        };
        expect(def.key).toBe("test_exp");
        expect(def.variants[0]).toBe("control");
    });
});

describe("ExperimentAssignment", () => {
    it("satisfies the full interface", () => {
        const assignment: ExperimentAssignment = {
            experimentKey: "test_exp",
            variant: "control",
            assignedAt: Date.now(),
        };
        expect(assignment.experimentKey).toBe("test_exp");
        expect(typeof assignment.assignedAt).toBe("number");
    });
});
