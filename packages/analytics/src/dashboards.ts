// =============================================================================
// D12: PostHog Dashboard Specifications
// =============================================================================
// Machine-readable dashboard specs for PostHog.
// These can be used to programmatically create/update dashboards via the API.
// =============================================================================

export interface DashboardSpec {
    name: string;
    description: string;
    tiles: TileSpec[];
}

export interface TileSpec {
    name: string;
    type: "trend" | "funnel" | "retention" | "table" | "number";
    events: string[];
    filters?: Record<string, unknown>;
    breakdownBy?: string;
    dateRange?: string;
}

/**
 * Primary conversion funnel dashboard.
 */
export const FUNNEL_DASHBOARD: DashboardSpec = {
    name: "COCS — Conversion Funnel",
    description: "End-to-end conversion funnel from landing page to qualified operator",
    tiles: [
        {
            name: "Full Funnel",
            type: "funnel",
            events: [
                "funnel.landing.viewed",
                "auth.registration.started",
                "auth.registration.completed",
                "auth.email_verification.completed",
                "qualification.started",
                "qualification.submitted",
                "dashboard.first_viewed",
            ],
            dateRange: "Last 30 days",
        },
        {
            name: "Daily Registrations",
            type: "trend",
            events: ["auth.registration.completed"],
            dateRange: "Last 30 days",
        },
        {
            name: "Daily Qualifications",
            type: "trend",
            events: ["qualification.submitted"],
            dateRange: "Last 30 days",
        },
        {
            name: "Registration → Verification Rate",
            type: "number",
            events: ["auth.registration.completed", "auth.email_verification.completed"],
            dateRange: "Last 7 days",
        },
        {
            name: "Qualification Step Drop-off",
            type: "funnel",
            events: [
                "qualification.started",
                "qualification.step.completed",
                "qualification.submitted",
            ],
            breakdownBy: "step_number",
            dateRange: "Last 30 days",
        },
        {
            name: "Avg Time on Qualification Steps",
            type: "table",
            events: ["qualification.step.completed"],
            breakdownBy: "step_name",
            filters: { aggregation: "avg", property: "time_on_step_s" },
            dateRange: "Last 30 days",
        },
        {
            name: "CTA Click Distribution",
            type: "table",
            events: ["funnel.cta.clicked"],
            breakdownBy: "section",
            dateRange: "Last 30 days",
        },
    ],
};

/**
 * Feedback engagement dashboard.
 */
export const FEEDBACK_DASHBOARD: DashboardSpec = {
    name: "COCS — Feedback Engagement",
    description: "Feedback prompt engagement and submission metrics",
    tiles: [
        {
            name: "Feedback Submissions Over Time",
            type: "trend",
            events: ["feedback.submitted"],
            dateRange: "Last 30 days",
        },
        {
            name: "Prompt Engagement Funnel",
            type: "funnel",
            events: [
                "feedback.prompt.viewed",
                "feedback.opened",
                "feedback.submitted",
            ],
            dateRange: "Last 30 days",
        },
        {
            name: "Feedback by Type",
            type: "table",
            events: ["feedback.submitted"],
            breakdownBy: "type",
            dateRange: "Last 30 days",
        },
        {
            name: "Dismissal Rate",
            type: "number",
            events: ["feedback.prompt.viewed", "feedback.dismissed"],
            dateRange: "Last 7 days",
        },
    ],
};

/**
 * Experiment dashboard.
 */
export const EXPERIMENT_DASHBOARD: DashboardSpec = {
    name: "COCS — Experiments",
    description: "Active experiment exposure and variant distribution",
    tiles: [
        {
            name: "Experiment Exposures",
            type: "trend",
            events: ["experiment.exposed"],
            breakdownBy: "experiment_id",
            dateRange: "Last 30 days",
        },
        {
            name: "Variant Distribution",
            type: "table",
            events: ["experiment.exposed"],
            breakdownBy: "variant",
            dateRange: "Last 30 days",
        },
    ],
};

export const ALL_DASHBOARDS = [
    FUNNEL_DASHBOARD,
    FEEDBACK_DASHBOARD,
    EXPERIMENT_DASHBOARD,
] as const;
