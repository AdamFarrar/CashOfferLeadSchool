import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins/organization";
import { Resend } from "resend";
import { db } from "@cocs/database/client";
import * as schema from "@cocs/database/schema";
import { ac, owner, admin, instructor, student, prospect } from "./permissions";
import { serverTrack } from "@cocs/analytics";
import { AuthEmailVerificationCompleted } from "@cocs/analytics/event-contracts";

// Dedup guard: track which user IDs have already had the verification event fired
// during this process lifetime. Prevents spurious re-fires on unrelated user updates.
const _verificationEventFired = new Set<string>();

// =============================================================================
// BetterAuth Server Configuration
// =============================================================================
// Server-side auth instance. Handles:
// - Session management (httpOnly cookies)
// - Organization multi-tenancy
// - RBAC via organization roles + access control
// - Email verification via Resend
// =============================================================================

let _resend: Resend | null = null;
function getResend() {
    if (!_resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error("RESEND_API_KEY environment variable is required for email sending.");
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

    baseURL: (() => {
        if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
        if (process.env.NODE_ENV === "production") {
            throw new Error("BETTER_AUTH_URL environment variable is required in production.");
        }
        return "http://localhost:3000";
    })(),
    secret: (() => {
        if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
        if (process.env.NODE_ENV === "production") {
            throw new Error("BETTER_AUTH_SECRET environment variable is required in production.");
        }
        return undefined;
    })(),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await getResend().emails.send({
                from: "Cash Offer School <noreply@cashofferconversionschool.com>",
                to: user.email,
                subject: "Verify your email — Cash Offer Conversion School",
                html: `
          <h2>Welcome to Cash Offer Conversion School</h2>
          <p>Click the link below to verify your email address:</p>
          <p><a href="${url}">Verify Email</a></p>
          <p>This link expires in 24 hours.</p>
        `,
            });
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
                    // Fire email verification event ONCE per user when emailVerified
                    // transitions to true. Dedup guard prevents re-fire on unrelated
                    // user updates (name change, avatar, etc.).
                    if (user.emailVerified && !_verificationEventFired.has(user.id)) {
                        _verificationEventFired.add(user.id);
                        serverTrack(AuthEmailVerificationCompleted, {
                            time_to_verify_s: 0,
                        }, {
                            userId: user.id,
                        }).catch(() => {
                            // Non-blocking — analytics failure must not break auth
                        });
                    }
                },
            },
        },
    },

    plugins: [
        organization({
            // BetterAuth's organization plugin expects `AccessControl` from
            // better-auth/plugins/access but createAccessControl() returns a
            // structurally identical but nominally different type. BetterAuth
            // does not re-export the expected type, so `as any` is required.
            // TODO: Remove when BetterAuth exports a compatible type.
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
