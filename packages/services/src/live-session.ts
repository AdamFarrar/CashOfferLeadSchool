// =============================================================================
// Live Session Service — Phase 9
// =============================================================================

import { db } from "@cocs/database";
import { liveSession } from "@cocs/database/schema";
import type { LiveSessionStatus } from "@cocs/database/schema";
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
