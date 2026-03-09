// =============================================================================
// Event Contracts — Qualification Events
// =============================================================================

export const QualificationStarted = {
    name: "qualification.started",
    version: 1,
    description: "User begins the qualification flow",
    properties: {} as Record<string, never>,
} as const;

export const QualificationStepCompleted = {
    name: "qualification.step.completed",
    version: 1,
    description: "User completes a qualification step",
    properties: {
        step_number: 0 as number,
        step_name: "" as string,
        time_on_step_s: 0 as number,
    },
} as const;

export const QualificationSubmitted = {
    name: "qualification.submitted",
    version: 1,
    description: "User submits the full qualification form",
    properties: {
        total_steps: 0 as number,
        total_time_s: 0 as number,
        business_type: "" as string, // structured, not PII
    },
} as const;

export const QualificationConfirmationViewed = {
    name: "qualification.confirmation.viewed",
    version: 1,
    description: "User views the confirmation page after submission",
    properties: {} as Record<string, never>,
} as const;
