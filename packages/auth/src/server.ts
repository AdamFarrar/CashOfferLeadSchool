import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins/organization";
import { db } from "@cocs/database/client";
import * as schema from "@cocs/database/schema";
import { ac, owner, admin, instructor, student, prospect } from "./permissions";
import { emitDomainEvent, DOMAIN_EVENTS } from "@cocs/events";

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
        sendResetPassword: async ({ user, url }) => {
            try {
                await emitDomainEvent({
                    eventKey: DOMAIN_EVENTS.PASSWORD_REQUESTED,
                    payload: {
                        email: user.email,
                        user_name: user.name ?? "",
                        reset_url: url,
                    },
                    actor: { type: "system", id: "betterauth" },
                    subject: { type: "user", id: user.id },
                });
            } catch (error) {
                console.error("[AUTH] Failed to emit password reset event:", error);
            }
        },
    },

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            try {
                await emitDomainEvent({
                    eventKey: DOMAIN_EVENTS.VERIFICATION_EMAIL_REQUESTED,
                    payload: {
                        email: user.email,
                        user_name: user.name ?? "",
                        verification_url: url,
                    },
                    actor: { type: "system", id: "betterauth" },
                    subject: { type: "user", id: user.id },
                    // No organizationId — org may not exist yet at registration time
                });
            } catch (error) {
                console.error("[AUTH] Failed to emit verification event:", {
                    to: user.email,
                    error: error instanceof Error ? error.message : error,
                });
                // Non-blocking — account creation must succeed even if event fails.
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
            create: {
                after: async (user) => {
                    try {
                        await emitDomainEvent({
                            eventKey: DOMAIN_EVENTS.USER_REGISTERED,
                            payload: {
                                email: user.email,
                                user_name: user.name ?? "",
                                method: "email",
                            },
                            actor: { type: "system", id: "betterauth" },
                            subject: { type: "user", id: user.id },
                        });
                    } catch {
                        // Non-blocking
                    }

                    // Auto-create default organization
                    try {
                        const slug = `${user.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "user"}-${user.id.slice(0, 8)}`;
                        await auth.api.createOrganization({
                            body: {
                                name: `${user.name || "My"}'s Organization`,
                                slug,
                            },
                            headers: new Headers(),
                            query: { userId: user.id } as any,
                        }).catch(async () => {
                            // Fallback: direct DB insert if API method fails
                            const { db } = await import("@cocs/database/client");
                            const { organization, member } = await import("@cocs/database/schema");
                            const orgId = crypto.randomUUID();
                            await db.insert(organization).values({
                                id: orgId,
                                name: `${user.name || "My"}'s Organization`,
                                slug,
                            });
                            await db.insert(member).values({
                                organizationId: orgId,
                                userId: user.id,
                                role: "owner",
                            });
                        });
                    } catch (error) {
                        console.error("[AUTH] Failed to create default org for user:", error);
                    }
                },
            },
            update: {
                after: async (user) => {
                    if (user.emailVerified && !_verificationEventFired.has(user.id)) {
                        _verificationEventFired.add(user.id);
                        try {
                            await emitDomainEvent({
                                eventKey: DOMAIN_EVENTS.EMAIL_VERIFIED,
                                payload: {
                                    email: user.email,
                                    user_name: user.name ?? "",
                                    time_to_verify_s: 0,
                                },
                                actor: { type: "user", id: user.id },
                                subject: { type: "user", id: user.id },
                            });
                        } catch {
                            // Non-blocking
                        }
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
