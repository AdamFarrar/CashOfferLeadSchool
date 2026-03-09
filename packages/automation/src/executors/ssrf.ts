// =============================================================================
// SSRF Protection — Shared Deny List + Validation
// =============================================================================
// Used by both webhook executor (runtime) and automation-rules action (creation).
// =============================================================================

/**
 * Regex patterns that match URLs pointing to internal/private network addresses.
 * Applied as first-pass defense before any HTTP request.
 */
export const SSRF_DENY_PATTERNS: RegExp[] = [
    /^https?:\/\/localhost/i,
    /^https?:\/\/127\./,
    /^https?:\/\/10\./,
    /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
    /^https?:\/\/192\.168\./,
    /^https?:\/\/169\.254\./,
    /^https?:\/\/0\./,
    /^https?:\/\/\[::1\]/,
    /^https?:\/\/\[fc/i,    // IPv6 ULA fc00::/7
    /^https?:\/\/\[fd/i,    // IPv6 ULA fd00::/8
    /^https?:\/\/\[fe80/i,  // IPv6 link-local
];

/**
 * Check whether a URL targets internal/private infrastructure.
 * Returns true if the URL is BLOCKED (unsafe).
 */
export function isUrlBlocked(url: string): boolean {
    return SSRF_DENY_PATTERNS.some(pattern => pattern.test(url));
}
