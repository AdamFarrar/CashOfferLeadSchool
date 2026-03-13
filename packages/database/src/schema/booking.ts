// =============================================================================
// Booking Schema — Phase H (Product Hardening)
// =============================================================================
// Audit booking request lifecycle: requested → confirmed → completed → cancelled
// Users submit a booking request, admins confirm and schedule.
// =============================================================================

import {
    pgTable,
    pgEnum,
    uuid,
    text,
    timestamp,
    index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const bookingStatusEnum = pgEnum("booking_status", [
    "requested",
    "confirmed",
    "completed",
    "cancelled",
]);

export const booking = pgTable("booking", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").notNull().default("requested"),
    requestedDate: timestamp("requested_date", { withTimezone: true }),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    operationContext: text("operation_context"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    index("idx_booking_user").on(t.userId),
    index("idx_booking_status").on(t.status),
    index("idx_booking_created").on(t.createdAt),
]);
