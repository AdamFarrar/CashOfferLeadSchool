// =============================================================================
// Program Delivery Schema
// =============================================================================
// Structured cohort program model: Program → Modules → Episodes
// All content is database-driven. UI renders this data.
// Includes progress tracking, notes, assets, and event log.
// =============================================================================

import {
    pgTable,
    pgEnum,
    uuid,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    jsonb,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

// ── Enums ──

export const programStatusEnum = pgEnum("program_status", [
    "draft",
    "active",
    "archived",
]);

// ── Programs ──

export const program = pgTable("program", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 100 }),
    previewImageUrl: text("preview_image_url"),
    cohortStartDate: timestamp("cohort_start_date", { withTimezone: true }),
    status: programStatusEnum("status").notNull().default("draft"),
    organizationId: uuid("organization_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    uniqueIndex("idx_program_slug").on(t.slug).where(sql`slug IS NOT NULL`),
]);

// ── Modules ──

export const module = pgTable("module", {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id").notNull().references(() => program.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    index("idx_module_program_order").on(t.programId, t.orderIndex),
]);

// ── Episodes ──

export const episode = pgTable("episode", {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id").notNull().references(() => module.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    videoUrl: text("video_url"),
    durationSeconds: integer("duration_seconds"),
    orderIndex: integer("order_index").notNull().default(0),
    unlockWeek: integer("unlock_week").notNull().default(0),
    transcript: text("transcript"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    index("idx_episode_module_order").on(t.moduleId, t.orderIndex),
]);

// ── Episode Progress ──

export const episodeProgress = pgTable("episode_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    episodeId: uuid("episode_id").notNull().references(() => episode.id, { onDelete: "cascade" }),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastPositionSeconds: integer("last_position_seconds").default(0),
    lastWatchedAt: timestamp("last_watched_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    uniqueIndex("idx_episode_progress_user_episode").on(t.userId, t.episodeId),
]);

// ── Module Progress (derived, per user) ──

export const moduleProgress = pgTable("module_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    moduleId: uuid("module_id").notNull().references(() => module.id, { onDelete: "cascade" }),
    completedEpisodes: integer("completed_episodes").notNull().default(0),
    totalEpisodes: integer("total_episodes").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    uniqueIndex("idx_module_progress_user_module").on(t.userId, t.moduleId),
]);

// ── Program Progress (derived, per user) ──

export const programProgress = pgTable("program_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    programId: uuid("program_id").notNull().references(() => program.id, { onDelete: "cascade" }),
    completedModules: integer("completed_modules").notNull().default(0),
    totalModules: integer("total_modules").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    uniqueIndex("idx_program_progress_user_program").on(t.userId, t.programId),
]);

// ── Episode Notes (private per user) ──

export const episodeNote = pgTable("episode_note", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    episodeId: uuid("episode_id").notNull().references(() => episode.id, { onDelete: "cascade" }),
    content: text("content").notNull().default(""),
    timestampSeconds: integer("timestamp_seconds"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    uniqueIndex("idx_episode_note_user_episode").on(t.userId, t.episodeId),
]);

// ── Episode Assets (downloadable files) ──

export const episodeAsset = pgTable("episode_asset", {
    id: uuid("id").primaryKey().defaultRandom(),
    episodeId: uuid("episode_id").notNull().references(() => episode.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    index("idx_episode_asset_episode").on(t.episodeId),
]);

// ── Event Log (append-only, AI readiness) ──

export const eventLog = pgTable("event_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    organizationId: uuid("organization_id"),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    metadataJson: jsonb("metadata_json").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    index("idx_event_log_user").on(t.userId),
    index("idx_event_log_user_created").on(t.userId, t.createdAt),
    index("idx_event_log_entity").on(t.entityType, t.entityId),
    index("idx_event_log_type").on(t.eventType),
    index("idx_event_log_type_created").on(t.eventType, t.createdAt),
]);
