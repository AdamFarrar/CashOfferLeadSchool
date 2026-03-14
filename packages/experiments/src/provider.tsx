"use client";

// =============================================================================
// ExperimentProvider — React Context Provider
// =============================================================================
// Manages experiment assignments for the current user and page.
// Updates active_experiments in the analytics context.
// =============================================================================

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { setActiveExperiments } from "@cols/analytics";
import { getActiveExperimentsForPage } from "./experiments";
import { getAssignment } from "./assignment";
import { recordExposure } from "./exposure";
import type { ExperimentAssignment } from "./types";

interface ExperimentContextValue {
    /** All active assignments for the current page */
    assignments: ExperimentAssignment[];
    /** Get the variant for a specific experiment (or null if not assigned) */
    getVariant: (experimentKey: string) => string | null;
}

const ExperimentContext = createContext<ExperimentContextValue>({
    assignments: [],
    getVariant: () => null,
});

interface ExperimentProviderProps {
    userId: string;
    children: ReactNode;
}

export function ExperimentProvider({ userId, children }: ExperimentProviderProps) {
    const pathname = usePathname();

    const assignments = useMemo(() => {
        if (!userId) return [];

        const pageExperiments = getActiveExperimentsForPage(pathname);
        const results: ExperimentAssignment[] = [];

        for (const experiment of pageExperiments) {
            const assignment = getAssignment(experiment, userId);
            if (assignment) {
                results.push(assignment);
            }
        }

        return results;
    }, [userId, pathname]);

    // Update analytics context with active experiments
    useEffect(() => {
        if (assignments.length > 0) {
            setActiveExperiments(
                assignments.map((a) => ({ id: a.experimentKey, variant: a.variant })),
            );

            // Record exposure for all assignments
            for (const assignment of assignments) {
                recordExposure(assignment);
            }
        } else {
            setActiveExperiments([]);
        }
    }, [assignments]);

    const contextValue = useMemo<ExperimentContextValue>(() => ({
        assignments,
        getVariant: (key: string) => {
            const a = assignments.find((x) => x.experimentKey === key);
            return a?.variant ?? null;
        },
    }), [assignments]);

    return (
        <ExperimentContext.Provider value={contextValue}>
            {children}
        </ExperimentContext.Provider>
    );
}

/**
 * Hook to access experiment assignments and variants.
 */
export function useExperiment(experimentKey?: string) {
    const ctx = useContext(ExperimentContext);

    if (experimentKey) {
        return {
            variant: ctx.getVariant(experimentKey),
            isControl: ctx.getVariant(experimentKey) === "control" || ctx.getVariant(experimentKey) === null,
            isAssigned: ctx.getVariant(experimentKey) !== null,
        };
    }

    return ctx;
}
