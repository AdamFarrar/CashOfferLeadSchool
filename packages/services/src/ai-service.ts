// =============================================================================
// AI Service Layer — Phase 5 + Phase 6
// =============================================================================
// Handles AI insight persistence, retrieval, and discussion view queries.
// All DB operations for AI features go through this service.
//
// Phase 6 additions: multi-type queries, operator highlights, cohort data.
// =============================================================================

import { db } from "@cols/database";
import {
    aiInsight,
    aiInsightReference,
    episode,
} from "@cols/database/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

// ── Types ──

export type InsightType =
    | "episode_takeaway"
    | "discussion_digest"
    | "episode_reflection"
    | "episode_embedding"
    // Phase 6
    | "reflection_prompt"
    | "operator_highlight"
    | "best_moment"
    | "cohort_signal";

export interface StoredInsight {
    id: string;
    insightType: string;
    content: unknown;
    model: string;
    tokenCount: number;
    createdAt: Date;
}

// ── Freshness Rules (Phase 6 Rule 4) ──

const FRESHNESS_DAYS: Partial<Record<InsightType, number>> = {
    best_moment: 7,
    cohort_signal: 1,
    // operator_highlight → manual only (no staleness)
    // reflection_prompt → static unless regenerated
};

export function isInsightStale(insight: StoredInsight): boolean {
    const freshnessDays = FRESHNESS_DAYS[insight.insightType as InsightType];
    if (!freshnessDays) return false; // No auto-staleness
    const ageMs = Date.now() - new Date(insight.createdAt).getTime();
    return ageMs > freshnessDays * 24 * 60 * 60 * 1000;
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

// ── Get Latest Insight for Program (Phase 6) ──

export async function getLatestProgramInsight(
    programId: string,
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
                eq(aiInsightReference.programId, programId),
                eq(aiInsight.insightType, type),
            ),
        )
        .orderBy(desc(aiInsight.createdAt))
        .limit(1);

    return results[0] ?? null;
}

// ── Get Insights by Episode — multi-type (Phase 6) ──

export async function getInsightsByEpisode(
    episodeId: string,
    types: InsightType[],
): Promise<StoredInsight[]> {
    if (types.length === 0) return [];

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
                inArray(aiInsight.insightType, types),
            ),
        )
        .orderBy(desc(aiInsight.createdAt));

    // Return latest per type
    const latestByType = new Map<string, StoredInsight>();
    for (const row of results) {
        if (!latestByType.has(row.insightType)) {
            latestByType.set(row.insightType, row);
        }
    }
    return Array.from(latestByType.values());
}

// ── Get All Insights of Type for Episode (e.g. multiple highlights) ──

export async function getAllInsightsForEpisode(
    episodeId: string,
    type: InsightType,
): Promise<StoredInsight[]> {
    return db
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
        .orderBy(desc(aiInsight.createdAt));
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

// ── Cohort Activity Data (Phase 6 Feature 4) ──
// Aggregates event_log + discussion stats for signal generation.

export interface CohortEpisodeStats {
    episodeId: string;
    episodeTitle: string;
    threadCount: number;
    postCount: number;
    helpfulCount: number;
}

export async function getCohortActivityData(programId: string, windowDays: number = 7): Promise<CohortEpisodeStats[]> {
    const results = await db.execute(sql`
        SELECT
            e.id AS episode_id,
            e.title AS episode_title,
            (
                SELECT COUNT(*)::int FROM content_thread ct
                WHERE ct.episode_id = e.id
                  AND ct.is_hidden = false
                  AND ct.created_at >= NOW() - (${windowDays} || ' days')::interval
            ) AS thread_count,
            (
                SELECT COUNT(*)::int FROM content_post cp
                JOIN content_thread ct2 ON ct2.id = cp.thread_id
                WHERE ct2.episode_id = e.id
                  AND ct2.is_hidden = false
                  AND cp.is_deleted = false
                  AND cp.created_at >= NOW() - (${windowDays} || ' days')::interval
            ) AS post_count,
            (
                SELECT COUNT(*)::int FROM content_reaction cr
                JOIN content_post cp2 ON cp2.id = cr.post_id
                JOIN content_thread ct3 ON ct3.id = cp2.thread_id
                WHERE ct3.episode_id = e.id
                  AND cr.reaction_type = 'helpful'
            ) AS helpful_count
        FROM episode e
        JOIN module m ON m.id = e.module_id
        WHERE m.program_id = ${programId}
        ORDER BY thread_count DESC, post_count DESC
        LIMIT 20
    `);

    interface CohortRow {
        episode_id: string;
        episode_title: string;
        thread_count: number;
        post_count: number;
        helpful_count: number;
    }

    return ((results as { rows?: CohortRow[] }).rows ?? []).map((r) => ({
        episodeId: r.episode_id,
        episodeTitle: r.episode_title,
        threadCount: Number(r.thread_count ?? 0),
        postCount: Number(r.post_count ?? 0),
        helpfulCount: Number(r.helpful_count ?? 0),
    }));
}

// ── Admin Episode List (for Intelligence page) ──

export async function getAdminEpisodeList() {
    const results = await db.execute(sql`
        SELECT
            e.id,
            e.title,
            m.title AS module_title,
            e.order_index,
            CASE WHEN e.transcript IS NOT NULL AND LENGTH(e.transcript) > 0 THEN true ELSE false END AS has_transcript
        FROM episode e
        JOIN module m ON m.id = e.module_id
        ORDER BY m.order_index, e.order_index
    `);

    interface EpisodeRow {
        id: string;
        title: string;
        module_title: string;
        order_index: number;
        has_transcript: boolean;
    }

    return ((results as { rows?: EpisodeRow[] }).rows ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        moduleTitle: r.module_title,
        hasTranscript: Boolean(r.has_transcript),
    }));
}


