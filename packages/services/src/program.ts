// =============================================================================
// Program Service — Phase 2
// =============================================================================
// Business logic for the program delivery system.
// All queries enforce server-side identity. No client-trusted data.
// =============================================================================

import { db } from "@cocs/database/client";
import {
    program,
    module,
    episode,
    episodeProgress,
    moduleProgress,
    programProgress,
    episodeNote,
    episodeAsset,
    eventLog,
} from "@cocs/database/schema";
import { eq, and, asc, inArray } from "drizzle-orm";

// ── Types ──

export interface ProgramWithModules {
    id: string;
    title: string;
    description: string | null;
    cohortStartDate: Date | null;
    status: string;
    modules: ModuleWithEpisodes[];
}

export interface ModuleWithEpisodes {
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    episodes: EpisodeWithStatus[];
}

export interface EpisodeWithStatus {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    durationSeconds: number | null;
    orderIndex: number;
    unlockWeek: number;
    moduleId: string;
    completed: boolean;
    locked: boolean;
}

export interface EpisodeDetail {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    durationSeconds: number | null;
    unlockWeek: number;
    moduleId: string;
    moduleTitle: string;
    moduleOrderIndex: number;
    completed: boolean;
    locked: boolean;
    note: string | null;
    assets: { id: string; title: string; fileUrl: string; fileType: string | null }[];
    prevEpisodeId: string | null;
    nextEpisodeId: string | null;
}

// ── Unlock Logic ──

export function isEpisodeUnlocked(unlockWeek: number, cohortStartDate: Date | null): boolean {
    if (!cohortStartDate) return true; // No cohort date = all unlocked
    const now = new Date();
    const diffMs = now.getTime() - cohortStartDate.getTime();
    const weeksSinceStart = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    return weeksSinceStart >= unlockWeek;
}

// ── Event Log ──

export async function logEvent(
    userId: string,
    organizationId: string | undefined,
    eventType: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>,
): Promise<void> {
    try {
        await db.insert(eventLog).values({
            userId,
            organizationId: organizationId ?? null,
            eventType,
            entityType,
            entityId,
            metadataJson: metadata ?? {},
        });
    } catch (err) {
        // Event logging is non-blocking — never break the user flow
        console.error("[EVENT_LOG] Failed to log event:", eventType, err);
    }
}

// ── Queries ──

export async function getActiveProgram(userId: string): Promise<ProgramWithModules | null> {
    // Get the active program
    const programs = await db
        .select()
        .from(program)
        .where(eq(program.status, "active"))
        .limit(1);

    if (programs.length === 0) return null;
    const prog = programs[0];

    // Get all modules ordered
    const modules = await db
        .select()
        .from(module)
        .where(eq(module.programId, prog.id))
        .orderBy(asc(module.orderIndex));

    if (modules.length === 0) {
        return {
            id: prog.id,
            title: prog.title,
            description: prog.description,
            cohortStartDate: prog.cohortStartDate,
            status: prog.status,
            modules: [],
        };
    }

    // Get all episodes for all modules
    const moduleIds = modules.map((m) => m.id);
    const episodes = await db
        .select()
        .from(episode)
        .where(inArray(episode.moduleId, moduleIds))
        .orderBy(asc(episode.orderIndex));

    // Get progress for this user
    const episodeIds = episodes.map((e) => e.id);
    let progressMap: Map<string, boolean> = new Map();

    if (episodeIds.length > 0) {
        const progress = await db
            .select()
            .from(episodeProgress)
            .where(
                and(
                    eq(episodeProgress.userId, userId),
                    inArray(episodeProgress.episodeId, episodeIds),
                ),
            );
        for (const p of progress) {
            progressMap.set(p.episodeId, p.completed);
        }
    }

    // Build result
    const modulesWithEpisodes: ModuleWithEpisodes[] = modules.map((mod) => {
        const modEpisodes = episodes.filter((e) => e.moduleId === mod.id);
        return {
            id: mod.id,
            title: mod.title,
            description: mod.description,
            orderIndex: mod.orderIndex,
            episodes: modEpisodes.map((ep) => ({
                id: ep.id,
                title: ep.title,
                description: ep.description,
                videoUrl: ep.videoUrl,
                durationSeconds: ep.durationSeconds,
                orderIndex: ep.orderIndex,
                unlockWeek: ep.unlockWeek,
                moduleId: ep.moduleId,
                completed: progressMap.get(ep.id) ?? false,
                locked: !isEpisodeUnlocked(ep.unlockWeek, prog.cohortStartDate),
            })),
        };
    });

    return {
        id: prog.id,
        title: prog.title,
        description: prog.description,
        cohortStartDate: prog.cohortStartDate,
        status: prog.status,
        modules: modulesWithEpisodes,
    };
}

