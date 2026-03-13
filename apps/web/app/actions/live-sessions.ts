"use server";

// =============================================================================
// Live Session Server Actions — Phase 9
// =============================================================================

import { getServerIdentity } from "./identity";
import { requireAdmin } from "./guards";
import {
    getUpcomingSessions,
    getNextSession,
    getPastSessionsWithRecordings,
    listAllSessions,
    createSession,
    updateSession,
    deleteSession,
} from "@cocs/services";
import type { LiveSessionStatus } from "@cocs/services";

// ── User: Get Upcoming Sessions ──

export async function getUpcomingSessionsAction() {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, sessions: [] };

    const sessions = await getUpcomingSessions(10);
    return { success: true, sessions };
}

// ── User: Get Next Session (for dashboard countdown) ──

export async function getNextSessionAction() {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, session: null };

    const session = await getNextSession();
    return { success: true, session };
}

// ── User: Get Past Sessions (recordings) ──

export async function getPastSessionsAction() {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, sessions: [] };

    const sessions = await getPastSessionsWithRecordings(20);
    return { success: true, sessions };
}

// ── Admin: List All ──

export async function adminListSessionsAction(page = 1) {
    await requireAdmin();
    return { success: true, ...(await listAllSessions(page)) };
}

// ── Admin: Create ──

export async function adminCreateSessionAction(params: {
    title: string;
    description?: string;
    scheduledAt: string;
    durationMinutes?: number;
    meetingUrl?: string;
    hostName?: string;
}) {
    await requireAdmin();

    if (!params.title?.trim()) return { success: false, error: "Title required." };
    if (!params.scheduledAt) return { success: false, error: "Date required." };

    const session = await createSession({
        ...params,
        scheduledAt: new Date(params.scheduledAt),
    });

    return { success: true, session };
}

// ── Admin: Update ──

export async function adminUpdateSessionAction(
    sessionId: string,
    params: Partial<{
        title: string;
        description: string | null;
        scheduledAt: string;
        durationMinutes: number;
        status: LiveSessionStatus;
        meetingUrl: string | null;
        recordingUrl: string | null;
        hostName: string;
    }>,
) {
    await requireAdmin();

    const updateParams: Record<string, unknown> = { ...params };
    if (params.scheduledAt) {
        updateParams.scheduledAt = new Date(params.scheduledAt);
    }

    const session = await updateSession(sessionId, updateParams as Parameters<typeof updateSession>[1]);
    return { success: true, session };
}

// ── Admin: Delete ──

export async function adminDeleteSessionAction(sessionId: string) {
    await requireAdmin();
    const deleted = await deleteSession(sessionId);
    return { success: deleted, error: deleted ? undefined : "Session not found." };
}
