"use server";

// =============================================================================
// AI Server Actions — Phase 5 + Phase 6
// =============================================================================
// Admin: generateTakeaways, generateDigest, generateReflection,
//        generateBestMoments, generateCohortSignals, createOperatorHighlight
// User: askEpisode, getEpisodeIntelligence, getDashboardIntelligence
// All use getServerIdentity(), validate UUIDs, enforce cache-first.
// =============================================================================

import { getServerIdentity } from "./identity";
import { requireAdmin } from "./guards";
import {
    getEpisodeForAI,
    getProgramIdForEpisode,
    getSanitizedDiscussionPosts,
    getLatestInsight,
    getLatestProgramInsight,
    storeInsight,
    isInsightStale,
    getAllInsightsForEpisode,
    getCohortActivityData,
    checkRateLimit,
    rateLimitKey,
    getProgramProgressForDashboard,
    getAdminEpisodeList,
} from "@cocs/services";
import type { RateLimitConfig } from "@cocs/services";
import {
    generateTakeaways,
    generateDigest,
    generateReflectionPrompts,
    generateBestMoments,
    generateCohortSignals,
    evaluateCompletionGuidance,
    episodeChat,
} from "@cocs/ai";
import type { ChatMessage, GuidanceInput } from "@cocs/ai";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RATE_LIMITS = {
    askEpisode: { maxRequests: 30, windowMs: 60 * 60 * 1000, name: "ask_episode" } satisfies RateLimitConfig,
};

// ── Feature 1: Generate Takeaways (Admin) ──

export async function generateTakeawaysAction(episodeId: string) {
    await requireAdmin();
    if (!UUID_RE.test(episodeId)) return { success: false, error: "Invalid episode ID." };

    // Check if already generated (cache-first)
    const existing = await getLatestInsight(episodeId, "episode_takeaway");
    if (existing) {
        return { success: true, data: existing.content, cached: true };
    }

    // Load episode transcript
    const ep = await getEpisodeForAI(episodeId);
    if (!ep || !ep.transcript) {
        return { success: false, error: "Episode has no transcript." };
    }

    const programId = await getProgramIdForEpisode(episodeId);

    // Generate via AI
    const result = await generateTakeaways(ep.title, ep.transcript);

    // Store in ai_insight
    await storeInsight(
        "episode_takeaway",
        { takeaways: result.takeaways },
        result.model,
        result.tokenCount,
        { programId: programId ?? undefined, moduleId: ep.moduleId, episodeId },
    );

    return { success: true, data: { takeaways: result.takeaways }, cached: false };
}

// ── Feature 2: Generate Discussion Digest (Admin) ──

export async function generateDigestAction(episodeId: string) {
    await requireAdmin();
    if (!UUID_RE.test(episodeId)) return { success: false, error: "Invalid episode ID." };

    // Cache-first
    const existing = await getLatestInsight(episodeId, "discussion_digest");
    if (existing) {
        return { success: true, data: existing.content, cached: true };
    }

    const ep = await getEpisodeForAI(episodeId);
    if (!ep) return { success: false, error: "Episode not found." };

    // Get sanitized discussion posts (NEVER raw tables)
    const posts = await getSanitizedDiscussionPosts(episodeId);
    if (posts.length === 0) {
        return { success: false, error: "No discussion posts for this episode." };
    }

    const programId = await getProgramIdForEpisode(episodeId);

    const result = await generateDigest(
        ep.title,
        posts.map((p) => ({
            threadTitle: p.thread_title,
            body: p.body,
            helpfulCount: p.helpful_count,
        })),
    );

    await storeInsight(
        "discussion_digest",
        { summary: result.summary, themes: result.themes, topQuestions: result.topQuestions },
        result.model,
        result.tokenCount,
        { programId: programId ?? undefined, moduleId: ep.moduleId, episodeId },
    );

    return {
        success: true,
        data: { summary: result.summary, themes: result.themes, topQuestions: result.topQuestions },
        cached: false,
    };
}

// ── Feature 3: Ask Episode (User Chat) ──

export async function askEpisodeAction(
    episodeId: string,
    question: string,
    history: ChatMessage[] = [],
) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Not authenticated." };
    if (!UUID_RE.test(episodeId)) return { success: false, error: "Invalid episode ID." };

    // Rate limit
    const rl = checkRateLimit(rateLimitKey("ask_episode", identity.userId), RATE_LIMITS.askEpisode);
    if (!rl.allowed) return { success: false, error: "Too many questions. Try again later." };

    const ep = await getEpisodeForAI(episodeId);
    if (!ep || !ep.transcript) {
        return { success: false, error: "Episode has no transcript for Q&A." };
    }

    const result = await episodeChat(ep.title, ep.transcript, question, history);

    return { success: true, answer: result.answer };
}

