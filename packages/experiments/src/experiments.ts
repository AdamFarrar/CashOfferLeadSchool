// =============================================================================
// Experiment Registry
// =============================================================================
// Central registry of all experiments. Add new experiments here.
// Rule: control variant MUST represent current production behavior.
// =============================================================================

import type { ExperimentDefinition } from "./types";

/**
 * All registered experiments.
 * Experiments in "draft" status are not active.
 */
export const experiments: Record<string, ExperimentDefinition> = {
    // Example experiment — uncomment when ready
    // cta_copy_test: {
    //     key: "cta_copy_test",
    //     name: "CTA Copy Test",
    //     description: "Test whether 'Start Free' outperforms 'Get Started' on the landing page",
    //     status: "draft",
    //     variants: ["control", "start_free"],
    //     trafficPercentage: 50,
    //     targetPages: ["/"],
    // },
};

/**
 * Get all experiments with a given status.
 */
export function getExperimentsByStatus(status: ExperimentDefinition["status"]): ExperimentDefinition[] {
    return Object.values(experiments).filter((e) => e.status === status);
}

/**
 * Get experiments relevant to a specific page path.
 * Only returns experiments in "running" status.
 */
export function getActiveExperimentsForPage(pathname: string): ExperimentDefinition[] {
    return Object.values(experiments).filter(
        (e) => e.status === "running" && e.targetPages.includes(pathname),
    );
}
