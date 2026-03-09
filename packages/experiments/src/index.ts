// =============================================================================
// @cocs/experiments — Barrel Export
// =============================================================================

export { ExperimentProvider, useExperiment } from "./provider";
export { experiments, getExperimentsByStatus, getActiveExperimentsForPage } from "./experiments";
export { getAssignment } from "./assignment";
export { recordExposure } from "./exposure";
export { isFeatureEnabled, setFeatureFlag, clearFeatureFlags } from "./flags";
export { validateExperiment } from "./integrity-rules";
export type { ExperimentDefinition, ExperimentAssignment, ExperimentStatus } from "./types";
