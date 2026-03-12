// =============================================================================
// AI Service Layer — Phase 5
// =============================================================================
// Handles AI insight persistence, retrieval, and discussion view queries.
// All DB operations for AI features go through this service.
// =============================================================================

import { db } from "@cocs/database";
import {
    aiInsight,
    aiInsightReference,
    episode,
} from "@cocs/database/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ── Types ──

export type InsightType =
    | "episode_takeaway"
    | "discussion_digest"
    | "episode_reflection"
    | "episode_embedding";

export interface StoredInsight {
    id: string;
    insightType: string;
    content: unknown;
    model: string;
    tokenCount: number;
    createdAt: Date;
}

// ── Store Insight ──

export async function storeInsight(
    insightType: InsightType,
    content: unknown,
    model: string,
    tokenCount: number,
    references: {
        programId?: string;
        moduleId?: string;
        episodeId?: string;
    },
): Promise<string> {
    const [insight] = await db
        .insert(aiInsight)
        .values({
            insightType,
            content,
            model,
            tokenCount,
        })
        .returning({ id: aiInsight.id });

    if (!insight) throw new Error("Failed to store AI insight.");

    // Create canonical reference
    await db.insert(aiInsightReference).values({
        insightId: insight.id,
        programId: references.programId ?? null,
        moduleId: references.moduleId ?? null,
        episodeId: references.episodeId ?? null,
    });

    return insight.id;
}

// ── Get Latest Insight for Episode ──

export async function getLatestInsight(
    episodeId: string,
    type: InsightType,
): Promise<StoredInsight | null> {
    const results = await db
        .select({
            id: aiInsight.id,
            insightType: aiInsight.insightType,
            content: aiInsight.content,
            model: aiInsight.model,
            tokenCount: aiInsight.tokenCount,
            createdAt: aiInsight.createdAt,
        })
        .from(aiInsight)
        .innerJoin(aiInsightReference, eq(aiInsightReference.insightId, aiInsight.id))
        .where(
            and(
                eq(aiInsightReference.episodeId, episodeId),
                eq(aiInsight.insightType, type),
            ),
        )
        .orderBy(desc(aiInsight.createdAt))
        .limit(1);

    return results[0] ?? null;
}

// ── Get Episode with Transcript ──

export async function getEpisodeForAI(episodeId: string) {
    const results = await db
        .select({
            id: episode.id,
            title: episode.title,
            transcript: episode.transcript,
            moduleId: episode.moduleId,
        })
        .from(episode)
        .where(eq(episode.id, episodeId))
        .limit(1);

    return results[0] ?? null;
}

// ── Get Program ID for Episode ──

export async function getProgramIdForEpisode(episodeId: string): Promise<string | null> {
    const results = await db.execute(sql`
        SELECT m.program_id
        FROM episode e
        JOIN module m ON m.id = e.module_id
        WHERE e.id = ${episodeId}
        LIMIT 1
    `);

    const row = (results as { rows?: Array<{ program_id: string }> }).rows?.[0];
    return row?.program_id ?? null;
}

// ── Sanitized Discussion View Query (Architecture Rule Step 7) ──
// AI MUST use this function — never query raw discussion tables.

export async function getSanitizedDiscussionPosts(episodeId: string) {
    const results = await db.execute(sql`
        SELECT
            ct.title AS thread_title,
            LEFT(cp.body, 500) AS body,
            (
                SELECT COUNT(*)::int
                FROM content_reaction cr
                WHERE cr.post_id = cp.id AND cr.reaction_type = 'helpful'
            ) AS helpful_count
        FROM content_thread ct
        JOIN content_post cp ON cp.thread_id = ct.id
        WHERE ct.episode_id = ${episodeId}
          AND ct.is_hidden = false
          AND cp.is_deleted = false
        ORDER BY helpful_count DESC, cp.created_at
        LIMIT 200
    `);

    return (results as { rows?: Array<{ thread_title: string; body: string; helpful_count: number }> }).rows ?? [];
}
