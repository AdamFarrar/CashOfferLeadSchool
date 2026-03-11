"use server";

// =============================================================================
// Program Server Actions — Phase 3
// =============================================================================
// All actions use getServerIdentity() — never trust client.
// Enhanced with resume watching, episode playback events, and dashboard progress.
// =============================================================================

import {
    getActiveProgram,
    getEpisodeDetail,
    markEpisodeComplete as markEpisodeCompleteSvc,
    saveEpisodeNote as saveEpisodeNoteSvc,
    getUserNotes as getUserNotesSvc,
    getAllAssets,
    logEvent,
    updateResumePosition as updateResumePositionSvc,
    getProgramProgressForDashboard as getProgressSvc,
} from "@cocs/services";
import { getServerIdentity } from "./identity";

export async function getProgram() {
    const identity = await getServerIdentity();
    if (!identity) return null;

    const program = await getActiveProgram(identity.userId);

    if (program) {
        await logEvent(
            identity.userId,
            identity.organizationId,
            "program_viewed",
            "program",
            program.id,
        );
    }

    return program;
}

export async function getEpisode(episodeId: string) {
    const identity = await getServerIdentity();
    if (!identity) return null;

    const episode = await getEpisodeDetail(episodeId, identity.userId);
    if (!episode) return null;

    await logEvent(
        identity.userId,
        identity.organizationId,
        "episode_viewed",
        "episode",
        episodeId,
        { moduleId: episode.moduleId, title: episode.title, locked: episode.locked },
    );

    return episode;
}

export async function markComplete(episodeId: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Authentication required." };

    try {
        await markEpisodeCompleteSvc(identity.userId, episodeId);

        await logEvent(
            identity.userId,
            identity.organizationId,
            "episode_completed",
            "episode",
            episodeId,
        );

        return { success: true };
    } catch (err) {
        console.error("[PROGRAM] Mark complete error:", err);
        return { success: false, error: "Failed to mark episode complete." };
    }
}

export async function saveNote(episodeId: string, content: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Authentication required." };

    if (content.length > 10000) {
        return { success: false, error: "Note is too long (max 10,000 characters)." };
    }

    try {
        await saveEpisodeNoteSvc(identity.userId, episodeId, content);

        await logEvent(
            identity.userId,
            identity.organizationId,
            content.length > 0 ? "note_updated" : "note_created",
            "episode_note",
            episodeId,
            { length: content.length },
        );

        return { success: true };
    } catch (err) {
        console.error("[PROGRAM] Save note error:", err);
        return { success: false, error: "Failed to save note." };
    }
}

export async function getNotes() {
    const identity = await getServerIdentity();
    if (!identity) return [];

    return getUserNotesSvc(identity.userId);
}

export async function getDownloadAssets() {
    const identity = await getServerIdentity();
    if (!identity) return [];

    return getAllAssets();
}

// ── Phase 3: Playback Events ──

export async function logPlaybackEvent(
    episodeId: string,
    eventType: "episode_started" | "episode_paused" | "episode_resumed" | "episode_completed",
    metadata?: { moduleId?: string; programId?: string; positionSeconds?: number },
) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false };

    await logEvent(
        identity.userId,
        identity.organizationId,
        eventType,
        "episode",
        episodeId,
        {
            episode_id: episodeId,
            module_id: metadata?.moduleId ?? null,
            program_id: metadata?.programId ?? null,
            position_seconds: metadata?.positionSeconds ?? null,
        },
    );

    return { success: true };
}

// ── Phase 3: Resume Position ──

export async function updatePosition(
    episodeId: string,
    positionSeconds: number,
    durationSeconds: number | null,
) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, autoCompleted: false };

    try {
        const result = await updateResumePositionSvc(
            identity.userId,
            episodeId,
            positionSeconds,
            durationSeconds,
        );

        if (result.autoCompleted) {
            await logEvent(
                identity.userId,
                identity.organizationId,
                "episode_completed",
                "episode",
                episodeId,
                { auto: true, position_seconds: positionSeconds },
            );
        }

        return { success: true, autoCompleted: result.autoCompleted };
    } catch (err) {
        console.error("[PROGRAM] Update position error:", err);
        return { success: false, autoCompleted: false };
    }
}

// ── Phase 3: Dashboard Progress ──

export async function getDashboardProgress() {
    const identity = await getServerIdentity();
    if (!identity) return null;

    return getProgressSvc(identity.userId);
}
