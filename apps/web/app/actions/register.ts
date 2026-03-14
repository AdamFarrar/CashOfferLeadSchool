"use server";

// =============================================================================
// Registration Server Action — Security Hardening
// =============================================================================
// Flow: Turnstile verify → rate limit (IP) → signUp → generic response
// Never exposes: userId, account existence, internal auth errors
// =============================================================================

import { auth } from "@cols/auth/server";
import { headers } from "next/headers";
import { checkRateLimit, rateLimitKey } from "@cols/services";
import type { RateLimitConfig } from "@cols/services";

const RATE_LIMITS = {
    signup_hourly: { maxRequests: 3, windowMs: 60 * 60 * 1000, name: "signup_hourly" } satisfies RateLimitConfig,
    signup_daily: { maxRequests: 10, windowMs: 24 * 60 * 60 * 1000, name: "signup_daily" } satisfies RateLimitConfig,
};

const GENERIC_RESPONSE = "If the email is not already registered, a verification email will be sent.";

// ── Turnstile Verification ──

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        // Dev fallback — allow if no secret configured
        if (process.env.NODE_ENV !== "production") return true;
        return false;
    }

    try {
        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ secret, response: token, remoteip: ip }),
        });
        const data = await res.json();
        return data.success === true;
    } catch {
        return false;
    }
}

export async function registerAction(input: {
    name: string;
    email: string;
    password: string;
    turnstileToken: string;
}): Promise<{ success: boolean; message: string }> {
    // Extract real client IP from headers
    const headersList = await headers();
    const ip =
        headersList.get("cf-connecting-ip") ??
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown";

    // 1. Verify Turnstile
    if (!input.turnstileToken) {
        return { success: false, message: "Please complete the verification challenge." };
    }

    const turnstileValid = await verifyTurnstile(input.turnstileToken, ip);
    if (!turnstileValid) {
        return { success: false, message: "Verification failed. Please try again." };
    }

    // 2. Rate limit (hourly + daily)
    const hourlyCheck = checkRateLimit(rateLimitKey("signup_hourly", ip), RATE_LIMITS.signup_hourly);
    if (!hourlyCheck.allowed) {
        return { success: false, message: "Too many signup attempts. Please try again later." };
    }

    const dailyCheck = checkRateLimit(rateLimitKey("signup_daily", ip), RATE_LIMITS.signup_daily);
    if (!dailyCheck.allowed) {
        return { success: false, message: "Too many signup attempts. Please try again later." };
    }

    // 3. Validate inputs
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!name || name.length < 1) return { success: false, message: "Name is required." };
    if (!email || !email.includes("@")) return { success: false, message: "Valid email is required." };
    if (!password || password.length < 8) return { success: false, message: "Password must be at least 8 characters." };

    // 4. Sign up via BetterAuth (server-side)
    try {
        await auth.api.signUpEmail({
            body: { name, email, password },
        });
    } catch {
        // Swallow all errors — never reveal account existence
        // BetterAuth throws if user exists, password too weak, etc.
    }

    // 5. Always return generic response (Fix 2 + Fix 3)
    // Never expose userId, account existence, or internal errors
    return { success: true, message: GENERIC_RESPONSE };
}
