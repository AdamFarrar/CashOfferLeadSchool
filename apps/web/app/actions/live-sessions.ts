"use server";

// =============================================================================
// Live Session Server Actions — Phase 9 + Phase C
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
    getSessionDetail,
    toggleSessionRsvp,
    listSessionHosts,
    createSessionHost,
    assignHostToSession,
    removeHostFromSession,
} from "@cocs/services";
import type { LiveSessionStatus } from "@cocs/services";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

// ── User: Get Session Detail (with hosts + RSVP) ──

export async function getSessionDetailAction(sessionId: string) {
    if (!UUID_RE.test(sessionId)) return { success: false, session: null };
    const identity = await getServerIdentity();
    if (!identity) return { success: false, session: null };

    const session = await getSessionDetail(sessionId, identity.userId);
    if (!session) return { success: false, session: null };

    return { success: true, session };
}

// ── User: Toggle RSVP ──

export async function toggleRsvpAction(sessionId: string) {
    if (!UUID_RE.test(sessionId)) return { success: false, rsvpd: false };
    const identity = await getServerIdentity();
    if (!identity) return { success: false, rsvpd: false };

    const rsvpd = await toggleSessionRsvp(sessionId, identity.userId);
    return { success: true, rsvpd };
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
    programId?: string;
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
        programId: string | null;
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

// ── Admin: List Hosts ──

export async function adminListHostsAction() {
    await requireAdmin();
    const hosts = await listSessionHosts();
    return { success: true, hosts };
}

// ── Admin: Create Host ──

export async function adminCreateHostAction(params: {
    name: string;
    headshotUrl?: string;
    bio?: string;
    role?: string;
}) {
    await requireAdmin();
    if (!params.name?.trim()) return { success: false, error: "Host name required." };

    const host = await createSessionHost(params);
    return { success: true, host };
}

// ── Admin: Assign Host to Session ──

export async function adminAssignHostAction(sessionId: string, hostId: string, role = "host") {
    await requireAdmin();
    const assignment = await assignHostToSession(sessionId, hostId, role);
    return { success: true, assignment };
}

// ── Admin: Remove Host from Session ──

export async function adminRemoveHostAction(sessionId: string, hostId: string) {
    await requireAdmin();
    await removeHostFromSession(sessionId, hostId);
    return { success: true };
}
