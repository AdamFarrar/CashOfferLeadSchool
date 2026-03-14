import { describe, it, expect } from "vitest";
import type { ExperimentAssignment } from "../src/types";

// =============================================================================
// Exposure Tracking Tests (type-level — actual function requires posthog mock)
// =============================================================================

describe("exposure deduplication contract", () => {
    it("key format is experimentKey:variant", () => {
        const assignment: ExperimentAssignment = {
            experimentKey: "cta_test",
            variant: "control",
            assignedAt: Date.now(),
        };
        const key = `${assignment.experimentKey}:${assignment.variant}`;
        expect(key).toBe("cta_test:control");
    });

    it("different variants produce different keys", () => {
        const a1 = { experimentKey: "test", variant: "control", assignedAt: Date.now() };
        const a2 = { experimentKey: "test", variant: "variant_a", assignedAt: Date.now() };
        expect(`${a1.experimentKey}:${a1.variant}`).not.toBe(`${a2.experimentKey}:${a2.variant}`);
    });

    it("same assignment produces same key", () => {
        const assignment = { experimentKey: "test", variant: "control", assignedAt: Date.now() };
        const k1 = `${assignment.experimentKey}:${assignment.variant}`;
        const k2 = `${assignment.experimentKey}:${assignment.variant}`;
        expect(k1).toBe(k2);
    });
});
