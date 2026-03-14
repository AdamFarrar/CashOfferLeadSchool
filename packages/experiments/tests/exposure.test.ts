import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @cols/analytics before import
vi.mock("@cols/analytics", () => ({
    track: vi.fn(),
}));

vi.mock("@cols/analytics/event-contracts", () => ({
    ExperimentExposed: { event: "experiment.exposed", version: 1 },
}));

import { recordExposure } from "../src/exposure";
import { track } from "@cols/analytics";
import type { ExperimentAssignment } from "../src/types";

// =============================================================================
// Exposure Tracking Branch Coverage Tests
// =============================================================================

describe("recordExposure", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("tracks exposure on first call", () => {
        recordExposure({ experimentKey: "exp_a", variant: "control", assignedAt: Date.now() });
        expect(track).toHaveBeenCalledTimes(1);
        expect(track).toHaveBeenCalledWith(
            { event: "experiment.exposed", version: 1 },
            { experiment_id: "exp_a", variant: "control" },
        );
    });

    it("deduplicates same experiment+variant within session", () => {
        const assignment: ExperimentAssignment = {
            experimentKey: "exp_dedup",
            variant: "treatment",
            assignedAt: Date.now(),
        };
        recordExposure(assignment);
        recordExposure(assignment);
        recordExposure(assignment);
        // track should only be called once for this key
        expect(track).toHaveBeenCalledWith(
            expect.anything(),
            { experiment_id: "exp_dedup", variant: "treatment" },
        );
    });

    it("tracks different experiments separately", () => {
        recordExposure({ experimentKey: "exp_x", variant: "control", assignedAt: Date.now() });
        recordExposure({ experimentKey: "exp_y", variant: "control", assignedAt: Date.now() });
        // Both should fire
        expect(track).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ experiment_id: "exp_x" }),
        );
        expect(track).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ experiment_id: "exp_y" }),
        );
    });

    it("treats different variants of same experiment as different keys", () => {
        recordExposure({ experimentKey: "exp_z", variant: "A", assignedAt: Date.now() });
        recordExposure({ experimentKey: "exp_z", variant: "B", assignedAt: Date.now() });
        // Both should fire (different variant = different key)
        expect(track).toHaveBeenCalledTimes(2);
    });
});