// ── Feature 5: Generate Reflection Prompts (Admin) ──

export async function generateReflectionAction(episodeId: string) {
    await requireAdmin();
    if (!UUID_RE.test(episodeId)) return { success: false, error: "Invalid episode ID." };

    // Cache-first
    const existing = await getLatestInsight(episodeId, "episode_reflection");
    if (existing) {
        return { success: true, data: existing.content, cached: true };
    }

    const ep = await getEpisodeForAI(episodeId);
    if (!ep || !ep.transcript) {
        return { success: false, error: "Episode has no transcript." };
    }

    const programId = await getProgramIdForEpisode(episodeId);

    const result = await generateReflectionPrompts(ep.title, ep.transcript);

    await storeInsight(
        "episode_reflection",
        { prompts: result.prompts },
        result.model,
        result.tokenCount,
        { programId: programId ?? undefined, moduleId: ep.moduleId, episodeId },
    );

    return { success: true, data: { prompts: result.prompts }, cached: false };
}

// ── Get Cached Insights (Public read for authenticated users) ──

export async function getEpisodeInsightsAction(episodeId: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, data: null };
    if (!UUID_RE.test(episodeId)) return { success: false, data: null };

    const [takeaways, digest, reflection] = await Promise.all([
        getLatestInsight(episodeId, "episode_takeaway"),
        getLatestInsight(episodeId, "discussion_digest"),
        getLatestInsight(episodeId, "episode_reflection"),
    ]);

    return {
        success: true,
        data: {
            takeaways: takeaways?.content ?? null,
            digest: digest?.content ?? null,
            reflection: reflection?.content ?? null,
        },
    };
}

// =============================================================================
// Phase 6 Actions
// =============================================================================

// ── Phase 6 Feature 3: Generate Best Moments (Admin) ──

export async function generateBestMomentsAction(episodeId: string) {
    await requireAdmin();
    if (!UUID_RE.test(episodeId)) return { success: false, error: "Invalid episode ID." };

    // Cache-first with freshness check
    const existing = await getLatestInsight(episodeId, "best_moment");
    if (existing && !isInsightStale(existing)) {
        return { success: true, data: existing.content, cached: true };
    }

    const ep = await getEpisodeForAI(episodeId);
    if (!ep || !ep.transcript) {
        return { success: false, error: "Episode has no transcript." };
    }

    // Get sanitized discussion posts (NEVER raw tables)
    const posts = await getSanitizedDiscussionPosts(episodeId);
    const programId = await getProgramIdForEpisode(episodeId);

    const result = await generateBestMoments(
        ep.title,
        ep.transcript,
        posts.map((p) => ({
            threadTitle: p.thread_title,
            body: p.body,
            helpfulCount: p.helpful_count,
        })),
    );

    await storeInsight(
        "best_moment",
        { moments: result.moments },
        result.model,
        result.tokenCount,
        { programId: programId ?? undefined, moduleId: ep.moduleId, episodeId },
    );

    return { success: true, data: { moments: result.moments }, cached: false };
}

// ── Phase 6 Feature 4: Generate Cohort Signals (Admin) ──

export async function generateCohortSignalsAction(programId: string) {
    await requireAdmin();
    if (!UUID_RE.test(programId)) return { success: false, error: "Invalid program ID." };

    // Cache-first with 1-day freshness
    const existing = await getLatestProgramInsight(programId, "cohort_signal");
    if (existing && !isInsightStale(existing)) {
        return { success: true, data: existing.content, cached: true };
    }

    // Get cohort activity data (last 7 days)
    const stats = await getCohortActivityData(programId, 7);
    if (stats.length === 0) {
        return { success: false, error: "No cohort activity data available." };
    }

    const result = await generateCohortSignals(stats);

    await storeInsight(
        "cohort_signal",
        { signals: result.signals },
        result.model,
        result.tokenCount,
        { programId },
    );

    return { success: true, data: { signals: result.signals }, cached: false };
}

// ── Phase 6 Feature 2: Create Operator Highlight (Admin) ──