export async function getEpisodeDetail(
    episodeId: string,
    userId: string,
): Promise<EpisodeDetail | null> {
    // Get episode
    const episodes = await db
        .select()
        .from(episode)
        .where(eq(episode.id, episodeId))
        .limit(1);

    if (episodes.length === 0) return null;
    const ep = episodes[0];

    // Get module
    const modules = await db
        .select()
        .from(module)
        .where(eq(module.id, ep.moduleId))
        .limit(1);

    if (modules.length === 0) return null;
    const mod = modules[0];

    // Get program for cohort date
    const programs = await db
        .select()
        .from(program)
        .where(eq(program.id, mod.programId))
        .limit(1);

    const cohortStartDate = programs[0]?.cohortStartDate ?? null;
    const locked = !isEpisodeUnlocked(ep.unlockWeek, cohortStartDate);

    // Get progress
    const progressRows = await db
        .select()
        .from(episodeProgress)
        .where(
            and(
                eq(episodeProgress.userId, userId),
                eq(episodeProgress.episodeId, episodeId),
            ),
        )
        .limit(1);

    const completed = progressRows[0]?.completed ?? false;

    // Get note
    const noteRows = await db
        .select()
        .from(episodeNote)
        .where(
            and(
                eq(episodeNote.userId, userId),
                eq(episodeNote.episodeId, episodeId),
            ),
        )
        .limit(1);

    const note = noteRows[0]?.content ?? null;

    // Get assets
    const assets = await db
        .select()
        .from(episodeAsset)
        .where(eq(episodeAsset.episodeId, episodeId));

    // Get prev/next episodes in module order
    const allModuleEpisodes = await db
        .select()
        .from(episode)
        .where(eq(episode.moduleId, ep.moduleId))
        .orderBy(asc(episode.orderIndex));

    const currentIdx = allModuleEpisodes.findIndex((e) => e.id === episodeId);
    const prevEpisodeId = currentIdx > 0 ? allModuleEpisodes[currentIdx - 1].id : null;
    const nextEpisodeId = currentIdx < allModuleEpisodes.length - 1 ? allModuleEpisodes[currentIdx + 1].id : null;

    return {
        id: ep.id,
        title: ep.title,
        description: ep.description,
        videoUrl: ep.videoUrl,
        durationSeconds: ep.durationSeconds,
        unlockWeek: ep.unlockWeek,
        moduleId: mod.id,
        moduleTitle: mod.title,
        moduleOrderIndex: mod.orderIndex,
        completed,
        locked,
        note,
        assets: assets.map((a) => ({
            id: a.id,
            title: a.title,
            fileUrl: a.fileUrl,
            fileType: a.fileType,
        })),
        prevEpisodeId,
        nextEpisodeId,
    };
}

export async function markEpisodeComplete(
    userId: string,
    episodeId: string,
): Promise<void> {
    // Upsert episode progress
    await db
        .insert(episodeProgress)
        .values({
            userId,
            episodeId,
            completed: true,
            completedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [episodeProgress.userId, episodeProgress.episodeId],
            set: {
                completed: true,
                completedAt: new Date(),
            },
        });
}

export async function saveEpisodeNote(
    userId: string,
    episodeId: string,
    content: string,
): Promise<void> {
    await db
        .insert(episodeNote)
        .values({
            userId,
            episodeId,
            content,
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [episodeNote.userId, episodeNote.episodeId],
            set: {
                content,
                updatedAt: new Date(),
            },
        });
}

export async function getUserNotes(
    userId: string,
): Promise<{ episodeId: string; episodeTitle: string; moduleTitle: string; content: string; updatedAt: Date }[]> {
    const notes = await db
        .select({
            episodeId: episodeNote.episodeId,
            content: episodeNote.content,
            updatedAt: episodeNote.updatedAt,
            episodeTitle: episode.title,
            moduleTitle: module.title,
        })
        .from(episodeNote)
        .innerJoin(episode, eq(episodeNote.episodeId, episode.id))
        .innerJoin(module, eq(episode.moduleId, module.id))
        .where(eq(episodeNote.userId, userId))
        .orderBy(asc(module.orderIndex), asc(episode.orderIndex));

    return notes;
}

export async function getAllAssets(): Promise<
    { id: string; title: string; fileUrl: string; fileType: string | null; episodeTitle: string; moduleTitle: string }[]
> {
    const assets = await db
        .select({
            id: episodeAsset.id,
            title: episodeAsset.title,
            fileUrl: episodeAsset.fileUrl,
            fileType: episodeAsset.fileType,
            episodeTitle: episode.title,
            moduleTitle: module.title,
        })
        .from(episodeAsset)
        .innerJoin(episode, eq(episodeAsset.episodeId, episode.id))
        .innerJoin(module, eq(episode.moduleId, module.id))
        .orderBy(asc(module.orderIndex), asc(episode.orderIndex));

    return assets;
}
