"use server";

// =============================================================================
// Program Server Actions
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
    checkRateLimit,
    rateLimitKey,
    getUserPrograms,
    getProgramBySlug,
    resolveSlugForEpisode,
} from "@cols/services";
import { getServerIdentity } from "./identity";
import { emitDomainEvent, DOMAIN_EVENTS } from "@cols/events";

// ── Rate Limit Configs ──

const RATE_LIMITS = {
    saveNote: { maxRequests: 20, windowMs: 60 * 60 * 1000, name: "save_note" },
    updatePosition: { maxRequests: 360, windowMs: 60 * 60 * 1000, name: "update_position" },
    markComplete: { maxRequests: 30, windowMs: 60 * 60 * 1000, name: "mark_complete" },
    playbackEvent: { maxRequests: 360, windowMs: 60 * 60 * 1000, name: "playback_event" },
} as const;

// ── Validation ──

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_POSITION_SECONDS = 86400; // 24 hours

function isValidUuid(id: string): boolean {
    return UUID_RE.test(id);
}

function isValidPosition(seconds: number): boolean {
    return Number.isFinite(seconds) && seconds >= 0 && seconds <= MAX_POSITION_SECONDS;
}

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
    if (!isValidUuid(episodeId)) return { success: false, error: "Invalid episode." };

    const rl = checkRateLimit(rateLimitKey("mark_complete", identity.userId), RATE_LIMITS.markComplete);
    if (!rl.allowed) return { success: false, error: "Too many requests. Please try again later." };

    try {
        await markEpisodeCompleteSvc(identity.userId, episodeId);

        await logEvent(
            identity.userId,
            identity.organizationId,
            "episode_completed",
            "episode",
            episodeId,
        );

        // Emit domain event for automation (milestone emails, etc.)
        emitDomainEvent({
            eventKey: DOMAIN_EVENTS.EPISODE_COMPLETED,
            actor: { type: "user", id: identity.userId },
            subject: { type: "episode", id: episodeId },
            organizationId: identity.organizationId,
            payload: { episodeId },
        }).catch(() => {}); // Fire-and-forget

        return { success: true };
    } catch (err) {
        console.error("[PROGRAM] Mark complete error:", err);
        return { success: false, error: "Failed to mark episode complete." };
    }
}

export async function saveNote(episodeId: string, content: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Authentication required." };
    if (!isValidUuid(episodeId)) return { success: false, error: "Invalid episode." };

    const rl = checkRateLimit(rateLimitKey("save_note", identity.userId), RATE_LIMITS.saveNote);
    if (!rl.allowed) return { success: false, error: "Too many saves. Please try again later." };

    if (content.length > 10000) {
        return { success: false, error: "Note is too long (max 10,000 characters)." };
    }

    try {
        await saveEpisodeNoteSvc(identity.userId, episodeId, content);

        await logEvent(
            identity.userId,
            identity.organizationId,
            "note_saved",
            "episode_note",
            episodeId,
            { length: content.length },
        );

        // Emit domain event for automation/analytics
        emitDomainEvent({
            eventKey: DOMAIN_EVENTS.NOTE_CREATED,
            actor: { type: "user", id: identity.userId },
            subject: { type: "episode_note", id: episodeId },
            organizationId: identity.organizationId,
            payload: { episodeId, noteLength: content.length },
        }).catch(() => {});

        return { success: true };
    } catch (err) {
        console.error("[PROGRAM] Save note error:", err);
        return { success: false, error: "Failed to save note." };
    }
}

export async function getNotes() {
    try {
        const identity = await getServerIdentity();
        if (!identity) return [];
        return await getUserNotesSvc(identity.userId);
    } catch (err) {
        console.error("[PROGRAM] getNotes error:", err);
        return [];
    }
}

export async function getDownloadAssets() {
    try {
        const identity = await getServerIdentity();
        if (!identity) return [];
        return await getAllAssets(identity.userId);
    } catch (err) {
        console.error("[PROGRAM] getDownloadAssets error:", err);
        return [];
    }
}

// ── Playback Events ──