export async function createOperatorHighlightAction(input: {
    episodeId: string;
    title: string;
    body: string;
    timestampSeconds?: number;
    referencePostId?: string;
}) {
    await requireAdmin();
    if (!UUID_RE.test(input.episodeId)) return { success: false, error: "Invalid episode ID." };
    if (!input.title.trim()) return { success: false, error: "Title is required." };
    if (!input.body.trim()) return { success: false, error: "Body is required." };

    // Validate timestamp if provided (Rule 3 — Timestamp Integrity)
    if (input.timestampSeconds !== undefined) {
        if (typeof input.timestampSeconds !== "number" || input.timestampSeconds < 0) {
            return { success: false, error: "Invalid timestamp." };
        }
    }

    const programId = await getProgramIdForEpisode(input.episodeId);
    const ep = await getEpisodeForAI(input.episodeId);
    if (!ep) return { success: false, error: "Episode not found." };

    await storeInsight(
        "operator_highlight",
        {
            title: input.title.trim().slice(0, 200),
            body: input.body.trim().slice(0, 2000),
            timestampSeconds: input.timestampSeconds ?? null,
            referencePostId: input.referencePostId ?? null,
        },
        "manual",
        0,
        { programId: programId ?? undefined, moduleId: ep.moduleId, episodeId: input.episodeId },
    );

    return { success: true };
}

// ── Phase 6: Get Episode Intelligence (User) ──

export async function getEpisodeIntelligenceAction(episodeId: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, data: null };
    if (!UUID_RE.test(episodeId)) return { success: false, data: null };

    const [bestMoments, highlights] = await Promise.all([
        getLatestInsight(episodeId, "best_moment"),
        getAllInsightsForEpisode(episodeId, "operator_highlight"),
    ]);

    return {
        success: true,
        data: {
            bestMoments: bestMoments?.content ?? null,
            highlights: highlights.map((h) => h.content),
        },
    };
}

// ── Phase 6: Get Dashboard Intelligence (User) ──

export async function getDashboardIntelligenceAction() {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, data: null };

    // Get progress for completion guidance
    const progress = await getProgramProgressForDashboard(identity.userId);

    // Compute guidance dynamically (Rule 5 — not persisted)
    let guidance: ReturnType<typeof evaluateCompletionGuidance> = [];
    if (progress) {
        const input: GuidanceInput = {
            totalEpisodes: progress.totalEpisodes,
            completedEpisodes: progress.completedEpisodes,
            hasWrittenNotes: progress.hasNotes ?? false,
            lastActivityDaysAgo: progress.lastActivityDaysAgo ?? null,
            nextEpisodeTitle: progress.nextEpisode?.title ?? null,
            nextEpisodeId: progress.nextEpisode?.id ?? null,
        };
        guidance = evaluateCompletionGuidance(input);
    }

    // Get cohort signals (latest cached)
    let cohortSignals = null;
    if (progress?.programId) {
        const signals = await getLatestProgramInsight(progress.programId, "cohort_signal");
        if (signals && !isInsightStale(signals)) {
            cohortSignals = signals.content;
        }
    }

    return {
        success: true,
        data: {
            guidance,
            cohortSignals,
        },
    };
}

// ── Episode List for Admin (used by Intelligence page picker) ──

export async function getEpisodeListForAdmin() {
    await requireAdmin();
    const episodes = await getAdminEpisodeList();
    return { success: true, episodes };
}

// ── Bulk Generate Insights (Admin) ──
// Generates takeaways + reflections for ALL episodes with transcripts.
// Skips episodes that already have cached insights.

type InsightStatus = "generated" | "cached" | "skipped" | "error";

export async function bulkGenerateInsightsAction() {
    await requireAdmin();

    const episodes = await getAdminEpisodeList();

    const results: Array<{
        episodeId: string;
        title: string;
        takeaways: InsightStatus;
        reflections: InsightStatus;
    }> = [];

    for (const ep of episodes) {
        let takeaways: InsightStatus = "skipped";
        let reflections: InsightStatus = "skipped";

        if (ep.hasTranscript) {
            try {
                const takResult = await generateTakeawaysAction(ep.id);
                takeaways = takResult.cached ? "cached" : (takResult.success ? "generated" : "error");
            } catch {
                takeaways = "error";
            }

            try {
                const refResult = await generateReflectionAction(ep.id);
                reflections = refResult.cached ? "cached" : (refResult.success ? "generated" : "error");
            } catch {
                reflections = "error";
            }
        }

        results.push({ episodeId: ep.id, title: ep.title, takeaways, reflections });
    }

    return { success: true, results };
}

