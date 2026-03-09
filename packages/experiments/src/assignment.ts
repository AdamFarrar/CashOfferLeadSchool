// =============================================================================
// Deterministic Assignment
// =============================================================================
// Assigns users to experiment variants using deterministic hashing.
// Ensures consistent assignment across sessions and devices.
// Rule: completed experiments freeze assignments (analytics still records).
// =============================================================================

import type { ExperimentDefinition, ExperimentAssignment } from "./types";

const STORAGE_KEY = "cocs_exp_assignments";

/**
 * Simple deterministic hash for assignment stability.
 * Uses djb2 algorithm for performance.
 */
function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
}

/**
 * Get or create a deterministic variant assignment for a user + experiment.
 *
 * Assignment rules:
 * 1. If experiment is draft/paused/archived → return null (no assignment)
 * 2. If experiment is completed → return cached assignment (frozen)
 * 3. If experiment is running → assign deterministically based on user ID
 * 4. Assignments are cached in localStorage for consistency
 */
export function getAssignment(
    experiment: ExperimentDefinition,
    userId: string,
): ExperimentAssignment | null {
    // No assignment for inactive experiments
    if (["draft", "paused", "archived"].includes(experiment.status)) {
        return null;
    }

    // Check cached assignment
    const cached = getCachedAssignment(experiment.key);
    if (cached) {
        // Validate cached assignment is still valid
        if (experiment.variants.includes(cached.variant)) {
            return cached;
        }
        // Invalidate if variant no longer exists
        clearCachedAssignment(experiment.key);
    }

    // Completed experiments: no new assignments
    if (experiment.status === "completed") {
        return null;
    }

    // Running experiment: deterministic assignment
    const hash = hashString(`${userId}:${experiment.key}`);

    // Check traffic allocation
    if ((hash % 100) >= experiment.trafficPercentage) {
        return null; // Not in traffic allocation
    }

    // Assign variant
    const variantIndex = hash % experiment.variants.length;
    const assignment: ExperimentAssignment = {
        experimentKey: experiment.key,
        variant: experiment.variants[variantIndex]!,
        assignedAt: Date.now(),
    };

    // Cache assignment
    setCachedAssignment(assignment);

    return assignment;
}

// --- localStorage cache helpers ---

function getCachedAssignment(experimentKey: string): ExperimentAssignment | null {
    if (typeof window === "undefined") return null;
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;
        const assignments = JSON.parse(data) as Record<string, ExperimentAssignment>;
        return assignments[experimentKey] || null;
    } catch {
        return null;
    }
}

function setCachedAssignment(assignment: ExperimentAssignment): void {
    if (typeof window === "undefined") return;
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const assignments = data ? JSON.parse(data) as Record<string, ExperimentAssignment> : {};
        assignments[assignment.experimentKey] = assignment;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {
        // localStorage might be full or disabled
    }
}

function clearCachedAssignment(experimentKey: string): void {
    if (typeof window === "undefined") return;
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return;
        const assignments = JSON.parse(data) as Record<string, ExperimentAssignment>;
        delete assignments[experimentKey];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {
        // ignore
    }
}
