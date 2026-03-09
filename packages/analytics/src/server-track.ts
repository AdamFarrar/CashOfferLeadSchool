// =============================================================================
// Server-Side Track Helper — D15
// =============================================================================
// Identical EventEnvelope format as client-side track().
// For use in Server Actions, API routes, and background jobs.
// Uses posthog-node (or falls back to HTTP POST).
// =============================================================================

import type { EventContract, ContractProperties } from "./types";
import type { EventEnvelope } from "./event-envelope";
import { generateEventId } from "./utils";

interface ServerContext {
    userId: string;
    organizationId?: string;
    sessionId?: string;
    activeExperiments?: { id: string; variant: string }[];
}

// generateEventId imported from ./utils

/**
 * Track an analytics event from the server.
 * Constructs an identical EventEnvelope to client-side track().
 *
 * @param contract - The event contract
 * @param properties - Typed properties matching the contract
 * @param context - Server context (userId, organizationId, etc.)
 */
export async function serverTrack<C extends EventContract>(
    contract: C,
    properties: ContractProperties<C>,
    context: ServerContext,
): Promise<void> {
    const envelope: EventEnvelope<ContractProperties<C>> = {
        event_id: generateEventId(),
        event_name: contract.name,
        event_version: contract.version,
        timestamp: Date.now(),
        user_id: context.userId,
        organization_id: context.organizationId,
        session_id: context.sessionId,
        properties,
    };

    if (context.activeExperiments && context.activeExperiments.length > 0) {
        envelope.active_experiments = context.activeExperiments;
    }

    const apiKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (!apiKey) return; // no-op without API key

    try {
        await fetch(`${host}/capture/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: apiKey,
                event: envelope.event_name,
                distinct_id: context.userId,
                properties: {
                    ...envelope,
                    ...properties,
                },
                timestamp: new Date(envelope.timestamp).toISOString(),
            }),
        });
    } catch (err) {
        console.error("[analytics:server] Failed to send event:", envelope.event_name, err);
    }
}
