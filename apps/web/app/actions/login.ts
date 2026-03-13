"use server";

// =============================================================================
// Login Server Action — Security Hardening + Turnstile
// =============================================================================
// Flow: Turnstile verify → rate limit (IP) → signIn → generic response
// Never reveals account existence.
// =============================================================================

import { auth } from "@cocs/auth/server";
import { headers } from "next/headers";
import { checkRateLimit, rateLimitKey } from "@cocs/services";
import type { RateLimitConfig } from "@cocs/services";

const LOGIN_RATE_LIMIT: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    name: "login",
};

const GENERIC_ERROR = "Invalid email or password.";

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

export async function loginAction(input: {
    email: string;
    password: string;
    turnstileToken: string;
}): Promise<{ success: boolean; error?: string }> {
    const headersList = await headers();
    const ip =
        headersList.get("cf-connecting-ip") ??
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown";

    // 1. Verify Turnstile
    if (input.turnstileToken) {
        const turnstileValid = await verifyTurnstile(input.turnstileToken, ip);
        if (!turnstileValid) {
            return { success: false, error: "Verification failed. Please try again." };
        }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
        // Turnstile is configured but no token provided — block in production
        return { success: false, error: "Please complete the verification challenge." };
    }

    // 2. Rate limit by IP
    const rl = checkRateLimit(rateLimitKey("login", ip), LOGIN_RATE_LIMIT);
    if (!rl.allowed) {
        return { success: false, error: "Too many login attempts. Please try again later." };
    }

    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !email.includes("@")) {
        return { success: false, error: GENERIC_ERROR };
    }
    if (!password) {
        return { success: false, error: GENERIC_ERROR };
    }

    try {
        const result = await auth.api.signInEmail({
            body: { email, password },
        });

        if (!result?.user) {
            return { success: false, error: GENERIC_ERROR };
        }

        return { success: true };
    } catch {
        // Swallow all auth errors — never reveal account existence
        return { success: false, error: GENERIC_ERROR };
    }
}
