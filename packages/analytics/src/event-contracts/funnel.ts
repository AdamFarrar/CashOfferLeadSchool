// =============================================================================
// Event Contracts — Funnel Events
// =============================================================================
// Tracks user journey through the landing page and conversion funnel.
// No PII. All events use typed contracts.
// =============================================================================

export const FunnelLandingViewed = {
    name: "funnel.landing.viewed",
    version: 1,
    description: "User views the landing page",
    properties: {} as Record<string, never>,
} as const;

export const FunnelCtaClicked = {
    name: "funnel.cta.clicked",
    version: 1,
    description: "User clicks a CTA on the landing page",
    properties: {
        cta_id: "" as string,
        cta_text: "" as string,
        section: "" as string,
    },
} as const;

export type FunnelLandingViewedProps = typeof FunnelLandingViewed.properties;
export type FunnelCtaClickedProps = typeof FunnelCtaClicked.properties;
