// =============================================================================
// @cocs/analytics — Contract Mapper (R2 Fix)
// =============================================================================
// Maps DomainEvent → existing EventContract for PostHog tracking.
// Preserves the existing typed contract system.
// =============================================================================

import type { DomainEvent } from "@cocs/events";
import type { EventContract } from "./types";
import {
    AuthRegistrationCompleted,
    AuthEmailVerificationCompleted,
    AuthLoginCompleted,
} from "./event-contracts";

interface MappedContract {
    contract: EventContract;
    properties: Record<string, unknown>;
}

/**
 * Map a DomainEvent to an existing analytics EventContract.
 * Returns null for events with no dedicated contract — tracked generically.
 */
export function resolveContract(event: DomainEvent): MappedContract | null {
    switch (event.eventKey) {
        case "user_registered":
            return {
                contract: AuthRegistrationCompleted,
                properties: {
                    method: (event.payload.method as string) ?? "email",
                    email_hash: (event.payload.emailHash as string) ?? "",
                },
            };

        case "email_verified":
            return {
                contract: AuthEmailVerificationCompleted,
                properties: {
                    time_to_verify_s: (event.payload.time_to_verify_s as number) ?? 0,
                },
            };

        // Future mappings added here as contracts are created
        default:
            return null;
    }
}
