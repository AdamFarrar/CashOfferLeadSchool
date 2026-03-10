// =============================================================================
// Canonical Event Envelope — D15
// =============================================================================
// All analytics events are wrapped in this envelope before being sent.
// Prevents schema drift, supports warehouse pipelines, enables ML features,
// and guarantees consistent metadata across client and server.
// =============================================================================

import type { TrafficContext } from "./traffic-context";

export interface EventEnvelope<T extends Record<string, unknown>> {
    // Identity
    event_id: string;
    event_name: string;
    event_version: number;
    timestamp: number;

    // Context
    user_id?: string;
    organization_id?: string;
    session_id?: string;

    // Experiments
    active_experiments?: {
        id: string;
        variant: string;
    }[];

    // Traffic Segmentation (Phase 1.7.1E)
    segmentation?: TrafficContext;

    // Typed event properties
    properties: T;
}

