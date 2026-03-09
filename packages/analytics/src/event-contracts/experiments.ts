// =============================================================================
// Event Contracts — Experiment Events
// =============================================================================
// Standardized exposure event. All experiment exposures must use this contract.
// Per-experiment exposure event names are NOT allowed.
// =============================================================================

export const ExperimentExposed = {
    name: "experiment.exposed",
    version: 1,
    description: "User is exposed to an experiment variant",
    properties: {
        experiment_id: "" as string,
        variant: "" as string,
    },
} as const;
