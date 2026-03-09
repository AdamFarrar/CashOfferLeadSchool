import { pgTable, pgEnum, uuid, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { organization } from "./organizations";

// =============================================================================
// Phase 1.5A — Stakeholder Feedback System
// Captures qualitative feedback from internal stakeholders, pilot users, and admins.
// =============================================================================

export const feedbackTypeEnum = pgEnum("feedback_type", [
    "general",
    "feature_request",
    "bug_report",
    "usability",
    "content",
]);

export const feedbackStatusEnum = pgEnum("feedback_status", [
    "new",
    "reviewed",
    "actioned",
    "dismissed",
]);

export const stakeholderGroupEnum = pgEnum("stakeholder_group", [
    "internal",
    "pilot_user",
    "admin",
]);

export const feedbackEntry = pgTable("feedback_entry", {
    id: uuid("id").primaryKey().defaultRandom(),

    // Who submitted
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organization.id, { onDelete: "cascade" }),

    // Stakeholder identification
    stakeholderGroup: stakeholderGroupEnum("stakeholder_group").notNull(),

    // Structured core fields
    type: feedbackTypeEnum("type").notNull().default("general"),
    context: text("context").notNull(), // where in the app (e.g. "qualification", "dashboard")
    rating: integer("rating"), // 1-5 optional satisfaction rating
    body: text("body").notNull(), // free-text feedback

    // Admin workflow
    status: feedbackStatusEnum("status").notNull().default("new"),
    reviewedBy: uuid("reviewed_by").references(() => user.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    adminNotes: text("admin_notes"),

    // Prompt lifecycle tracking
    promptSeenAt: timestamp("prompt_seen_at", { withTimezone: true }),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),

    // Optional extensible metadata
    metadata: jsonb("metadata").default({}),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
