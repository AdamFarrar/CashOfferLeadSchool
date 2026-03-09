import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

// =============================================================================
// BetterAuth Organization Plugin Tables
// These tables are managed by BetterAuth's Organization plugin.
// =============================================================================

export const organization = pgTable("organization", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const member = pgTable("member", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organization.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("student"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invitation = pgTable("invitation", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull().default("student"),
    status: text("status").notNull().default("pending"),
    inviterId: uuid("inviter_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================================================
// Domain Tables — Qualification Form
// Captures operator qualification data during the conversion funnel (Phase 1).
// =============================================================================

export const qualificationForm = pgTable("qualification_form", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organization.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    businessName: text("business_name"),
    businessType: text("business_type"),
    yearsExperience: text("years_experience"),
    monthlyBudget: text("monthly_budget"),
    marketArea: text("market_area"),
    currentLeadSources: text("current_lead_sources"),
    goals: text("goals"),
    responses: jsonb("responses").default({}),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
