// =============================================================================
// @cocs/analytics — Barrel Export
// =============================================================================

export { track, setAnalyticsContext, setActiveExperiments, setTrafficSource } from "./track";
export { serverTrack } from "./server-track";
export { identify, resetIdentity } from "./identify";
export type { EventContract, ContractProperties } from "./types";
export type { EventEnvelope } from "./event-envelope";

// Traffic Segmentation (Phase 1.7.1E)
export {
    buildTrafficContext,
    registerInternalEmails,
    registerInternalUserIds,
    registerStakeholderUserIds,
    isInternalEmail,
    isInternalUser,
    isStakeholderUser,
    resolveUserCohort,
    detectEnvironment,
    detectReleaseChannel,
} from "./traffic-context";
export type {
    Environment,
    TrafficSource,
    UserCohort,
    ReleaseChannel,
    TrafficContext,
} from "./traffic-context";

// D8-D9: Metrics & Drop-off
export { FUNNEL_STAGES, DROP_OFF_POINTS, conversionRate, TIMING_THRESHOLDS } from "./metrics";
export type { FunnelStageKey, DropOffSeverity } from "./metrics";

// D10: Lead Scoring
export { calculateLeadScore } from "./lead-scoring";
export type { LeadScoreInput, LeadScoreResult } from "./lead-scoring";

// D11: Reporting
export { REPORT_REGISTRY } from "./reporting";
export type { FunnelReport, LeadQualityReport, FeedbackReport, StakeholderReport } from "./reporting";

// D12: Dashboards
export { FUNNEL_DASHBOARD, FEEDBACK_DASHBOARD, EXPERIMENT_DASHBOARD, ALL_DASHBOARDS } from "./dashboards";

// D13: Docs Generator
export { extractDocs, generateMarkdown } from "./generate-docs";

// Phase 1.6: Domain Event Bus Listener
export { registerAnalyticsListener } from "./listener";
export { resolveContract } from "./contract-mapper";
