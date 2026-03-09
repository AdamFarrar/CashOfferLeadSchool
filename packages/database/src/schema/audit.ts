import { pgTable, uuid, text, timestamp, jsonb, inet, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { organization } from "./organizations";

// =============================================================================
// Audit Log — Append-Only
// No UPDATE or DELETE operations should ever target this table.
// =============================================================================

export const auditLog = pgTable(
    "audit_log",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        userId: uuid("user_id").references(() => user.id, { onDelete: "set null" }),
        action: text("action").notNull(),
        resourceType: text("resource_type").notNull(),
        resourceId: uuid("resource_id"),
        metadata: jsonb("metadata").default("{}"),
        ipAddress: inet("ip_address"),
        userAgent: text("user_agent"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        index("audit_log_org_created_idx").on(table.organizationId, table.createdAt),
        index("audit_log_user_idx").on(table.userId),
        index("audit_log_action_idx").on(table.action),
    ]
);
