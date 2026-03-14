// =============================================================================
// Booking Service — Phase H (Product Hardening)
// =============================================================================
// Business logic for audit booking lifecycle.
// Used by server actions only.
// =============================================================================

import { db } from "@cols/database";
import { booking } from "@cols/database/schema";
import { eq, desc } from "drizzle-orm";

export type BookingRow = typeof booking.$inferSelect;
export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled";

export async function createBooking(params: {
    userId: string;
    requestedDate: Date | null;
    operationContext: string;
}): Promise<BookingRow> {
    const [row] = await db
        .insert(booking)
        .values({
            userId: params.userId,
            requestedDate: params.requestedDate,
            operationContext: params.operationContext,
            status: "requested",
        })
        .returning();
    return row;
}

export async function getUserBooking(userId: string): Promise<BookingRow | null> {
    const rows = await db
        .select()
        .from(booking)
        .where(eq(booking.userId, userId))
        .orderBy(desc(booking.createdAt))
        .limit(1);
    return rows[0] ?? null;
}

export async function listBookings(): Promise<BookingRow[]> {
    return db
        .select()
        .from(booking)
        .orderBy(desc(booking.createdAt));
}

export async function updateBookingStatus(params: {
    bookingId: string;
    status: BookingStatus;
    scheduledDate?: Date | null;
    adminNotes?: string | null;
}): Promise<BookingRow | null> {
    const [row] = await db
        .update(booking)
        .set({
            status: params.status,
            ...(params.scheduledDate !== undefined && { scheduledDate: params.scheduledDate }),
            ...(params.adminNotes !== undefined && { adminNotes: params.adminNotes }),
            updatedAt: new Date(),
        })
        .where(eq(booking.id, params.bookingId))
        .returning();
    return row ?? null;
}
