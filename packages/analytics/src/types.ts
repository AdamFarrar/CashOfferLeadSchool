// =============================================================================
// Contract Type System
// =============================================================================
// Shared types for event contracts used by track() and serverTrack().
// =============================================================================

export interface EventContract {
    readonly name: string;
    readonly version: number;
    readonly description: string;
    readonly properties: Record<string, unknown>;
}

/**
 * Extract the properties type from an event contract.
 * Strips the `as const` marker to get the writable type.
 */
export type ContractProperties<C extends EventContract> = {
    [K in keyof C["properties"]]: C["properties"][K];
};
