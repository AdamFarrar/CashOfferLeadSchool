// =============================================================================
// Session RSVP Schema — Phase C
// =============================================================================

import { pgTable, uuid, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { liveSession } from "./live-session";

export const sessionRsvp = pgTable("session_rsvp", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => liveSession.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    uniqueIndex("idx_rsvp_session_user").on(table.sessionId, table.userId),
    index("idx_rsvp_session").on(table.sessionId),
]);
