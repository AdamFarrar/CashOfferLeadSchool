"use server";

// =============================================================================
// Admin Program Server Actions — Program + Episode Management
// =============================================================================
// Admin-only actions for managing programs, modules, and episode metadata.
// Uses requireAdmin() guard for all actions.
// =============================================================================

import { requireAdmin } from "./guards";
import { db } from "@cols/database/client";
import { program, module, episode } from "@cols/database/schema";
import { eq, asc, desc, inArray } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ── List all programs ──

export async function listAllProgramsAction() {
    await requireAdmin();

    const programs = await db
        .select({
            id: program.id,
            title: program.title,
            description: program.description,
            slug: program.slug,
            status: program.status,
            previewImageUrl: program.previewImageUrl,
            cohortStartDate: program.cohortStartDate,
            createdAt: program.createdAt,
        })
        .from(program)
        .orderBy(desc(program.createdAt));

    return JSON.parse(JSON.stringify(programs));
}

// ── Create program ──

interface CreateProgramInput {
    title: string;
    description?: string;
    slug?: string;
    status?: "draft" | "active" | "archived";
}

export async function createProgramAction(input: CreateProgramInput) {
    const identity = await requireAdmin();

    if (!input.title || input.title.trim().length === 0) {
        return { success: false, error: "Title is required." };
    }
    if (input.title.length > 255) {
        return { success: false, error: "Title must be under 255 characters." };
    }
    if (input.slug && !SLUG_RE.test(input.slug)) {
        return { success: false, error: "Slug must be lowercase letters, numbers, and hyphens." };
    }

    try {
        const [created] = await db
            .insert(program)
            .values({
                title: input.title.trim(),
                description: input.description?.trim() || null,
                slug: input.slug?.trim() || null,
                status: input.status || "draft",
                organizationId: identity.organizationId || null,
            })
            .returning({ id: program.id });

        return { success: true, programId: created.id };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("idx_program_slug")) {
            return { success: false, error: "A program with this slug already exists." };
        }
        console.error("[ADMIN] Create program error:", err);
        return { success: false, error: "Failed to create program." };
    }
}

// ── Update program metadata ──

interface UpdateProgramInput {
    programId: string;
    title?: string;
    description?: string;
    slug?: string;
    status?: "draft" | "active" | "archived";
    previewImageUrl?: string;
}

export async function updateProgramAction(input: UpdateProgramInput) {
    const identity = await requireAdmin();

    if (!input.programId || !UUID_RE.test(input.programId)) {
        return { success: false, error: "Valid program ID is required." };
    }
    if (input.title !== undefined && input.title.trim().length === 0) {
        return { success: false, error: "Title cannot be empty." };
    }
    if (input.title !== undefined && input.title.length > 255) {
        return { success: false, error: "Title must be under 255 characters." };
    }
    if (input.slug !== undefined && input.slug.length > 0 && !SLUG_RE.test(input.slug)) {
        return { success: false, error: "Slug must be lowercase letters, numbers, and hyphens." };
    }

    try {
        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.title = input.title.trim();
        if (input.description !== undefined) updateData.description = input.description.trim() || null;
        if (input.slug !== undefined) updateData.slug = input.slug.trim() || null;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.previewImageUrl !== undefined) updateData.previewImageUrl = input.previewImageUrl.trim() || null;
        updateData.updatedAt = new Date();

        if (Object.keys(updateData).length <= 1) {
            return { success: false, error: "No fields to update." };
        }

        // Verify org ownership (prevents cross-org IDOR)
        const [existing] = await db
            .select({ organizationId: program.organizationId })
            .from(program)
            .where(eq(program.id, input.programId))
            .limit(1);

        if (!existing) {
            return { success: false, error: "Program not found." };
        }
        if (existing.organizationId && existing.organizationId !== identity.organizationId) {
            return { success: false, error: "Unauthorized: program belongs to another organization." };
        }

        await db
            .update(program)
            .set(updateData)
            .where(eq(program.id, input.programId));

        return { success: true };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("idx_program_slug")) {
            return { success: false, error: "A program with this slug already exists." };
        }
        console.error("[ADMIN] Update program error:", err);
        return { success: false, error: "Failed to update program." };
    }
}

// ── List episodes for a specific program ──

export async function listProgramEpisodesAction(programId?: string) {
    await requireAdmin();

    let prog;
    if (programId && UUID_RE.test(programId)) {
        const result = await db
            .select()
            .from(program)
            .where(eq(program.id, programId))
            .limit(1);
        prog = result[0] ?? null;
    } else {
        // Fallback: first active program (backward compat)
        const result = await db
            .select()
            .from(program)
            .where(eq(program.status, "active"))
            .limit(1);
        prog = result[0] ?? null;
    }

    if (!prog) return { program: null, modules: [] };

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

    return JSON.parse(JSON.stringify({ program: prog, modules: result }));
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

    if (!input.episodeId || !UUID_RE.test(input.episodeId)) {
        return { success: false, error: "Valid episode ID is required." };
    }
    if (input.title !== undefined && input.title.length > 255) {
        return { success: false, error: "Title must be under 255 characters." };
    }
    if (input.videoUrl !== undefined && input.videoUrl.length > 0) {
        if (input.videoUrl.length > 2000) {
            return { success: false, error: "Video URL too long." };
        }
        if (!input.videoUrl.startsWith("http")) {
            return { success: false, error: "Video URL must start with http." };
        }
    }
    if (input.durationSeconds !== undefined && input.durationSeconds !== null) {
        if (input.durationSeconds < 0 || input.durationSeconds > 86400) {
            return { success: false, error: "Duration must be between 0 and 86400 seconds." };
        }
    }
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

        // Verify episode belongs to admin's org (prevents cross-org IDOR)
        const [epCheck] = await db
            .select({ orgId: program.organizationId })
            .from(episode)
            .innerJoin(module, eq(episode.moduleId, module.id))
            .innerJoin(program, eq(module.programId, program.id))
            .where(eq(episode.id, input.episodeId))
            .limit(1);

        if (!epCheck) {
            return { success: false, error: "Episode not found." };
        }
        if (epCheck.orgId && epCheck.orgId !== identity.organizationId) {
            return { success: false, error: "Unauthorized: episode belongs to another organization." };
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
