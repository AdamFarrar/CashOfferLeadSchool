"use server";

import { db } from "@cocs/database/client";
import { user } from "@cocs/database/schema";
import { eq } from "drizzle-orm";
import { emitDomainEvent, DOMAIN_EVENTS } from "@cocs/events";

// =============================================================================
// Resend Verification Email — Server Action
// =============================================================================
// Bypasses BetterAuth's session-dependent sendVerificationEmail.
// Looks up the user by email, then emits the domain event directly.
// Rate-limited: 1 resend per 60s per email via in-memory map.
// =============================================================================

const _lastResend = new Map<string, number>();
const RESEND_COOLDOWN_MS = 60_000;

export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    if (!email || typeof email !== "string") {
        return { success: false, error: "Email is required" };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit
    const lastSent = _lastResend.get(normalizedEmail) ?? 0;
    if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
        // Don't reveal timing — always return success
        return { success: true };
    }

    try {
        // Look up user by email
        const [found] = await db
            .select({ id: user.id, name: user.name, emailVerified: user.emailVerified })
            .from(user)
            .where(eq(user.email, normalizedEmail))
            .limit(1);

        if (!found) {
            // Don't reveal whether user exists — always return success
            console.info(`[RESEND] No user found for ${normalizedEmail} — returning silent success`);
            return { success: true };
        }

        if (found.emailVerified) {
            return { success: true }; // Already verified
        }

        // Generate a verification URL using BetterAuth's API
        const { auth } = await import("@cocs/auth/server");
        // Use BetterAuth's internal method to create a verification token+URL
        // This calls our sendVerificationEmail callback which emits the domain event
        await auth.api.sendVerificationEmail({
            body: { email: normalizedEmail, callbackURL: "/dashboard" },
        });

        _lastResend.set(normalizedEmail, Date.now());
        console.info(`[RESEND] Verification email triggered for ${normalizedEmail}`);
        return { success: true };
    } catch (err) {
        console.error("[RESEND] Failed:", err instanceof Error ? err.message : err);
        return { success: false, error: "Failed to send verification email" };
    }
}
