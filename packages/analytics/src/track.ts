// =============================================================================
// Typed Analytics Track Helper — Client-Side
// =============================================================================
// Single entry point for all client-side analytics events.
// Constructs a canonical EventEnvelope and sends via PostHog.
//
// Usage:
//   import { track } from "@cols/analytics";
//   import { FunnelCtaClicked } from "@cols/analytics/event-contracts";
//   track(FunnelCtaClicked, { cta_id: "hero", cta_text: "Get Started", section: "hero" });
// =============================================================================

import type { EventContract, ContractProperties } from "./types";
import type { EventEnvelope } from "./event-envelope";
import { generateEventId } from "./utils";
import { buildTrafficContext } from "./traffic-context";
import type { TrafficSource } from "./traffic-context";

type PostHogInstance = {
    capture: (event: string, properties: Record<string, unknown>) => void;
};

let _posthog: PostHogInstance | null = null;
let _posthogLoading = false;

// Auth context getters — set via identify()
let _userId: string | undefined;
let _organizationId: string | undefined;

// Experiment context — set via ExperimentProvider
let _activeExperiments: { id: string; variant: string }[] = [];

// Traffic source override — set via setTrafficSource()
let _trafficSourceOverride: TrafficSource | undefined;

/**
 * Set the current user context for analytics.
 * Called by identify() during auth flow.
 */
export function setAnalyticsContext(userId?: string, organizationId?: string) {
    _userId = userId;
    _organizationId = organizationId;
}

/**
 * Set the active experiments for analytics enrichment.
 * Called by ExperimentProvider on experiment state changes.
 */
export function setActiveExperiments(experiments: { id: string; variant: string }[]) {
    _activeExperiments = experiments;
}

/**
 * Set the traffic source for analytics events (e.g., "admin" on admin pages).
 */
export function setTrafficSource(source: TrafficSource | undefined) {
    _trafficSourceOverride = source;
}

/**
 * Lazily load PostHog SDK. Returns null if no API key is set.
 */
async function getPostHog(): Promise<PostHogInstance | null> {
    if (_posthog) return _posthog;
    if (_posthogLoading) return null;

    const key = typeof window !== "undefined"
        ? ((window as unknown as Record<string, unknown>).__NEXT_PUBLIC_POSTHOG_KEY as string | undefined)
        ?? process.env.NEXT_PUBLIC_POSTHOG_KEY
        : undefined;

    if (!key) return null;

    _posthogLoading = true;

    try {
        const posthogModule = await import("posthog-js");
        const posthog = posthogModule.default;
        posthog.init(key, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
            loaded: (ph: PostHogInstance) => {
                _posthog = ph;
            },
            capture_pageview: false, // we track manually
            capture_pageleave: true,
            persistence: "localStorage+cookie",
        });
        _posthog = posthog as unknown as PostHogInstance;
        return _posthog;
    } catch {
        _posthogLoading = false;
        return null;
    }
}

// generateEventId imported from ./utils

/**
 * Get session_id from PostHog if available.
 */
function getSessionId(): string | undefined {
    try {
        if (_posthog && "get_session_id" in _posthog) {
            return ((_posthog as Record<string, unknown>).get_session_id as () => string)?.();
        }
    } catch {
        // ignore
    }
    return undefined;
}

/**
 * Track an analytics event using a typed event contract.
 * Constructs a canonical EventEnvelope and sends via PostHog.
 *
 * @param contract - The event contract (e.g., FunnelCtaClicked)
 * @param properties - Typed properties matching the contract
 */
export async function track<C extends EventContract>(
    contract: C,
    properties: ContractProperties<C>,
): Promise<void> {
    const envelope: EventEnvelope<ContractProperties<C>> = {
        event_id: generateEventId(),
        event_name: contract.name,
        event_version: contract.version,
        timestamp: Date.now(),
        user_id: _userId,
        organization_id: _organizationId,
        session_id: getSessionId(),
        segmentation: buildTrafficContext(_userId, _trafficSourceOverride),
        properties,
    };

    // Only include active_experiments when non-empty
    if (_activeExperiments.length > 0) {
        envelope.active_experiments = [..._activeExperiments];
    }

    const posthog = await getPostHog();
    if (!posthog) return; // no-op without PostHog

    // Send flattened envelope as PostHog event
    // Segmentation fields spread at top level for PostHog dashboard filtering
    posthog.capture(envelope.event_name, {
        ...envelope,
        ...properties,
        ...(envelope.segmentation ?? {}),
    });
}
