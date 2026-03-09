// =============================================================================
// Event Contracts — Dashboard Events
// =============================================================================

export const DashboardFirstViewed = {
    name: "dashboard.first_viewed",
    version: 1,
    description: "User views the dashboard for the first time",
    properties: {
        qualification_completed: false as boolean,
    },
} as const;
