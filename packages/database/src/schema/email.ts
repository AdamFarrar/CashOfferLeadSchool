import { sql } from "drizzle-orm";
import {
    pgTable, pgEnum, uuid, text, timestamp, integer, boolean, jsonb,
    uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { organization } from "./organizations";
import { user } from "./auth";

// =============================================================================
// Phase 1.6 — Email Template System Schema
// =============================================================================

export const emailSendStatusEnum = pgEnum("email_send_status", [
    "sent",
    "failed",
    "fallback",
]);

// ── email_template ──
// Represents a named email template (e.g. "verification", "welcome").
// System-level templates have NULL organization_id.
// Org-specific templates override system templates via the resolver.

export const emailTemplate = pgTable("email_template", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .references(() => organization.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdBy: uuid("created_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    // System templates: key must be unique when org is NULL
    uniqueIndex("uq_email_template_system_key")
        .on(table.key)
        .where(sql`organization_id IS NULL`),
    // Org templates: key must be unique per org
    uniqueIndex("uq_email_template_org_key")
        .on(table.organizationId, table.key)
        .where(sql`organization_id IS NOT NULL`),
    // Lookup index
    index("idx_email_template_key").on(table.key, table.organizationId),
]);

// ── email_template_version ──
// Immutable snapshot of template content at a point in time.
// A template can have many versions. Only one is "published" at a time.

export const emailTemplateVersion = pgTable("email_template_version", {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: uuid("template_id")
        .notNull()
        .references(() => emailTemplate.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    subject: text("subject").notNull(),
    htmlBody: text("html_body").notNull(),
    grapesJsData: jsonb("grapesjs_data"),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    // Only one published version per template
    uniqueIndex("uq_email_version_published")
        .on(table.templateId)
        .where(sql`published = true`),
    // Version ordering
    uniqueIndex("uq_email_version_number")
        .on(table.templateId, table.version),
]);

// ── email_send_log ──
// Every email send attempt (sent, failed, fallback).
// Includes lineage fields for traceability.

export const emailSendLog = pgTable("email_send_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventKey: text("event_key").notNull(),
    templateKey: text("template_key").notNull(),
    templateVersionId: uuid("template_version_id"),
    recipientEmail: text("recipient_email").notNull(),
    subject: text("subject").notNull(),
    status: emailSendStatusEnum("status").notNull(),
    source: text("source").notNull(),
    resendMessageId: text("resend_message_id"),
    errorMessage: text("error_message"),
    organizationId: uuid("organization_id"),
    userId: text("user_id"),
    correlationId: text("correlation_id"),
    automationRuleId: uuid("automation_rule_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index("idx_email_send_log_event").on(table.eventKey, table.createdAt),
    index("idx_email_send_log_org").on(table.organizationId, table.createdAt),
    index("idx_email_send_log_correlation").on(table.correlationId),
]);
