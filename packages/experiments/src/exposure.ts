// =============================================================================
// Experiment Exposure Tracking
// =============================================================================
// Records experiment exposure via the standardized experiment.exposed contract.
// Uses the track() helper from @cocs/analytics — never calls posthog.capture.
// =============================================================================

import { track } from "@cocs/analytics";
import { ExperimentExposed } from "@cocs/analytics/event-contracts";
import type { ExperimentAssignment } from "./types";

const _exposedSet = new Set<string>();

/**
 * Record that a user has been exposed to an experiment variant.
 * Only fires once per experiment per session to avoid duplicate exposure events.
 *
 * Uses the standardized `experiment.exposed` contract.
 */
export function recordExposure(assignment: ExperimentAssignment): void {
    const key = `${assignment.experimentKey}:${assignment.variant}`;

    // Deduplicate within session
    if (_exposedSet.has(key)) return;
    _exposedSet.add(key);

    track(ExperimentExposed, {
        experiment_id: assignment.experimentKey,
        variant: assignment.variant,
    });
}
