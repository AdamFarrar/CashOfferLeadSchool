// =============================================================================
// @cocs/automation — Automatable Events Registry (R1 Fix)
// =============================================================================
// Explicit list of events the automation orchestrator subscribes to.
// Events NOT in this list are NOT processed by automation.
// =============================================================================

import { DOMAIN_EVENTS, type DomainEventKey } from "@cocs/events";

/**
 * Events that the automation orchestrator listens to.
 * Add events here to make them automatable.
 * Events NOT listed here will still fire to analytics (wildcard listener).
 */
export const AUTOMATION_EVENTS: DomainEventKey[] = [
    DOMAIN_EVENTS.USER_REGISTERED,
    DOMAIN_EVENTS.VERIFICATION_EMAIL_REQUESTED,
    DOMAIN_EVENTS.PASSWORD_REQUESTED,
    DOMAIN_EVENTS.QUALIFICATION_SUBMITTED,
    DOMAIN_EVENTS.FEEDBACK_SUBMITTED,
    DOMAIN_EVENTS.ENROLLMENT_COMPLETED,
    DOMAIN_EVENTS.EPISODE_COMPLETED,
    DOMAIN_EVENTS.NOTE_CREATED,
    DOMAIN_EVENTS.BOOKING_SUBMITTED,
];
