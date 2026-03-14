import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAssignment } from "../src/assignment";
import type { ExperimentDefinition, ExperimentAssignment } from "../src/types";

// =============================================================================
// Deep Branch Coverage Tests for Assignment
// =============================================================================

// Mock localStorage for cache coverage
const storage: Record<string, string> = {};
const localStorageMock = {
    getItem: vi.fn((key: string) => storage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storage[key]; }),
};

function makeExperiment(overrides: Partial<ExperimentDefinition> = {}): ExperimentDefinition {
    return {
        key: "test_exp",
        name: "Test Experiment",
        description: "Test",
        status: "running",
        variants: ["control", "treatment"],
        trafficPercentage: 100,
        targetPages: ["/pricing"],
        ...overrides,
    };
}

describe("getAssignment branch coverage", () => {
    beforeEach(() => {
        // Clear localStorage mock
        Object.keys(storage).forEach(k => delete storage[k]);
        vi.stubGlobal("window", { localStorage: localStorageMock });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
    });

    // --- Status gate branches ---

    it("returns null for draft experiments", () => {
        const exp = makeExperiment({ status: "draft" });
        expect(getAssignment(exp, "user-1")).toBeNull();
    });

    it("returns null for paused experiments", () => {
        const exp = makeExperiment({ status: "paused" });
        expect(getAssignment(exp, "user-2")).toBeNull();
    });

    it("returns null for archived experiments", () => {
        const exp = makeExperiment({ status: "archived" });
        expect(getAssignment(exp, "user-3")).toBeNull();
    });

    it("returns null for completed with no cached assignment", () => {
        const exp = makeExperiment({ status: "completed" });
        expect(getAssignment(exp, "user-4")).toBeNull();
    });

    // --- Cache hit branch ---

    it("returns assignment for running experiment", () => {
        const exp = makeExperiment();
        const result = getAssignment(exp, "user-5");
        expect(result).not.toBeNull();
        expect(["control", "treatment"]).toContain(result!.variant);
    });

    it("invalidates cached assignment when variant no longer exists", () => {
        const cached: ExperimentAssignment = {
            experimentKey: "test_exp",
            variant: "old_variant",
            assignedAt: Date.now(),
        };
        storage["cocs_exp_assignments"] = JSON.stringify({ test_exp: cached });

        const exp = makeExperiment({ variants: ["control", "treatment"] });
        const result = getAssignment(exp, "user-6");
        // Old variant cleared, new assignment created
        expect(result).not.toBeNull();
        expect(result!.variant).not.toBe("old_variant");
    });

    it("returns null for completed experiment without cached assignment", () => {
        const exp = makeExperiment({ status: "completed" });
        const result = getAssignment(exp, "user-7");
        // Completed experiments with no cached assignment return null
        expect(result).toBeNull();
    });

    // --- Traffic allocation branch ---

    it("respects traffic percentage (0% = nobody assigned)", () => {
        const exp = makeExperiment({ trafficPercentage: 0 });
        // 0% traffic means nobody gets assigned
        expect(getAssignment(exp, "user-8")).toBeNull();
    });

    it("100% traffic assigns everyone", () => {
        const exp = makeExperiment({ trafficPercentage: 100 });
        const result = getAssignment(exp, "user-9");
        expect(result).not.toBeNull();
    });

    // --- Deterministic assignment ---

    it("assigns same user to same variant consistently", () => {
        const exp = makeExperiment();
        // Clear cache between calls to test hash determinism
        const result1 = getAssignment(exp, "consistent-user");
        Object.keys(storage).forEach(k => delete storage[k]);
        const result2 = getAssignment(exp, "consistent-user");
        expect(result1!.variant).toBe(result2!.variant);
    });

    it("different users may get different variants", () => {
        const exp = makeExperiment();
        const variants = new Set<string>();
        for (let i = 0; i < 50; i++) {
            Object.keys(storage).forEach(k => delete storage[k]);
            const result = getAssignment(exp, `user-${i}`);
            if (result) variants.add(result.variant);
        }
        // With 50 users and 2 variants, both should appear
        expect(variants.size).toBe(2);
    });

    // --- No window branch (server-side) ---

    it("works without window (server-side)", () => {
        vi.unstubAllGlobals();
        if (typeof globalThis.window !== "undefined") {
            delete (globalThis as any).window;
        }

        const exp = makeExperiment();
        const result = getAssignment(exp, "server-user");
        // Should still work, just without caching
        expect(result).not.toBeNull();
    });

    // --- localStorage error branch ---

    it("handles localStorage exceptions gracefully", () => {
        localStorageMock.getItem.mockImplementation(() => { throw new Error("QuotaExceeded"); });
        const exp = makeExperiment();
        // Should not throw, just skip cache
        expect(() => getAssignment(exp, "user-error")).not.toThrow();
    });

    it("handles malformed localStorage data", () => {
        storage["cocs_exp_assignments"] = "not-valid-json{{{";
        // getItem returns our corrupted data
        localStorageMock.getItem.mockImplementation((key: string) => storage[key] ?? null);
        const exp = makeExperiment();
        // Should not throw, just discard bad cache
        expect(() => getAssignment(exp, "user-corrupt")).not.toThrow();
    });
});