export async function logPlaybackEvent(
    episodeId: string,
    eventType: "episode_started" | "episode_paused" | "episode_resumed" | "episode_completed",
    metadata?: { moduleId?: string; programId?: string; positionSeconds?: number },
) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false };
    if (!isValidUuid(episodeId)) return { success: false };

    const rl = checkRateLimit(rateLimitKey("playback_event", identity.userId), RATE_LIMITS.playbackEvent);
    if (!rl.allowed) return { success: false };

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
    if (!isValidUuid(episodeId)) return { success: false, autoCompleted: false };
    if (!isValidPosition(positionSeconds)) return { success: false, autoCompleted: false };

    const rl = checkRateLimit(rateLimitKey("update_position", identity.userId), RATE_LIMITS.updatePosition);
    if (!rl.allowed) return { success: false, autoCompleted: false };

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

// ── Phase B: Multi-Program Actions ──

export async function getProgramBySlugAction(slug: string) {
    try {
        const identity = await getServerIdentity();
        if (!identity) return null;

        const result = await getProgramBySlug(slug, identity.userId);
        if (!result) return null;

        // Explicit nested field mapping to strip Drizzle column proxy metadata.
        // ProgramWithModules has modules[].episodes[] — deep nesting makes
        // JSON.stringify even more likely to hit infinite recursion.
        return {
            id: String(result.id),
            title: String(result.title),
            description: result.description != null ? String(result.description) : null,
            slug: result.slug != null ? String(result.slug) : null,
            previewImageUrl: result.previewImageUrl != null ? String(result.previewImageUrl) : null,
            cohortStartDate: result.cohortStartDate ? result.cohortStartDate.toISOString() : null,
            status: String(result.status),
            modules: (result.modules ?? []).map((m) => ({
                id: String(m.id),
                title: String(m.title),
                description: m.description != null ? String(m.description) : null,
                orderIndex: Number(m.orderIndex),
                episodes: (m.episodes ?? []).map((ep) => ({
                    id: String(ep.id),
                    title: String(ep.title),
                    description: ep.description != null ? String(ep.description) : null,
                    videoUrl: ep.videoUrl != null ? String(ep.videoUrl) : null,
                    durationSeconds: ep.durationSeconds != null ? Number(ep.durationSeconds) : null,
                    orderIndex: Number(ep.orderIndex),
                    unlockWeek: Number(ep.unlockWeek),
                    moduleId: String(ep.moduleId),
                    completed: Boolean(ep.completed),
                    locked: Boolean(ep.locked),
                })),
            })),
        };
    } catch (err) {
        console.error("[PROGRAM] getProgramBySlugAction error:", err);
        return null;
    }
}

export async function getUserProgramsAction() {
    try {
        const identity = await getServerIdentity();
        if (!identity) {
            console.error("[PROGRAM] getUserProgramsAction: no identity");
            return [];
        }

        // getUserPrograms is statically imported from @cols/services above.
        // DO NOT use dynamic `await import("@cols/services")` here — it
        // double-loads the barrel, causing pgEnum re-initialization which
        // corrupts the program.status column reference (UNDEFINED_VALUE).
        const result = await getUserPrograms(identity.userId);

        // Explicit field mapping — DO NOT use JSON.parse(JSON.stringify()).
        // Drizzle result objects carry column proxy metadata that causes
        // infinite recursion (Maximum call stack size exceeded) during
        // RSC serialization. Map each field to plain primitives.
        return result.map((p) => ({
            id: String(p.id),
            title: String(p.title),
            description: p.description != null ? String(p.description) : null,
            slug: p.slug != null ? String(p.slug) : null,
            previewImageUrl: p.previewImageUrl != null ? String(p.previewImageUrl) : null,
            status: String(p.status),
            totalModules: Number(p.totalModules),
            totalEpisodes: Number(p.totalEpisodes),
            completedEpisodes: Number(p.completedEpisodes),
            progressPercent: Number(p.progressPercent),
        }));
    } catch (err) {
        console.error("[PROGRAM] getUserProgramsAction error:", err);
        return [];
    }
}

export async function resolveEpisodeSlugAction(episodeId: string) {
    try {
        const identity = await getServerIdentity();
        if (!identity) return null;
        if (!isValidUuid(episodeId)) return null;

        const result = await resolveSlugForEpisode(episodeId);
        return result ? JSON.parse(JSON.stringify(result)) : null;
    } catch (err) {
        console.error("[PROGRAM] resolveEpisodeSlugAction error:", err);
        return null;
    }
}
