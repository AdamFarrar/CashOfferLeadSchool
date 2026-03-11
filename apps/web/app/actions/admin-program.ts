"use server";

// =============================================================================
// Admin Program Server Actions — Episode Management
// =============================================================================
// Admin-only actions for managing episode metadata (video URLs, transcripts,
// descriptions, duration). Uses requireAdmin() guard.
// This is NOT a CMS — it's structured data field editing.
// =============================================================================

import { requireAdmin } from "./guards";
import { db } from "@cocs/database/client";
import { program, module, episode } from "@cocs/database/schema";
import { eq, asc, inArray } from "drizzle-orm";

// ── List all episodes grouped by module ──

export async function listProgramEpisodesAction() {
    await requireAdmin();

    const programs = await db
        .select()
        .from(program)
        .where(eq(program.status, "active"))
        .limit(1);

    if (programs.length === 0) return { program: null, modules: [] };
    const prog = programs[0];

    const modules_ = await db
        .select()
        .from(module)
        .where(eq(module.programId, prog.id))
        .orderBy(asc(module.orderIndex));

    const moduleIds = modules_.map((m) => m.id);
    if (moduleIds.length === 0) return { program: prog, modules: [] };

    const episodes = await db
        .select()
        .from(episode)
        .where(inArray(episode.moduleId, moduleIds))
        .orderBy(asc(episode.orderIndex));

    const result = modules_.map((mod) => ({
        id: mod.id,
        title: mod.title,
        orderIndex: mod.orderIndex,
        episodes: episodes
            .filter((ep) => ep.moduleId === mod.id)
            .map((ep) => ({
                id: ep.id,
                title: ep.title,
                description: ep.description,
                videoUrl: ep.videoUrl,
                durationSeconds: ep.durationSeconds,
                orderIndex: ep.orderIndex,
                unlockWeek: ep.unlockWeek,
                transcript: ep.transcript,
            })),
    }));

    return { program: prog, modules: result };
}

// ── Update episode metadata ──

interface UpdateEpisodeInput {
    episodeId: string;
    title?: string;
    description?: string;
    videoUrl?: string;
    durationSeconds?: number | null;
    transcript?: string;
}

export async function updateEpisodeAction(input: UpdateEpisodeInput) {
    const identity = await requireAdmin();

    if (!input.episodeId) {
        return { success: false, error: "Episode ID is required." };
    }

    // Validate title length
    if (input.title !== undefined && input.title.length > 255) {
        return { success: false, error: "Title must be under 255 characters." };
    }

    // Validate video URL format (basic)
    if (input.videoUrl !== undefined && input.videoUrl.length > 0) {
        if (input.videoUrl.length > 2000) {
            return { success: false, error: "Video URL too long." };
        }
        if (!input.videoUrl.startsWith("http")) {
            return { success: false, error: "Video URL must start with http." };
        }
    }

    // Validate duration
    if (input.durationSeconds !== undefined && input.durationSeconds !== null) {
        if (input.durationSeconds < 0 || input.durationSeconds > 86400) {
            return { success: false, error: "Duration must be between 0 and 86400 seconds." };
        }
    }

    // Validate transcript length
    if (input.transcript !== undefined && input.transcript.length > 500000) {
        return { success: false, error: "Transcript too long (max 500k characters)." };
    }

    try {
        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.title = input.title.trim();
        if (input.description !== undefined) updateData.description = input.description.trim() || null;
        if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl.trim() || null;
        if (input.durationSeconds !== undefined) updateData.durationSeconds = input.durationSeconds;
        if (input.transcript !== undefined) updateData.transcript = input.transcript.trim() || null;

        if (Object.keys(updateData).length === 0) {
            return { success: false, error: "No fields to update." };
        }

        await db
            .update(episode)
            .set(updateData)
            .where(eq(episode.id, input.episodeId));

        return { success: true };
    } catch (err) {
        console.error("[ADMIN] Update episode error:", err);
        return { success: false, error: "Failed to update episode." };
    }
}
