import { describe, it, expect } from "vitest";

import {
    validateControlVariant,
    validateTrafficPercentage,
    validateMinVariants,
    validateUniqueVariants,
    validateKeyFormat,
    validateExperiment,
} from "../packages/experiments/src/integrity-rules";
import type { ExperimentDefinition } from "../packages/experiments/src/types";

// =============================================================================
// Experiment Integrity Rules Tests
// =============================================================================

function makeExperiment(overrides: Partial<ExperimentDefinition> = {}): ExperimentDefinition {
    return {
        key: "valid_experiment",
        name: "Valid",
        description: "A valid experiment",
        status: "running",
        variants: ["control", "variant_a"],
        trafficPercentage: 50,
        targetPages: ["/"],
        ...overrides,
    };
}

describe("Experiment Integrity Rules", () => {
    describe("validateControlVariant", () => {
        it("passes when first variant is 'control'", () => {
            expect(validateControlVariant(makeExperiment())).toBe(true);
        });

        it("fails when first variant is not 'control'", () => {
            expect(validateControlVariant(makeExperiment({ variants: ["variant_a", "control"] }))).toBe(false);
        });
    });

    describe("validateTrafficPercentage", () => {
        it("passes for 0%", () => {
            expect(validateTrafficPercentage(makeExperiment({ trafficPercentage: 0 }))).toBe(true);
        });

        it("passes for 100%", () => {
            expect(validateTrafficPercentage(makeExperiment({ trafficPercentage: 100 }))).toBe(true);
        });

        it("fails for negative", () => {
            expect(validateTrafficPercentage(makeExperiment({ trafficPercentage: -1 }))).toBe(false);
        });

        it("fails for > 100", () => {
            expect(validateTrafficPercentage(makeExperiment({ trafficPercentage: 101 }))).toBe(false);
        });
    });

    describe("validateMinVariants", () => {
        it("passes with 2 variants", () => {
            expect(validateMinVariants(makeExperiment())).toBe(true);
        });

        it("fails with 1 variant", () => {
            expect(validateMinVariants(makeExperiment({ variants: ["control"] }))).toBe(false);
        });

        it("fails with 0 variants", () => {
            expect(validateMinVariants(makeExperiment({ variants: [] }))).toBe(false);
        });
    });

    describe("validateUniqueVariants", () => {
        it("passes with unique variants", () => {
            expect(validateUniqueVariants(makeExperiment())).toBe(true);
        });

        it("fails with duplicate variants", () => {
            expect(validateUniqueVariants(makeExperiment({ variants: ["control", "control"] }))).toBe(false);
        });
    });

    describe("validateKeyFormat", () => {
        it("passes with snake_case", () => {
            expect(validateKeyFormat(makeExperiment({ key: "my_experiment" }))).toBe(true);
        });

        it("passes with single word", () => {
            expect(validateKeyFormat(makeExperiment({ key: "experiment" }))).toBe(true);
        });

        it("fails with uppercase", () => {
            expect(validateKeyFormat(makeExperiment({ key: "MyExperiment" }))).toBe(false);
        });

        it("fails with hyphens", () => {
            expect(validateKeyFormat(makeExperiment({ key: "my-experiment" }))).toBe(false);
        });

        it("fails starting with number", () => {
            expect(validateKeyFormat(makeExperiment({ key: "1experiment" }))).toBe(false);
        });
    });

    describe("validateExperiment (aggregate)", () => {
        it("returns empty array for valid experiment", () => {
            expect(validateExperiment(makeExperiment())).toEqual([]);
        });

        it("returns all violations for an invalid experiment", () => {
            const violations = validateExperiment(makeExperiment({
                key: "Bad-Key",
                variants: ["variant_a"],
                trafficPercentage: 200,
            }));
            expect(violations.length).toBeGreaterThanOrEqual(3);
            expect(violations).toContain("First variant must be 'control'");
            expect(violations).toContain("Traffic percentage must be between 0 and 100");
            expect(violations).toContain("Experiment must have at least 2 variants");
            expect(violations).toContain("Experiment key must be lowercase snake_case");
        });
    });
});
