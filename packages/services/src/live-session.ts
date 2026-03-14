// =============================================================================
// Live Session Service — Phase 9 + Phase C
// =============================================================================

import { db } from "@cols/database";
import { liveSession, sessionHostAssignment, sessionHost, sessionRsvp } from "@cols/database/schema";
import type { LiveSessionStatus } from "@cols/database/schema";
import { eq, desc, gte, and, sql } from "drizzle-orm";

export type { LiveSessionStatus };

// ── Get Upcoming Sessions ──

export async function getUpcomingSessions(limit = 5) {
    const now = new Date();
    return db
        .select()
        .from(liveSession)
        .where(
            and(
                gte(liveSession.scheduledAt, now),
                eq(liveSession.status, "scheduled"),
            )
        )
        .orderBy(liveSession.scheduledAt)
        .limit(limit);
}

// ── Get Next Session (for dashboard countdown) ──

export async function getNextSession() {
    const now = new Date();
    const rows = await db
        .select()
        .from(liveSession)
        .where(
            and(
                gte(liveSession.scheduledAt, now),
                eq(liveSession.status, "scheduled"),
            )
        )
        .orderBy(liveSession.scheduledAt)
        .limit(1);

    return rows[0] ?? null;
}

// ── Get Session by ID ──

export async function getSessionById(sessionId: string) {
    const rows = await db
        .select()
        .from(liveSession)
        .where(eq(liveSession.id, sessionId))
        .limit(1);

    return rows[0] ?? null;
}

// ── Get Session Detail (with hosts + RSVP) ──

export async function getSessionDetail(sessionId: string, userId?: string) {
    const session = await getSessionById(sessionId);
    if (!session) return null;

    // Get hosts
    const hosts = await db
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

    // Get RSVP count
    const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(sessionRsvp)
        .where(eq(sessionRsvp.sessionId, sessionId));
    const rsvpCount = countResult[0]?.count ?? 0;

    // Check if user has RSVP'd
    let userRsvp = false;
    if (userId) {
        const rsvpRows = await db
            .select({ id: sessionRsvp.id })
            .from(sessionRsvp)
            .where(and(
                eq(sessionRsvp.sessionId, sessionId),
                eq(sessionRsvp.userId, userId),
            ))
            .limit(1);
        userRsvp = rsvpRows.length > 0;
    }

    return {
        ...session,
        hosts,
        rsvpCount,
        userRsvp,
    };
}

// ── Toggle RSVP (idempotent) ──

export async function toggleSessionRsvp(sessionId: string, userId: string): Promise<boolean> {
    // Check existing RSVP
    const existing = await db
        .select({ id: sessionRsvp.id })
        .from(sessionRsvp)
        .where(and(
            eq(sessionRsvp.sessionId, sessionId),
            eq(sessionRsvp.userId, userId),
        ))
        .limit(1);

    if (existing.length > 0) {
        // Remove RSVP
        await db
            .delete(sessionRsvp)
            .where(eq(sessionRsvp.id, existing[0].id));
        return false; // no longer RSVP'd
    } else {
        // Add RSVP
        await db
            .insert(sessionRsvp)
            .values({ sessionId, userId })
            .onConflictDoNothing();
        return true; // now RSVP'd
    }
}

// ── Get RSVP Count ──

export async function getSessionRsvpCount(sessionId: string): Promise<number> {
    const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(sessionRsvp)
        .where(eq(sessionRsvp.sessionId, sessionId));
    return result[0]?.count ?? 0;
}

// ── Admin: List All Sessions ──

export async function listAllSessions(page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;

    const [rows, countResult] = await Promise.all([
        db
            .select()
            .from(liveSession)
            .orderBy(desc(liveSession.scheduledAt))
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: sql<number>`count(*)::int` })
            .from(liveSession),
    ]);

    return {
        sessions: rows,
        total: countResult[0]?.count ?? 0,
    };
}

// ── Admin: Create Session ──

export async function createSession(params: {
    title: string;
    description?: string;
    scheduledAt: Date;
    durationMinutes?: number;
    meetingUrl?: string;
    hostName?: string;
    programId?: string;
}) {
    const rows = await db
        .insert(liveSession)
        .values({
            title: params.title,
            description: params.description ?? null,
            scheduledAt: params.scheduledAt,
            durationMinutes: params.durationMinutes ?? 60,
            meetingUrl: params.meetingUrl ?? null,
            hostName: params.hostName ?? "Adam Farrar",
            programId: params.programId ?? null,
        })
        .returning();

    return rows[0];
}

// ── Admin: Update Session ──

export async function updateSession(
    sessionId: string,
    params: Partial<{
        title: string;
        description: string | null;
        scheduledAt: Date;
        durationMinutes: number;
        status: LiveSessionStatus;
        meetingUrl: string | null;
        recordingUrl: string | null;
        hostName: string;
        programId: string | null;
    }>,
) {
    const rows = await db
        .update(liveSession)
        .set({ ...params, updatedAt: new Date() })
        .where(eq(liveSession.id, sessionId))
        .returning();

    return rows[0] ?? null;
}

// ── Admin: Delete Session ──

export async function deleteSession(sessionId: string): Promise<boolean> {
    const result = await db
        .delete(liveSession)
        .where(eq(liveSession.id, sessionId))
        .returning({ id: liveSession.id });

    return result.length > 0;
}

// ── Get Past Sessions (with recordings) ──

export async function getPastSessionsWithRecordings(limit = 10) {
    return db
        .select()
        .from(liveSession)
        .where(eq(liveSession.status, "completed"))
        .orderBy(desc(liveSession.scheduledAt))
        .limit(limit);
}

