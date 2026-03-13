"use server";

// =============================================================================
// Login Server Action — Post-Audit Remediation (Fix 2)
// =============================================================================
// Wraps BetterAuth signIn.email() with server-side IP rate limiting.
// Login was previously client-only — this adds the server-side gate.
//
// Flow: extract IP → rate limit (10/min per IP) → delegate to BetterAuth
// Always returns generic error — never reveals account existence.
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

export async function loginAction(input: {
    email: string;
    password: string;
}): Promise<{ success: boolean; error?: string }> {
    const headersList = await headers();
    const ip =
        headersList.get("cf-connecting-ip") ??
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown";

    // Rate limit by IP
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
