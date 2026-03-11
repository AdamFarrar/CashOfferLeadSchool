// =============================================================================
// @cocs/events — Listener Registry (globalThis Singleton)
// =============================================================================
// Uses globalThis to ensure a single registry instance across all Next.js
// bundle chunks. Without this, instrumentation.ts and API routes get
// separate module instances, causing listeners to be invisible across chunks.
// =============================================================================

import type { DomainEventKey, DomainEventListener } from "./types";

// Symbol key prevents collision with other libraries
const REGISTRY_KEY = Symbol.for("@cocs/events/registry");

interface RegistryState {
    listeners: Map<DomainEventKey, DomainEventListener[]>;
    wildcardListeners: DomainEventListener[];
}

function getRegistry(): RegistryState {
    const g = globalThis as any;
    if (!g[REGISTRY_KEY]) {
        g[REGISTRY_KEY] = {
            listeners: new Map<DomainEventKey, DomainEventListener[]>(),
            wildcardListeners: [] as DomainEventListener[],
        };
    }
    return g[REGISTRY_KEY];
}

/**
 * Register a listener for a specific event key.
 */
export function registerListener(
    eventKey: DomainEventKey,
    listener: DomainEventListener,
): void {
    const registry = getRegistry();
    const existing = registry.listeners.get(eventKey) ?? [];
    existing.push(listener);
    registry.listeners.set(eventKey, existing);
}

/**
 * Register a listener that fires for ALL events.
 * Used by analytics (must track everything unconditionally).
 */
export function registerListenerAll(listener: DomainEventListener): void {
    getRegistry().wildcardListeners.push(listener);
}

/**
 * Get all listeners for a given event key.
 * Returns per-event listeners + all wildcard listeners.
 */
export function getListeners(eventKey: DomainEventKey): DomainEventListener[] {
    const registry = getRegistry();
    const specific = registry.listeners.get(eventKey) ?? [];
    return [...specific, ...registry.wildcardListeners];
}

/**
 * Clear all listeners. Used in tests only.
 */
export function clearAllListeners(): void {
    const registry = getRegistry();
    registry.listeners.clear();
    registry.wildcardListeners.length = 0;
}
