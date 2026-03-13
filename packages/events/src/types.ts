// =============================================================================
// @cocs/events — Domain Event Types
// =============================================================================
// Canonical event model for the platform. DomainEvent is the authoritative
// system event. All side effects flow through emitDomainEvent().
// =============================================================================

export const DOMAIN_EVENTS = {
    USER_REGISTERED: "user_registered",
    VERIFICATION_EMAIL_REQUESTED: "verification_email_requested",
    EMAIL_VERIFIED: "email_verified",
    PASSWORD_REQUESTED: "password_requested",
    QUALIFICATION_SUBMITTED: "qualification_submitted",
    FEEDBACK_SUBMITTED: "feedback_submitted",
    TEMPLATE_PUBLISHED: "template_published",
    AUTOMATION_RULE_CHANGED: "automation_rule_changed",
    ENROLLMENT_COMPLETED: "enrollment_completed",
    EPISODE_COMPLETED: "episode_completed",
    NOTE_CREATED: "note_created",
    BOOKING_SUBMITTED: "booking_submitted",
} as const;

export type DomainEventKey = typeof DOMAIN_EVENTS[keyof typeof DOMAIN_EVENTS];

// ── Actor: who caused this event ──
export interface EventActor {
    type: "user" | "system" | "automation" | "admin";
    id: string;
}

// ── Subject: what entity this event is about ──
export interface EventSubject {
    type: string;
    id: string;
}

// ── Full Event Envelope ──
export interface DomainEvent {
    // Identity
    eventId: string;
    eventKey: DomainEventKey;
    eventVersion: number;

    // Lineage
    correlationId: string;
    causationId: string | null;

    // Context
    actor: EventActor;
    subject: EventSubject;
    organizationId: string | null;

    // Data
    payload: Record<string, unknown>;

    // Timing
    occurredAt: string;

    // Metadata
    metadata?: Record<string, unknown>;
}

// ── Emit Options (caller-facing) ──
export interface EmitOptions {
    eventKey: DomainEventKey;
    payload: Record<string, unknown>;
    actor: EventActor;
    subject: EventSubject;
    organizationId?: string | null;
    correlationId?: string;
    causationId?: string | null;
    metadata?: Record<string, unknown>;
}

// ── Listener Type ──
export type DomainEventListener = (event: DomainEvent) => Promise<void>;
