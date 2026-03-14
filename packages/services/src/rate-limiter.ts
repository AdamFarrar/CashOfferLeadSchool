// =============================================================================
// @cols/services — Sliding Window Rate Limiter
// =============================================================================
// In-memory rate limiter with sliding window algorithm.
// Gracefully degrades on failure — never blocks legitimate requests if the
// limiter itself crashes.
//
// Key format: `${endpoint}:${identifier}` where identifier is IP or userId.
// =============================================================================

export interface RateLimitConfig {
    /** Max requests allowed in the window */
    maxRequests: number;
    /** Window duration in milliseconds */
    windowMs: number;
    /** Human-readable name for logging */
    name: string;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
}

// ── In-Memory Store ──

interface WindowEntry {
    timestamps: number[];
}

const store = new Map<string, WindowEntry>();

// Periodic cleanup — remove expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            // Remove entries where all timestamps are older than 1 hour
            const recent = entry.timestamps.filter(t => now - t < 3_600_000);
            if (recent.length === 0) {
                store.delete(key);
            } else {
                entry.timestamps = recent;
            }
        }
    }, CLEANUP_INTERVAL_MS);
    // Don't block process shutdown
    if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
        cleanupTimer.unref();
    }
}

// ── Core Algorithm ──

/**
 * Check rate limit using sliding window.
 * Returns whether the request is allowed and how many requests remain.
 *
 * On internal error, returns allowed=true — rate limiting must never
 * block legitimate traffic due to its own failure.
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig,
): RateLimitResult {
    try {
        ensureCleanup();

        const now = Date.now();
        const windowStart = now - config.windowMs;

        let entry = store.get(key);
        if (!entry) {
            entry = { timestamps: [] };
            store.set(key, entry);
        }

        // Slide: remove timestamps outside the window
        entry.timestamps = entry.timestamps.filter(t => t > windowStart);

        if (entry.timestamps.length >= config.maxRequests) {
            // Rate limited — calculate retry-after from oldest timestamp in window
            const oldestInWindow = entry.timestamps[0];
            const retryAfterMs = oldestInWindow + config.windowMs - now;

            console.warn(
                `[RATE-LIMIT] Blocked: ${config.name} key=${key} ` +
                `(${entry.timestamps.length}/${config.maxRequests} in ${config.windowMs}ms)`,
            );

            return {
                allowed: false,
                remaining: 0,
                retryAfterMs: Math.max(retryAfterMs, 0),
            };
        }

        // Allowed — record this request
        entry.timestamps.push(now);

        return {
            allowed: true,
            remaining: config.maxRequests - entry.timestamps.length,
            retryAfterMs: 0,
        };
    } catch (error) {
        // Graceful degradation — never block on rate limiter failure
        console.error("[RATE-LIMIT] Internal error, allowing request:", error);
        return { allowed: true, remaining: -1, retryAfterMs: 0 };
    }
}

// ── Pre-configured Limiters ──

export const RATE_LIMITS = {
    /** 5 registrations per minute per IP */
    registration: {
        maxRequests: 5,
        windowMs: 60 * 1000,
        name: "registration",
    } satisfies RateLimitConfig,

    /** 10 login attempts per minute per IP */
    login: {
        maxRequests: 10,
        windowMs: 60 * 1000,
        name: "login",
    } satisfies RateLimitConfig,

    /** 5 qualification submissions per hour per user */
    qualification: {
        maxRequests: 5,
        windowMs: 60 * 60 * 1000,
        name: "qualification",
    } satisfies RateLimitConfig,

    /** 10 feedback submissions per hour per user */
    feedback: {
        maxRequests: 10,
        windowMs: 60 * 60 * 1000,
        name: "feedback",
    } satisfies RateLimitConfig,
} as const;

// ── Helpers ──

/**
 * Build a rate limit key from endpoint + identifier.
 * Identifier should be userId (for authenticated actions) or IP (for public).
 */
export function rateLimitKey(endpoint: string, identifier: string): string {
    return `${endpoint}:${identifier}`;
}

/**
 * Reset the in-memory store. For testing only.
 */
export function _resetRateLimitStore(): void {
    store.clear();
}
