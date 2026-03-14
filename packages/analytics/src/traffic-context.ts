// =============================================================================
// @cols/analytics — Traffic Segmentation Context
// =============================================================================
// Defines canonical segmentation values and auto-detection logic.
// Used by track() and serverTrack() to tag every event with context
// that enables PostHog filtering of internal/test/stakeholder traffic.
// =============================================================================

// ── Canonical Value Types ──

export type Environment = "local" | "staging" | "production";
export type TrafficSource = "app" | "admin" | "qa" | "stakeholder_test" | "internal_demo";
export type UserCohort = "internal" | "stakeholder" | "pilot" | "real_user";
export type ReleaseChannel = "dev" | "preview" | "prod";

// ── Segmentation Context (attached to every event) ──

export interface TrafficContext {
    environment: Environment;
    traffic_source: TrafficSource;
    user_cohort: UserCohort;
    release_channel: ReleaseChannel;
    is_internal: boolean;
    is_test_user: boolean;
}

// ── Internal Account Registry ──
// Lightweight mechanism to mark accounts without polluting business logic.
// Stored in module-level Set — populated at startup from env or API.

const _internalEmails = new Set<string>();
const _internalUserIds = new Set<string>();
const _stakeholderUserIds = new Set<string>();

/**
 * Register emails as internal (e.g., team members).
 * Call at app startup with values from env or config.
 */
export function registerInternalEmails(emails: string[]): void {
    for (const email of emails) {
        _internalEmails.add(email.toLowerCase().trim());
    }
}

/**
 * Register user IDs as internal.
 */
export function registerInternalUserIds(userIds: string[]): void {
    for (const id of userIds) {
        _internalUserIds.add(id);
    }
}

/**
 * Register user IDs as stakeholder test users.
 */
export function registerStakeholderUserIds(userIds: string[]): void {
    for (const id of userIds) {
        _stakeholderUserIds.add(id);
    }
}

/**
 * Check if an email belongs to an internal account.
 */
export function isInternalEmail(email: string): boolean {
    const normalized = email.toLowerCase().trim();
    return _internalEmails.has(normalized);
}

/**
 * Check if a user ID is registered as internal.
 */
export function isInternalUser(userId: string): boolean {
    return _internalUserIds.has(userId);
}

/**
 * Check if a user ID is a stakeholder test user.
 */
export function isStakeholderUser(userId: string): boolean {
    return _stakeholderUserIds.has(userId);
}

// ── Auto-Detection ──

/**
 * Detect the current environment from env vars.
 */
export function detectEnvironment(): Environment {
    const env = process.env.NODE_ENV;
    const vercelEnv = process.env.VERCEL_ENV;
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV;

    // Explicit app env takes priority
    if (appEnv === "staging") return "staging";
    if (appEnv === "production") return "production";
    if (appEnv === "local") return "local";

    // Vercel environment
    if (vercelEnv === "production") return "production";
    if (vercelEnv === "preview") return "staging";

    // Fall back to NODE_ENV
    if (env === "production") return "production";
    return "local";
}

/**
 * Detect the release channel from deploy context.
 */
export function detectReleaseChannel(): ReleaseChannel {
    const vercelEnv = process.env.VERCEL_ENV;
    const channel = process.env.RELEASE_CHANNEL;

    if (channel === "prod" || channel === "preview" || channel === "dev") return channel;
    if (vercelEnv === "production") return "prod";
    if (vercelEnv === "preview") return "preview";
    return "dev";
}

/**
 * Determine user cohort based on userId.
 * Priority: internal > stakeholder > pilot > real_user
 */
export function resolveUserCohort(userId?: string): UserCohort {
    if (!userId) return "real_user";
    if (_internalUserIds.has(userId)) return "internal";
    if (_stakeholderUserIds.has(userId)) return "stakeholder";
    return "real_user";
}

/**
 * Build a complete TrafficContext from available signals.
 *
 * @param userId - current user ID (if known)
 * @param sourceOverride - explicit traffic source (e.g., "admin" for admin pages)
 */
export function buildTrafficContext(
    userId?: string,
    sourceOverride?: TrafficSource,
): TrafficContext {
    const cohort = resolveUserCohort(userId);
    const isInternal = cohort === "internal";
    const isTestUser = cohort === "internal" || cohort === "stakeholder";

    return {
        environment: detectEnvironment(),
        traffic_source: sourceOverride || (isInternal ? "app" : "app"),
        user_cohort: cohort,
        release_channel: detectReleaseChannel(),
        is_internal: isInternal,
        is_test_user: isTestUser,
    };
}

/**
 * Reset all registries. For testing only.
 */
export function _resetTrafficRegistries(): void {
    _internalEmails.clear();
    _internalUserIds.clear();
    _stakeholderUserIds.clear();
}
