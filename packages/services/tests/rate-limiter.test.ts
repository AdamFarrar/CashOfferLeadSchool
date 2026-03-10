import { describe, it, expect, beforeEach } from "vitest";
import {
    checkRateLimit,
    rateLimitKey,
    RATE_LIMITS,
    _resetRateLimitStore,
} from "../src/rate-limiter";
import type { RateLimitConfig } from "../src/rate-limiter";

// =============================================================================
// Rate Limiter Tests
// =============================================================================

describe("checkRateLimit", () => {
    beforeEach(() => {
        _resetRateLimitStore();
    });

    // ── Core behavior ──

    it("allows requests under the limit", () => {
        const config: RateLimitConfig = { maxRequests: 3, windowMs: 60_000, name: "test" };
        const key = rateLimitKey("test", "user-1");

        const r1 = checkRateLimit(key, config);
        expect(r1.allowed).toBe(true);
        expect(r1.remaining).toBe(2);

        const r2 = checkRateLimit(key, config);
        expect(r2.allowed).toBe(true);
        expect(r2.remaining).toBe(1);

        const r3 = checkRateLimit(key, config);
        expect(r3.allowed).toBe(true);
        expect(r3.remaining).toBe(0);
    });

    it("blocks requests at the limit", () => {
        const config: RateLimitConfig = { maxRequests: 2, windowMs: 60_000, name: "test" };
        const key = rateLimitKey("test", "user-1");

        checkRateLimit(key, config);
        checkRateLimit(key, config);

        const r3 = checkRateLimit(key, config);
        expect(r3.allowed).toBe(false);
        expect(r3.remaining).toBe(0);
        expect(r3.retryAfterMs).toBeGreaterThan(0);
    });

    it("isolates keys from each other", () => {
        const config: RateLimitConfig = { maxRequests: 1, windowMs: 60_000, name: "test" };

        checkRateLimit(rateLimitKey("test", "user-1"), config);
        const r2 = checkRateLimit(rateLimitKey("test", "user-2"), config);

        // user-2 should still be allowed
        expect(r2.allowed).toBe(true);
    });

    it("isolates endpoints from each other", () => {
        const config: RateLimitConfig = { maxRequests: 1, windowMs: 60_000, name: "test" };

        checkRateLimit(rateLimitKey("login", "user-1"), config);
        const r2 = checkRateLimit(rateLimitKey("register", "user-1"), config);

        expect(r2.allowed).toBe(true);
    });

    // ── Sliding window ──

    it("recovers after window expires", () => {
        const config: RateLimitConfig = { maxRequests: 1, windowMs: 100, name: "test" };
        const key = rateLimitKey("test", "user-1");

        checkRateLimit(key, config);
        const blocked = checkRateLimit(key, config);
        expect(blocked.allowed).toBe(false);

        // Wait for window to expire
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const r = checkRateLimit(key, config);
                expect(r.allowed).toBe(true);
                expect(r.remaining).toBe(0);
                resolve();
            }, 150);
        });
    });

    // ── retryAfterMs ──

    it("returns retryAfterMs when blocked", () => {
        const config: RateLimitConfig = { maxRequests: 1, windowMs: 60_000, name: "test" };
        const key = rateLimitKey("test", "user-1");

        checkRateLimit(key, config);
        const blocked = checkRateLimit(key, config);

        expect(blocked.retryAfterMs).toBeGreaterThan(0);
        expect(blocked.retryAfterMs).toBeLessThanOrEqual(60_000);
    });

    it("returns retryAfterMs = 0 when allowed", () => {
        const config: RateLimitConfig = { maxRequests: 5, windowMs: 60_000, name: "test" };
        const r = checkRateLimit(rateLimitKey("test", "user-1"), config);

        expect(r.retryAfterMs).toBe(0);
    });

    // ── Pre-configured limits ──

    it("RATE_LIMITS has correct configuration", () => {
        expect(RATE_LIMITS.registration.maxRequests).toBe(5);
        expect(RATE_LIMITS.registration.windowMs).toBe(60_000);

        expect(RATE_LIMITS.login.maxRequests).toBe(10);
        expect(RATE_LIMITS.login.windowMs).toBe(60_000);

        expect(RATE_LIMITS.qualification.maxRequests).toBe(5);
        expect(RATE_LIMITS.qualification.windowMs).toBe(3_600_000);

        expect(RATE_LIMITS.feedback.maxRequests).toBe(10);
        expect(RATE_LIMITS.feedback.windowMs).toBe(3_600_000);
    });

    // ── rateLimitKey ──

    it("builds correct keys", () => {
        expect(rateLimitKey("login", "1.2.3.4")).toBe("login:1.2.3.4");
        expect(rateLimitKey("qualification", "user-abc")).toBe("qualification:user-abc");
    });

    // ── Edge cases ──

    it("handles rapid sequential calls correctly", () => {
        const config: RateLimitConfig = { maxRequests: 100, windowMs: 60_000, name: "test" };
        const key = rateLimitKey("test", "user-1");

        for (let i = 0; i < 100; i++) {
            expect(checkRateLimit(key, config).allowed).toBe(true);
        }

        expect(checkRateLimit(key, config).allowed).toBe(false);
    });

    it("does not crash on empty key", () => {
        const config: RateLimitConfig = { maxRequests: 1, windowMs: 60_000, name: "test" };
        const r = checkRateLimit("", config);
        expect(r.allowed).toBe(true);
    });
});
