// =============================================================================
// D8: Conversion Metrics Definitions
// =============================================================================
// Defines the conversion funnel stages and metric calculations.
// Used by dashboards, reporting, and automated monitoring.
// =============================================================================

/**
 * Ordered funnel stages from top to bottom.
 * Each stage maps to a tracked event.
 */
export const FUNNEL_STAGES = [
    { key: "landing_viewed", event: "funnel.landing.viewed", label: "Landing Page" },
    { key: "cta_clicked", event: "funnel.cta.clicked", label: "CTA Clicked" },
    { key: "registration_started", event: "auth.registration.started", label: "Registration Started" },
    { key: "registration_completed", event: "auth.registration.completed", label: "Registration Completed" },
    { key: "email_verification_sent", event: "auth.email_verification.sent", label: "Verification Sent" },
    { key: "email_verification_completed", event: "auth.email_verification.completed", label: "Email Verified" },
    { key: "login_completed", event: "auth.login.completed", label: "Login Completed" },
    { key: "qualification_started", event: "qualification.started", label: "Qualification Started" },
    { key: "qualification_step_completed", event: "qualification.step.completed", label: "Step Completed" },
    { key: "qualification_submitted", event: "qualification.submitted", label: "Qualification Submitted" },
    { key: "confirmation_viewed", event: "qualification.confirmation.viewed", label: "Confirmation Viewed" },
    { key: "dashboard_first_viewed", event: "dashboard.first_viewed", label: "Dashboard Viewed" },
] as const;

export type FunnelStageKey = typeof FUNNEL_STAGES[number]["key"];

/**
 * D9: Drop-off definitions.
 * Critical conversion boundaries where users commonly abandon the funnel.
 */
export const DROP_OFF_POINTS = [
    {
        name: "Landing → Registration",
        from: "landing_viewed",
        to: "registration_started",
        severity: "high" as const,
        description: "Users who view the landing page but don't start registration",
    },
    {
        name: "Registration → Email Verification",
        from: "registration_completed",
        to: "email_verification_completed",
        severity: "critical" as const,
        description: "Users who register but never verify their email",
    },
    {
        name: "Verification → Qualification",
        from: "email_verification_completed",
        to: "qualification_started",
        severity: "high" as const,
        description: "Verified users who abandon before starting qualification",
    },
    {
        name: "Qualification Start → Submit",
        from: "qualification_started",
        to: "qualification_submitted",
        severity: "critical" as const,
        description: "Users who start but don't complete the qualification form",
    },
    {
        name: "Step 1 → Step 2",
        from: "qualification_step_completed",
        to: "qualification_step_completed",
        severity: "medium" as const,
        description: "Drop-off between qualification steps (requires step_number filter)",
    },
] as const;

export type DropOffSeverity = "low" | "medium" | "high" | "critical";

/**
 * Conversion rate calculation helper.
 * Returns a percentage between 0 and 100.
 */
export function conversionRate(from: number, to: number): number {
    if (from === 0) return 0;
    return Math.round((to / from) * 10000) / 100; // 2 decimal places
}

/**
 * Time-based metric thresholds for qualification flow.
 */
export const TIMING_THRESHOLDS = {
    /** Max acceptable time on a single qualification step (seconds) */
    stepTimeout: 300,
    /** Expected total qualification time (seconds) */
    expectedQualificationTime: 180,
    /** Time to verify email (seconds) — alert if exceeds */
    emailVerificationTimeout: 86400, // 24h
} as const;
