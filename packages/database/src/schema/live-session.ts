// =============================================================================
// Live Session Schema — Phase 9
// =============================================================================

import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

export type LiveSessionStatus = "scheduled" | "live" | "completed" | "cancelled";

export const liveSession = pgTable("live_session", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    status: text("status").notNull().default("scheduled").$type<LiveSessionStatus>(),
    meetingUrl: text("meeting_url"),
    recordingUrl: text("recording_url"),
    hostName: text("host_name").notNull().default("Adam Farrar"),
    maxAttendees: integer("max_attendees").default(100),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
