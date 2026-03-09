// =============================================================================
// @cocs/events — Listener Registry
// =============================================================================
// Manages per-event and wildcard (all-event) listener subscriptions.
// Listeners are functions that receive a DomainEvent and return a Promise.
// =============================================================================

import type { DomainEventKey, DomainEventListener } from "./types";

// Per-event listeners
const _listeners = new Map<DomainEventKey, DomainEventListener[]>();

// Wildcard listeners (fire for every event)
const _wildcardListeners: DomainEventListener[] = [];

/**
 * Register a listener for a specific event key.
 */
export function registerListener(
    eventKey: DomainEventKey,
    listener: DomainEventListener,
): void {
    const existing = _listeners.get(eventKey) ?? [];
    existing.push(listener);
    _listeners.set(eventKey, existing);
}

/**
 * Register a listener that fires for ALL events.
 * Used by analytics (must track everything unconditionally).
 */
export function registerListenerAll(listener: DomainEventListener): void {
    _wildcardListeners.push(listener);
}

/**
 * Get all listeners for a given event key.
 * Returns per-event listeners + all wildcard listeners.
 */
export function getListeners(eventKey: DomainEventKey): DomainEventListener[] {
    const specific = _listeners.get(eventKey) ?? [];
    return [...specific, ..._wildcardListeners];
}

/**
 * Clear all listeners. Used in tests only.
 */
export function clearAllListeners(): void {
    _listeners.clear();
    _wildcardListeners.length = 0;
}
