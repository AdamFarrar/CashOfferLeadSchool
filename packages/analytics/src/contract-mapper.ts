// =============================================================================
// @cocs/analytics — Contract Mapper (R2 Fix)
// =============================================================================
// Maps DomainEvent → existing EventContract for PostHog tracking.
// Preserves the existing typed contract system.
// =============================================================================

import type { DomainEvent } from "@cocs/events";
import type { EventContract } from "./types";
import {
    AuthEmailVerificationCompleted,
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
        // NOTE: user_registered is NOT mapped here because register/page.tsx
        // already fires AuthRegistrationCompleted client-side. Mapping it here
        // would cause a double-fire. The client-side event is preferred because
        // it includes session_id and user context.

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
