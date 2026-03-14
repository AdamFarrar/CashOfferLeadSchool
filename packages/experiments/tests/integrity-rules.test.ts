import { describe, it, expect } from "vitest";
import {
    validateControlVariant,
    validateTrafficPercentage,
    validateMinVariants,
    validateUniqueVariants,
    validateKeyFormat,
    validateExperiment,
} from "../src/integrity-rules";
import type { ExperimentDefinition } from "../src/types";

// =============================================================================
// Integrity Rules Tests
// =============================================================================

function makeExperiment(overrides: Partial<ExperimentDefinition> = {}): ExperimentDefinition {
    return {
        key: "test_experiment",
        name: "Test Experiment",
        description: "A test",
        status: "running",
        variants: ["control", "variant_a"],
        trafficPercentage: 50,
        targetPages: ["/"],
        ...overrides,
    };
}

describe("validateControlVariant", () => {
    it("passes when first variant is control", () => {
        expect(validateControlVariant(makeExperiment())).toBe(true);
    });

    it("fails when first variant is not control", () => {
        expect(validateControlVariant(makeExperiment({ variants: ["variant_a", "control"] }))).toBe(false);
    });

    it("fails when no control variant exists", () => {
        expect(validateControlVariant(makeExperiment({ variants: ["a", "b"] }))).toBe(false);
    });
});

describe("validateTrafficPercentage", () => {
    it("passes for 0%", () => {
        expect(validateTrafficPercentage(makeExperiment({ trafficPercentage: 0 }))).toBe(true);
    });

    it("passes for 100%", () => {
        expect(validateTrafficPercentage(makeExperiment({ trafficPercentage: 100 }))).toBe(true);
    });

    it("passes for 50%", () => {
        expect(validateTrafficPercentage(makeExperiment({ trafficPercentage: 50 }))).toBe(true);
    });

    it("fails for negative", () => {
        expect(validateTrafficPercentage(makeExperiment({ trafficPercentage: -1 }))).toBe(false);
    });

    it("fails for over 100", () => {
        expect(validateTrafficPercentage(makeExperiment({ trafficPercentage: 101 }))).toBe(false);
    });
});

describe("validateMinVariants", () => {
    it("passes with 2 variants", () => {
        expect(validateMinVariants(makeExperiment())).toBe(true);
    });

    it("passes with 5 variants", () => {
        expect(validateMinVariants(makeExperiment({ variants: ["control", "a", "b", "c", "d"] }))).toBe(true);
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
    it("passes for snake_case keys", () => {
        expect(validateKeyFormat(makeExperiment({ key: "cta_copy_test" }))).toBe(true);
    });

    it("passes for single word keys", () => {
        expect(validateKeyFormat(makeExperiment({ key: "onboarding" }))).toBe(true);
    });

    it("passes for keys with numbers", () => {
        expect(validateKeyFormat(makeExperiment({ key: "test_v2" }))).toBe(true);
    });

    it("fails for UPPERCASE", () => {
        expect(validateKeyFormat(makeExperiment({ key: "CTA_TEST" }))).toBe(false);
    });

    it("fails for kebab-case", () => {
        expect(validateKeyFormat(makeExperiment({ key: "cta-test" }))).toBe(false);
    });

    it("fails for leading numbers", () => {
        expect(validateKeyFormat(makeExperiment({ key: "2nd_test" }))).toBe(false);
    });
});

describe("validateExperiment", () => {
    it("returns empty array for valid experiment", () => {
        expect(validateExperiment(makeExperiment())).toEqual([]);
    });

    it("returns all violations for invalid experiment", () => {
        const violations = validateExperiment(makeExperiment({
            key: "INVALID-KEY",
            variants: ["not_control"],
            trafficPercentage: 150,
        }));
        expect(violations.length).toBeGreaterThanOrEqual(3);
        expect(violations).toContain("First variant must be 'control'");
        expect(violations).toContain("Traffic percentage must be between 0 and 100");
        expect(violations).toContain("Experiment must have at least 2 variants");
    });

    it("catches duplicate variant names", () => {
        const violations = validateExperiment(makeExperiment({
            variants: ["control", "control"],
        }));
        expect(violations).toContain("Variant names must be unique");
    });
});
