// =============================================================================
// AI Schema — Phase 5
// =============================================================================
// Stores AI-generated insights in separate tables (architecture rule Step 9).
// AI outputs never modify learning tables.
// All insights reference canonical content identifiers.
// =============================================================================

import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    timestamp,
    jsonb,
    index,
} from "drizzle-orm/pg-core";
import { program, module, episode } from "./program";

// ── AI Insight ──

export const aiInsight = pgTable("ai_insight", {
    id: uuid("id").primaryKey().defaultRandom(),
    insightType: varchar("insight_type", { length: 50 }).notNull(),
    // 'episode_takeaway' | 'discussion_digest' | 'episode_reflection' | 'episode_embedding'
    content: jsonb("content").notNull(),
    model: varchar("model", { length: 50 }).notNull(),
    tokenCount: integer("token_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    index("idx_ai_insight_type").on(t.insightType),
    index("idx_ai_insight_type_created").on(t.insightType, t.createdAt),
]);

// ── AI Insight Reference (canonical content graph) ──

export const aiInsightReference = pgTable("ai_insight_reference", {
    id: uuid("id").primaryKey().defaultRandom(),
    insightId: uuid("insight_id").notNull().references(() => aiInsight.id, { onDelete: "cascade" }),
    programId: uuid("program_id").references(() => program.id, { onDelete: "cascade" }),
    moduleId: uuid("module_id").references(() => module.id, { onDelete: "cascade" }),
    episodeId: uuid("episode_id").references(() => episode.id, { onDelete: "cascade" }),
}, (t) => [
    index("idx_ai_insight_ref_insight").on(t.insightId),
    index("idx_ai_insight_ref_episode").on(t.episodeId),
    index("idx_ai_insight_ref_episode_type").on(t.episodeId, t.insightId),
]);

// ── Episode Transcript Segment ──

export const episodeTranscriptSegment = pgTable("episode_transcript_segment", {
    id: uuid("id").primaryKey().defaultRandom(),
    episodeId: uuid("episode_id").notNull().references(() => episode.id, { onDelete: "cascade" }),
    startSeconds: integer("start_seconds"),
    endSeconds: integer("end_seconds"),
    text: text("text").notNull(),
    speaker: varchar("speaker", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    index("idx_transcript_segment_episode").on(t.episodeId),
    index("idx_transcript_segment_episode_start").on(t.episodeId, t.startSeconds),
]);
