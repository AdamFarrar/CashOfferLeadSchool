// =============================================================================
// Feature Flags
// =============================================================================
// Simple boolean feature flags backed by environment variables or remote config.
// =============================================================================

const _overrides = new Map<string, boolean>();

/**
 * Check if a feature flag is enabled.
 * Priority: local override > env var > default false.
 */
export function isFeatureEnabled(flagKey: string): boolean {
    // Check local overrides (for testing)
    if (_overrides.has(flagKey)) {
        return _overrides.get(flagKey)!;
    }

    // Check environment variable: FEATURE_FLAG_<KEY>=true
    if (typeof process !== "undefined" && process.env) {
        const envKey = `FEATURE_FLAG_${flagKey.toUpperCase().replace(/-/g, "_")}`;
        const envVal = process.env[envKey];
        if (envVal === "true") return true;
        if (envVal === "false") return false;
    }

    return false;
}

/**
 * Override a feature flag locally (for testing/dev).
 */
export function setFeatureFlag(flagKey: string, enabled: boolean): void {
    _overrides.set(flagKey, enabled);
}

/**
 * Clear all local feature flag overrides.
 */
export function clearFeatureFlags(): void {
    _overrides.clear();
}
