// =============================================================================
// Session Host Schema — Phase C
// =============================================================================

import { pgTable, uuid, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { liveSession } from "./live-session";

// ── Host Profile ──

export const sessionHost = pgTable("session_host", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    headshotUrl: text("headshot_url"),
    bio: text("bio"),
    role: text("role").notNull().default("host"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Session ↔ Host Junction ──

export const sessionHostAssignment = pgTable("session_host_assignment", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => liveSession.id, { onDelete: "cascade" }),
    hostId: uuid("host_id").notNull().references(() => sessionHost.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("host"),
}, (table) => [
    uniqueIndex("idx_sha_session_host").on(table.sessionId, table.hostId),
    index("idx_sha_session").on(table.sessionId),
]);
