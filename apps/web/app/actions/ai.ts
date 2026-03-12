"use server";

// =============================================================================
// AI Server Actions — Phase 5
// =============================================================================
// Admin: generateTakeaways, generateDigest, generateReflection
// User: askEpisode
// All use getServerIdentity(), validate UUIDs, enforce cache-first.
// =============================================================================

import { getServerIdentity } from "./identity";
import { requireAdmin } from "./guards";
import {
    getEpisodeForAI,
    getProgramIdForEpisode,
    getSanitizedDiscussionPosts,
    getLatestInsight,
    storeInsight,
    checkRateLimit,
    rateLimitKey,
} from "@cocs/services";
import type { RateLimitConfig } from "@cocs/services";
import {
    generateTakeaways,
    generateDigest,
    generateReflectionPrompts,
    episodeChat,
} from "@cocs/ai";
import type { ChatMessage } from "@cocs/ai";

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
