// =============================================================================
// @cols/analytics — Domain Event Bus Listener (R2 Fix)
// =============================================================================
// Wildcard listener: fires for EVERY domain event.
// Maps DomainEvent → EventEnvelope → serverTrack() → PostHog.
// =============================================================================

import { registerListenerAll, type DomainEvent } from "@cols/events";
import { serverTrack } from "./server-track";
import { resolveContract } from "./contract-mapper";

/**
 * Register the analytics listener on the domain event bus.
 * Wildcard subscription — fires unconditionally for every event.
 */
export function registerAnalyticsListener(): void {
    registerListenerAll(async (event: DomainEvent) => {
        try {
            const mapped = resolveContract(event);

            if (!mapped) {
                // No dedicated contract — track as generic event
                await serverTrack(
                    {
                        name: event.eventKey,
                        version: event.eventVersion,
                        description: "Domain event (unmapped)",
                        properties: {} as Record<string, never>,
                    },
                    event.payload as any,
                    {
                        userId: event.actor.id,
                        organizationId: event.organizationId ?? undefined,
                    },
                );
                return;
            }

            // Mapped contract — track with typed properties
            await serverTrack(mapped.contract, mapped.properties as any, {
                userId: event.actor.id,
                organizationId: event.organizationId ?? undefined,
            });
        } catch (err) {
            console.error(
                `[ANALYTICS] Listener error | event=${event.eventKey} id=${event.eventId}`,
                err,
            );
        }
    });

    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
        console.info("[ANALYTICS] Registered wildcard listener on domain event bus");
    }
}
