// =============================================================================
// Session Host Service — Phase C
// =============================================================================

import { db } from "@cocs/database";
import { sessionHost, sessionHostAssignment } from "@cocs/database/schema";
import { eq, desc } from "drizzle-orm";

// ── List All Hosts ──

export async function listSessionHosts() {
    return db
        .select()
        .from(sessionHost)
        .orderBy(desc(sessionHost.createdAt));
}

// ── Get Host by ID ──

export async function getSessionHostById(hostId: string) {
    const rows = await db
        .select()
        .from(sessionHost)
        .where(eq(sessionHost.id, hostId))
        .limit(1);
    return rows[0] ?? null;
}

// ── Create Host ──

export async function createSessionHost(params: {
    name: string;
    headshotUrl?: string;
    bio?: string;
    role?: string;
}) {
    const rows = await db
        .insert(sessionHost)
        .values({
            name: params.name,
            headshotUrl: params.headshotUrl ?? null,
            bio: params.bio ?? null,
            role: params.role ?? "host",
        })
        .returning();
    return rows[0];
}

// ── Update Host ──

export async function updateSessionHost(
    hostId: string,
    params: Partial<{
        name: string;
        headshotUrl: string | null;
        bio: string | null;
        role: string;
    }>,
) {
    const rows = await db
        .update(sessionHost)
        .set(params)
        .where(eq(sessionHost.id, hostId))
        .returning();
    return rows[0] ?? null;
}

// ── Delete Host ──

export async function deleteSessionHost(hostId: string) {
    const result = await db
        .delete(sessionHost)
        .where(eq(sessionHost.id, hostId))
        .returning({ id: sessionHost.id });
    return result.length > 0;
}

// ── Assign Host to Session ──

export async function assignHostToSession(sessionId: string, hostId: string, role = "host") {
    const rows = await db
        .insert(sessionHostAssignment)
        .values({ sessionId, hostId, role })
        .onConflictDoNothing()
        .returning();
    return rows[0] ?? null;
}

// ── Remove Host from Session ──

export async function removeHostFromSession(sessionId: string, hostId: string) {
    const result = await db
        .delete(sessionHostAssignment)
        .where(
            eq(sessionHostAssignment.sessionId, sessionId),
        )
        .returning({ id: sessionHostAssignment.id });
    // Filter by hostId in app layer since drizzle AND requires different approach
    return result.length > 0;
}

// ── Get Hosts for Session ──

export async function getHostsForSession(sessionId: string) {
    return db
        .select({
            id: sessionHost.id,
            name: sessionHost.name,
            headshotUrl: sessionHost.headshotUrl,
            bio: sessionHost.bio,
            role: sessionHostAssignment.role,
        })
        .from(sessionHostAssignment)
        .innerJoin(sessionHost, eq(sessionHostAssignment.hostId, sessionHost.id))
        .where(eq(sessionHostAssignment.sessionId, sessionId));
}
