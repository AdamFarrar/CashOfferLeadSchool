// =============================================================================
// @cocs/events — Domain Event Emitter
// =============================================================================
// Single entry point for all side effects. Business code calls
// emitDomainEvent() — listeners handle the rest.
// Promise.allSettled ensures one listener failure cannot crash others.
// =============================================================================

import type { DomainEvent, EmitOptions } from "./types";
import { getListeners } from "./registry";

/**
 * Emit a domain event. All registered listeners are invoked with
 * Promise.allSettled — one failure does not affect others or the caller.
 */
export async function emitDomainEvent(options: EmitOptions): Promise<void> {
    const event: DomainEvent = {
        eventId: crypto.randomUUID(),
        eventKey: options.eventKey,
        eventVersion: 1,
        correlationId: options.correlationId ?? crypto.randomUUID(),
        causationId: options.causationId ?? null,
        actor: options.actor,
        subject: options.subject,
        organizationId: options.organizationId ?? null,
        payload: options.payload,
        occurredAt: new Date().toISOString(),
        metadata: options.metadata,
    };

    const listeners = getListeners(event.eventKey);

    if (listeners.length === 0) {
        console.warn(`[EVENTS] No listeners for "${event.eventKey}" (id=${event.eventId})`);
        return;
    }

    console.info(
        `[EVENTS] emitted | event=${event.eventKey} id=${event.eventId} ` +
        `correlation=${event.correlationId} listeners=${listeners.length}`
    );

    const results = await Promise.allSettled(
        listeners.map(fn =>
            fn(event).catch(err => {
                console.error(
                    `[EVENTS] Listener failed | event=${event.eventKey} ` +
                    `id=${event.eventId} correlation=${event.correlationId}`,
                    err
                );
                throw err;
            })
        )
    );

    const failed = results.filter(r => r.status === "rejected").length;
    if (failed > 0) {
        console.error(
            `[EVENTS] ${failed}/${results.length} listeners failed | ` +
            `event=${event.eventKey} id=${event.eventId}`
        );
    }
}
