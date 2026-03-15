"use server";

import { auth } from "@cols/auth/server";
import { headers, cookies } from "next/headers";
import { db } from "@cols/database/client";
import { session as sessionTable, member } from "@cols/database/schema";
import { eq, and, gt } from "drizzle-orm";

// =============================================================================
// Shared Server-Side Identity Resolver
// =============================================================================
// Resolves user identity from the authenticated session cookie.
// Primary path: BetterAuth getSession() + getActiveMember()
// Fallback path: Direct DB session lookup (bypasses org plugin)
// =============================================================================

export interface ServerIdentity {
    userId: string;
    organizationId: string;
    role: string;
}

export async function getServerIdentity(): Promise<ServerIdentity | null> {
    // --- Primary path: BetterAuth getSession ---
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return null;

        let orgId = session.session?.activeOrganizationId || "";
        let role = "";

        if (orgId) {
            const activeMember = await auth.api
                .getActiveMember({ headers: await headers() })
                .catch(() => null);
            role = activeMember?.role || "";
        } else {
            const membership = await db
                .select({ organizationId: member.organizationId, role: member.role })
                .from(member)
                .where(eq(member.userId, session.user.id))
                .limit(1);
            if (membership.length > 0) {
                orgId = membership[0].organizationId;
                role = membership[0].role;
            }
        }

        return { userId: session.user.id, organizationId: orgId, role };
    } catch (err) {
        console.error("[IDENTITY] BetterAuth getSession failed, trying fallback:", err);
    }

    // --- Fallback path: Direct DB lookup bypassing org plugin ---
    try {
        const cookieStore = await cookies();
        const token =
            cookieStore.get("better-auth.session_token")?.value ||
            cookieStore.get("__Secure-better-auth.session_token")?.value;

        if (!token) return null;

        const sessions = await db
            .select({
                userId: sessionTable.userId,
                expiresAt: sessionTable.expiresAt,
            })
            .from(sessionTable)
            .where(
                and(
                    eq(sessionTable.token, token),
                    gt(sessionTable.expiresAt, new Date()),
                ),
            )
            .limit(1);

        if (sessions.length === 0) return null;
        const userId = sessions[0].userId;

        // Look up org membership directly
        const membership = await db
            .select({ organizationId: member.organizationId, role: member.role })
            .from(member)
            .where(eq(member.userId, userId))
            .limit(1);

        const orgId = membership[0]?.organizationId || "";
        const role = membership[0]?.role || "";

        console.log("[IDENTITY] Fallback resolved userId:", userId);
        return { userId, organizationId: orgId, role };
    } catch (fallbackErr) {
        console.error("[IDENTITY] Fallback session lookup also failed:", fallbackErr);
        return null;
    }
}
