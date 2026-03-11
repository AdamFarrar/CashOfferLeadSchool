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
    programId: string;
    completed: boolean;
    locked: boolean;
    note: string | null;
    transcript: string | null;
    lastPositionSeconds: number;
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
            episodes: modEpisodes.map((ep) => {
                const locked = !isEpisodeUnlocked(ep.unlockWeek, prog.cohortStartDate);
                return {
                    id: ep.id,
                    title: ep.title,
                    description: ep.description,
                    videoUrl: locked ? null : ep.videoUrl, // Enforce at query layer
                    durationSeconds: ep.durationSeconds,
                    orderIndex: ep.orderIndex,
                    unlockWeek: ep.unlockWeek,
                    moduleId: ep.moduleId,
                    completed: progressMap.get(ep.id) ?? false,
                    locked,
                };
            }),
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
        videoUrl: locked ? null : ep.videoUrl,
        durationSeconds: ep.durationSeconds,
        unlockWeek: ep.unlockWeek,
        moduleId: mod.id,
        moduleTitle: mod.title,
        moduleOrderIndex: mod.orderIndex,
        programId: mod.programId,
        completed,
        locked,
        note: locked ? null : note,
        transcript: locked ? null : ep.transcript ?? null,
        lastPositionSeconds: progressRows[0]?.lastPositionSeconds ?? 0,
        assets: locked ? [] : assets.map((a) => ({
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

// ── Resume Position ──

export async function updateResumePosition(
    userId: string,
    episodeId: string,
    positionSeconds: number,
    durationSeconds: number | null,
): Promise<{ autoCompleted: boolean }> {
    const now = new Date();
    const shouldAutoComplete = durationSeconds ? positionSeconds >= durationSeconds * 0.9 : false;

    await db
        .insert(episodeProgress)
        .values({
            userId,
            episodeId,
            lastPositionSeconds: positionSeconds,
            lastWatchedAt: now,
            completed: shouldAutoComplete,
            completedAt: shouldAutoComplete ? now : null,
        })
        .onConflictDoUpdate({
            target: [episodeProgress.userId, episodeProgress.episodeId],
            set: {
                lastPositionSeconds: positionSeconds,
                lastWatchedAt: now,
                ...(shouldAutoComplete ? { completed: true, completedAt: now } : {}),
            },
        });

    return { autoCompleted: shouldAutoComplete };
}

// ── Dashboard Progress ──

export interface DashboardProgress {
    programTitle: string;
    programId: string;
    cohortStartDate: Date | null;
    totalEpisodes: number;
    completedEpisodes: number;
    progressPercent: number;
    currentWeek: number;
    modules: {
        id: string;
        title: string;
        orderIndex: number;
        totalEpisodes: number;
        completedEpisodes: number;
    }[];
    nextEpisode: { id: string; title: string; moduleTitle: string } | null;
    resumeEpisode: { id: string; title: string; lastPositionSeconds: number } | null;
}

export async function getProgramProgressForDashboard(
    userId: string,
): Promise<DashboardProgress | null> {
    // Get active program
    const programs = await db
        .select()
        .from(program)
        .where(eq(program.status, "active"))
        .limit(1);

    if (programs.length === 0) return null;
    const prog = programs[0];

    const cohortStartDate = prog.cohortStartDate;
    const now = new Date();
    const currentWeek = cohortStartDate
        ? Math.floor((now.getTime() - cohortStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        : 0;

    // Get modules
    const modules = await db
        .select()
        .from(module)
        .where(eq(module.programId, prog.id))
        .orderBy(asc(module.orderIndex));

    // Get all episodes
    const moduleIds = modules.map((m) => m.id);
    if (moduleIds.length === 0) return null;

    const episodes = await db
        .select()
        .from(episode)
        .where(inArray(episode.moduleId, moduleIds))
        .orderBy(asc(episode.orderIndex));

    // Get progress
    const episodeIds = episodes.map((e) => e.id);
    const progress = episodeIds.length > 0
        ? await db
            .select()
            .from(episodeProgress)
            .where(
                and(
                    eq(episodeProgress.userId, userId),
                    inArray(episodeProgress.episodeId, episodeIds),
                ),
            )
        : [];

    const progressMap = new Map(progress.map((p) => [p.episodeId, p]));
    const completedEpisodes = progress.filter((p) => p.completed).length;

    // Build module progress
    const moduleStats = modules.map((mod) => {
        const modEps = episodes.filter((e) => e.moduleId === mod.id);
        const modCompleted = modEps.filter((e) => progressMap.get(e.id)?.completed).length;
        return {
            id: mod.id,
            title: mod.title,
            orderIndex: mod.orderIndex,
            totalEpisodes: modEps.length,
            completedEpisodes: modCompleted,
        };
    });

    // Find next uncompleted unlocked episode
    let nextEpisode = null;
    for (const ep of episodes) {
        const p = progressMap.get(ep.id);
        if (!p?.completed && isEpisodeUnlocked(ep.unlockWeek, cohortStartDate)) {
            const mod = modules.find((m) => m.id === ep.moduleId);
            nextEpisode = {
                id: ep.id,
                title: ep.title,
                moduleTitle: mod?.title ?? "",
            };
            break;
        }
    }

    // Find most recently watched episode for resume
    let resumeEpisode = null;
    const recentProgress = progress
        .filter((p) => p.lastWatchedAt && !p.completed && (p.lastPositionSeconds ?? 0) > 0)
        .sort((a, b) => {
            const aTime = a.lastWatchedAt?.getTime() ?? 0;
            const bTime = b.lastWatchedAt?.getTime() ?? 0;
            return bTime - aTime;
        });

    if (recentProgress.length > 0) {
        const rp = recentProgress[0];
        const ep = episodes.find((e) => e.id === rp.episodeId);
        if (ep) {
            resumeEpisode = {
                id: ep.id,
                title: ep.title,
                lastPositionSeconds: rp.lastPositionSeconds ?? 0,
            };
        }
    }

    return {
        programTitle: prog.title,
        programId: prog.id,
        cohortStartDate,
        totalEpisodes: episodes.length,
        completedEpisodes,
        progressPercent: episodes.length > 0 ? Math.round((completedEpisodes / episodes.length) * 100) : 0,
        currentWeek,
        modules: moduleStats,
        nextEpisode,
        resumeEpisode,
    };
}
