import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins/organization";
import { Resend } from "resend";
import { db } from "@cocs/database/client";
import * as schema from "@cocs/database/schema";
import { ac, owner, admin, instructor, student, prospect } from "./permissions";
import { serverTrack } from "@cocs/analytics";
import { AuthEmailVerificationCompleted } from "@cocs/analytics/event-contracts";

// =============================================================================
// Production Startup Validation
// =============================================================================
if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
    const required = ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "SUPABASE_DB_URL"];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
        console.error(`[AUTH] Missing required env vars: ${missing.join(", ")}`);
    }
    if (!process.env.RESEND_API_KEY) {
        console.warn("[AUTH] RESEND_API_KEY not set — verification emails will fail silently");
    }
}

// Dedup guard: track which user IDs have already had the verification event fired
// during this process lifetime. Prevents spurious re-fires on unrelated user updates.
const _verificationEventFired = new Set<string>();

// =============================================================================
// BetterAuth Server Configuration
// =============================================================================

let _resend: Resend | null = null;
function getResend(): Resend | null {
    if (!_resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error("[AUTH] RESEND_API_KEY not set — cannot send emails");
            return null;
        }
        _resend = new Resend(apiKey);
    }
    return _resend;
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,

    advanced: {
        database: {
            generateId: () => crypto.randomUUID(),
        },
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            try {
                const resend = getResend();
                if (!resend) {
                    console.error(`[AUTH] Skipping verification email for ${user.email} — Resend not configured`);
                    return;
                }
                await resend.emails.send({
                    from: "Cash Offer School <noreply@cashofferleadschool.com>",
                    to: user.email,
                    subject: "Verify your email — Cash Offer Lead School",
                    html: `
          <h2>Welcome to Cash Offer Lead School</h2>
          <p>Click the link below to verify your email address:</p>
          <p><a href="${url}">Verify Email</a></p>
          <p>This link expires in 24 hours.</p>
        `,
                });
            } catch (error) {
                console.error("[AUTH] Verification email failed:", {
                    to: user.email,
                    error: error instanceof Error ? error.message : error,
                });
                // Do NOT rethrow — account creation must succeed even if email fails.
                // User can retry via the "Resend Verification Email" button.
            }
        },
    },

    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
        expiresIn: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 24,
    },

    databaseHooks: {
        user: {
            update: {
                after: async (user) => {
                    if (user.emailVerified && !_verificationEventFired.has(user.id)) {
                        _verificationEventFired.add(user.id);
                        serverTrack(AuthEmailVerificationCompleted, {
                            time_to_verify_s: 0,
                        }, {
                            userId: user.id,
                        }).catch(() => { });
                    }
                },
            },
        },
    },

    plugins: [
        organization({
            ac: ac as any,
            allowUserToCreateOrganization: true,
            organizationLimit: 5,
            roles: {
                owner,
                admin,
                instructor,
                student,
                prospect,
            },
            defaultRole: "prospect",
        }),
    ],
});

export type Auth = typeof auth;
