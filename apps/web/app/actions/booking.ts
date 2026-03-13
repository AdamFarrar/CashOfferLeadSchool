"use server";

// =============================================================================
// Booking Server Actions — Phase H (Product Hardening)
// =============================================================================

import { getServerIdentity } from "./identity";
import { requireAdmin } from "./guards";
import { emitDomainEvent, DOMAIN_EVENTS } from "@cocs/events";
import {
    createBooking,
    getUserBooking,
    listBookings,
    updateBookingStatus,
} from "@cocs/services";
import type { BookingStatus } from "@cocs/services";

export async function submitBookingAction(params: {
    requestedDate: string | null;
    operationContext: string;
}) {
    try {
        const identity = await getServerIdentity();
        if (!identity) return { success: false, error: "Not authenticated" };

        const row = await createBooking({
            userId: identity.userId,
            requestedDate: params.requestedDate ? new Date(params.requestedDate) : null,
            operationContext: params.operationContext,
        });

        // Emit domain event for automation
        emitDomainEvent({
            eventKey: DOMAIN_EVENTS.BOOKING_SUBMITTED,
            actor: { type: "user", id: identity.userId },
            subject: { type: "booking", id: row?.id ?? "unknown" },
            organizationId: identity.organizationId,
            payload: { userId: identity.userId },
        }).catch(() => {});

        return { success: true, booking: row };
    } catch (e) {
        console.error("[submitBookingAction]", e);
        return { success: false, error: "Failed to submit booking request" };
    }
}

export async function getMyBookingAction() {
    try {
        const identity = await getServerIdentity();
        if (!identity) return { success: false, error: "Not authenticated" };

        const row = await getUserBooking(identity.userId);
        return { success: true, booking: row };
    } catch (e) {
        console.error("[getMyBookingAction]", e);
        return { success: false, error: "Failed to load booking" };
    }
}

export async function listBookingsAction() {
    try {
        await requireAdmin();
        const rows = await listBookings();
        return { success: true, bookings: rows };
    } catch (e) {
        console.error("[listBookingsAction]", e);
        return { success: false, error: "Failed to list bookings" };
    }
}

export async function updateBookingStatusAction(params: {
    bookingId: string;
    status: BookingStatus;
    scheduledDate?: string | null;
    adminNotes?: string | null;
}) {
    try {
        await requireAdmin();
        const row = await updateBookingStatus({
            bookingId: params.bookingId,
            status: params.status,
            scheduledDate: params.scheduledDate ? new Date(params.scheduledDate) : params.scheduledDate === null ? null : undefined,
            adminNotes: params.adminNotes,
        });
        return { success: true, booking: row };
    } catch (e) {
        console.error("[updateBookingStatusAction]", e);
        return { success: false, error: "Failed to update booking" };
    }
}
