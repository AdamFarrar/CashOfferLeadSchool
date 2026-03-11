"use server";

// =============================================================================
// Program Server Actions — Phase 2
// =============================================================================
// Server actions for the program delivery system.
// All actions use getServerIdentity() — never trust client.
// =============================================================================

import {
    getActiveProgram,
    getEpisodeDetail,
    markEpisodeComplete as markEpisodeCompleteSvc,
    saveEpisodeNote as saveEpisodeNoteSvc,
    getUserNotes as getUserNotesSvc,
    getAllAssets,
    logEvent,
} from "@cocs/services";
import { getServerIdentity } from "./identity";

export async function getProgram() {
    const identity = await getServerIdentity();
    if (!identity) return null;

    const program = await getActiveProgram(identity.userId);

    // Log event
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

    // Don't return locked episodes
    if (episode.locked) {
        return { ...episode, videoUrl: null, note: null, assets: [] };
    }

    // Log event
    await logEvent(
        identity.userId,
        identity.organizationId,
        "episode_viewed",
        "episode",
        episodeId,
        { moduleId: episode.moduleId, title: episode.title },
    );

    return episode;
}

export async function markComplete(episodeId: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Authentication required." };

    try {
        await markEpisodeCompleteSvc(identity.userId, episodeId);

        // Log event
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

    // Limit note length
    if (content.length > 10000) {
        return { success: false, error: "Note is too long (max 10,000 characters)." };
    }

    try {
        await saveEpisodeNoteSvc(identity.userId, episodeId, content);

        // Log event
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
