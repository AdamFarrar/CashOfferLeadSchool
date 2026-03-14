"use server";

import { auth } from "@cols/auth/server";
import { headers } from "next/headers";
import { db } from "@cols/database/client";
import { member } from "@cols/database/schema";
import { eq } from "drizzle-orm";

// =============================================================================
// Shared Server-Side Identity Resolver
// =============================================================================
// Resolves user identity from the authenticated session cookie.
// Falls back to direct DB lookup when activeOrganizationId is not set
// (e.g. first login before org activation).
// =============================================================================

export interface ServerIdentity {
    userId: string;
    organizationId: string;
    role: string;
}

export async function getServerIdentity(): Promise<ServerIdentity | null> {
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
        // No active org on session — look up the user's first org from DB
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

    return {
        userId: session.user.id,
        organizationId: orgId,
        role,
    };
}
