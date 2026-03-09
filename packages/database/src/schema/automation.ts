import { sql } from "drizzle-orm";
import {
    pgTable, pgEnum, uuid, text, timestamp, integer, boolean, jsonb,
    uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { organization } from "./organizations";
import { user } from "./auth";

// =============================================================================
// Phase 1.6 — Automation Orchestrator Schema
// =============================================================================

export const automationActionStatusEnum = pgEnum("automation_action_status", [
    "planned",
    "completed",
    "failed",
]);

// ── automation_rule ──
// Defines a policy: when event X fires, execute action Y via channel Z.
// System rules (NULL org) apply globally. Org rules override or extend.

export const automationRule = pgTable("automation_rule", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventKey: text("event_key").notNull(),
    organizationId: uuid("organization_id")
        .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    priority: integer("priority").notNull().default(100),
    conditions: jsonb("conditions"),
    actionChannel: text("action_channel").notNull(),
    actionType: text("action_type").notNull(),
    actionConfig: jsonb("action_config").notNull(),
    delayMs: integer("delay_ms").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(0),
    retryDelayMs: integer("retry_delay_ms").notNull().default(0),
    createdBy: uuid("created_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    // System rule uniqueness: one rule per event+channel+type at system level
    uniqueIndex("uq_automation_rule_system")
        .on(table.eventKey, table.actionChannel, table.actionType)
        .where(sql`organization_id IS NULL`),
    // Lookup index for evaluator queries
    index("idx_automation_rule_lookup")
        .on(table.eventKey, table.organizationId, table.enabled),
]);

// ── automation_action_log ──
// Every action execution: planned → completed | failed.
// UNIQUE(event_id, rule_id) enforces database-level idempotency.

export const automationActionLog = pgTable("automation_action_log", {
    id: uuid("id").primaryKey().defaultRandom(),

    // Lineage
    eventId: text("event_id").notNull(),
    eventKey: text("event_key").notNull(),
    correlationId: text("correlation_id").notNull(),
    causationId: text("causation_id"),

    // Rule
    ruleId: uuid("rule_id")
        .notNull()
        .references(() => automationRule.id),
    ruleName: text("rule_name"),

    // Action
    channel: text("channel").notNull(),
    actionType: text("action_type").notNull(),
    actionConfig: jsonb("action_config"),

    // Execution
    status: automationActionStatusEnum("status").notNull(),
    attemptNumber: integer("attempt_number").notNull().default(1),
    errorMessage: text("error_message"),
    executorMessageId: text("executor_message_id"),

    // Context
    organizationId: uuid("organization_id"),
    userId: text("user_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    // Database-enforced idempotency: one action per event per rule
    uniqueIndex("uq_automation_action_event_rule")
        .on(table.eventId, table.ruleId),
    // Query indexes
    index("idx_automation_action_correlation").on(table.correlationId),
    index("idx_automation_action_status").on(table.status, table.createdAt),
]);

// ── automation_delayed_action ──
// Schema defined now, poller deferred to Phase 2.

export const automationDelayedAction = pgTable("automation_delayed_action", {
    id: uuid("id").primaryKey().defaultRandom(),
    actionLogId: uuid("action_log_id")
        .notNull()
        .references(() => automationActionLog.id),
    executeAt: timestamp("execute_at", { withTimezone: true }).notNull(),
    executed: boolean("executed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
