// =============================================================================
// Experiment Types
// =============================================================================

export type ExperimentStatus = "draft" | "running" | "paused" | "completed" | "archived";

export interface ExperimentDefinition {
    /** Unique experiment identifier */
    key: string;
    /** Human-readable name */
    name: string;
    /** Description of the experiment hypothesis */
    description: string;
    /** Current lifecycle status */
    status: ExperimentStatus;
    /** Available variants (first is always control) */
    variants: string[];
    /** Traffic allocation percentage (0-100) */
    trafficPercentage: number;
    /** Pages where this experiment is relevant */
    targetPages: string[];
}

export interface ExperimentAssignment {
    experimentKey: string;
    variant: string;
    assignedAt: number;
}
