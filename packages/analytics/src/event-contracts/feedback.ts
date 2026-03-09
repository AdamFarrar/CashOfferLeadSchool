// =============================================================================
// Event Contracts — Feedback Events (Phase 1.5A analytics)
// =============================================================================

export const FeedbackPromptViewed = {
    name: "feedback.prompt.viewed",
    version: 1,
    description: "Feedback prompt becomes visible to user",
    properties: {
        context: "" as string, // e.g. "qualification", "dashboard"
        stakeholder_group: "" as string,
    },
} as const;

export const FeedbackOpened = {
    name: "feedback.opened",
    version: 1,
    description: "User expands the feedback form",
    properties: {
        context: "" as string,
        stakeholder_group: "" as string,
    },
} as const;

export const FeedbackSubmitted = {
    name: "feedback.submitted",
    version: 1,
    description: "User submits feedback",
    properties: {
        type: "" as string,
        context: "" as string,
        stakeholder_group: "" as string,
        rating: 0 as number,
        body_length: 0 as number,
    },
} as const;

export const FeedbackDismissed = {
    name: "feedback.dismissed",
    version: 1,
    description: "User dismisses the feedback prompt",
    properties: {
        context: "" as string,
        time_visible_s: 0 as number,
    },
} as const;
