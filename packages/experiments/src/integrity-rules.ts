// =============================================================================
// Integrity Rules — Experiment Governance
// =============================================================================
// Enforced rules to prevent experiment contamination and data corruption.
// =============================================================================

import type { ExperimentDefinition } from "./types";

/**
 * Rule 1: Control variant must always be the first variant.
 * Control represents current production behavior.
 */
export function validateControlVariant(experiment: ExperimentDefinition): boolean {
    return experiment.variants[0] === "control";
}

/**
 * Rule 2: Traffic percentage must be between 0 and 100.
 */
export function validateTrafficPercentage(experiment: ExperimentDefinition): boolean {
    return experiment.trafficPercentage >= 0 && experiment.trafficPercentage <= 100;
}

/**
 * Rule 3: Experiment must have at least 2 variants.
 */
export function validateMinVariants(experiment: ExperimentDefinition): boolean {
    return experiment.variants.length >= 2;
}

/**
 * Rule 4: No duplicate variant names.
 */
export function validateUniqueVariants(experiment: ExperimentDefinition): boolean {
    return new Set(experiment.variants).size === experiment.variants.length;
}

/**
 * Rule 5: Experiment key must be snake_case.
 */
export function validateKeyFormat(experiment: ExperimentDefinition): boolean {
    return /^[a-z][a-z0-9_]*$/.test(experiment.key);
}

/**
 * Validate all integrity rules for an experiment.
 * Returns list of violations (empty = valid).
 */
export function validateExperiment(experiment: ExperimentDefinition): string[] {
    const violations: string[] = [];

    if (!validateControlVariant(experiment)) {
        violations.push("First variant must be 'control'");
    }
    if (!validateTrafficPercentage(experiment)) {
        violations.push("Traffic percentage must be between 0 and 100");
    }
    if (!validateMinVariants(experiment)) {
        violations.push("Experiment must have at least 2 variants");
    }
    if (!validateUniqueVariants(experiment)) {
        violations.push("Variant names must be unique");
    }
    if (!validateKeyFormat(experiment)) {
        violations.push("Experiment key must be lowercase snake_case");
    }

    return violations;
}
