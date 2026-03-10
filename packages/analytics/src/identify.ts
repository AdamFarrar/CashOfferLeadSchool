// =============================================================================
// User Identification
// =============================================================================
// Identifies users in PostHog and sets analytics context.
// Called during auth flow (login/register completion).
// =============================================================================

import { setAnalyticsContext } from "./track";
import { resolveUserCohort, isInternalUser, isStakeholderUser } from "./traffic-context";

/**
 * Identify a user for analytics. Sets person properties in PostHog
 * and updates the analytics context for future events.
 *
 * @param userId - The authenticated user's ID
 * @param traits - Optional person properties (no PII!)
 */
export async function identify(
    userId: string,
    traits?: {
        organizationId?: string;
        createdAt?: string;
        emailVerified?: boolean;
    },
) {
    setAnalyticsContext(userId, traits?.organizationId);

    try {
        const posthogModule = await import("posthog-js");
        const posthog = posthogModule.default;

        posthog.identify(userId, {
            organization_id: traits?.organizationId,
            created_at: traits?.createdAt,
            email_verified: traits?.emailVerified,
            // Traffic segmentation person properties
            user_cohort: resolveUserCohort(userId),
            is_internal: isInternalUser(userId),
            is_stakeholder: isStakeholderUser(userId),
        });
    } catch {
        // PostHog not available
    }
}

/**
 * Reset analytics identity (on logout).
 */
export async function resetIdentity() {
    setAnalyticsContext(undefined, undefined);

    try {
        const posthogModule = await import("posthog-js");
        const posthog = posthogModule.default;
        posthog.reset();
    } catch {
        // PostHog not available
    }
}
