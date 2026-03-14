// =============================================================================
// Discussion Schema
// =============================================================================
// Content-anchored discussion system. No global forums.
// Every thread requires program_id. module_id/episode_id optional.
// Moderation: lock, pin, hide. Posts: soft delete.
// AI-ready: post_position_seconds for timestamp-linked discussion.
// =============================================================================

import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { program, module, episode } from "./program";
import { user } from "./auth";

// ── Content Thread ──

export const contentThread = pgTable("content_thread", {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id").notNull().references(() => program.id, { onDelete: "cascade" }),
    moduleId: uuid("module_id").references(() => module.id, { onDelete: "cascade" }),
    episodeId: uuid("episode_id").references(() => episode.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    threadType: varchar("thread_type", { length: 20 }).notNull().default("general"),
    createdBy: uuid("created_by").notNull().references(() => user.id, { onDelete: "cascade" }),
    isLocked: boolean("is_locked").notNull().default(false),
    isPinned: boolean("is_pinned").notNull().default(false),
    isHidden: boolean("is_hidden").notNull().default(false),
    flagReason: text("flag_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    index("idx_content_thread_program").on(t.programId),
    index("idx_content_thread_episode").on(t.episodeId),
    index("idx_content_thread_created_by").on(t.createdBy),
    index("idx_content_thread_program_list").on(t.programId, t.isHidden, t.isPinned, t.createdAt),
    index("idx_content_thread_episode_list").on(t.episodeId, t.isHidden, t.isPinned, t.createdAt),
]);

// ── Content Post ──

export const contentPost = pgTable("content_post", {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id").notNull().references(() => contentThread.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    parentPostId: uuid("parent_post_id"),
    postPositionSeconds: integer("post_position_seconds"),
    body: text("body").notNull(),
    isDeleted: boolean("is_deleted").notNull().default(false),
    flagReason: text("flag_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    editedAt: timestamp("edited_at", { withTimezone: true }),
}, (t) => [
    index("idx_content_post_thread_created").on(t.threadId, t.createdAt),
]);

// ── Content Reaction ──

export const contentReaction = pgTable("content_reaction", {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id").notNull().references(() => contentPost.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    reactionType: varchar("reaction_type", { length: 20 }).notNull(),
}, (t) => [
    uniqueIndex("idx_content_reaction_unique").on(t.postId, t.userId, t.reactionType),
]);

// ── Thread Stats (Cached Counts — Step 11 Scale Protection) ──

export const threadStats = pgTable("thread_stats", {
    threadId: uuid("thread_id").primaryKey().references(() => contentThread.id, { onDelete: "cascade" }),
    postCount: integer("post_count").notNull().default(0),
    helpfulCount: integer("helpful_count").notNull().default(0),
    participantCount: integer("participant_count").notNull().default(0),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Conduct Agreement ──

export const discussionConductAgreement = pgTable("discussion_conduct_agreement", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    agreedAt: timestamp("agreed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    uniqueIndex("idx_conduct_user").on(t.userId),
]);
