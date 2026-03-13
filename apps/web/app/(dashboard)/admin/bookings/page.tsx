"use client";

// =============================================================================
// Admin Bookings Manager — Phase H (Product Hardening)
// =============================================================================
// View and manage audit booking requests.
// Admin can update status, set scheduled date, and add notes.
// =============================================================================

import { useState, useEffect, useTransition } from "react";
import { listBookingsAction, updateBookingStatusAction } from "@/app/actions/booking";
import { EmptyState } from "@/app/components/ui/EmptyState";

type Booking = {
    id: string;
    userId: string;
    status: string;
    requestedDate: Date | null;
    scheduledDate: Date | null;
    operationContext: string | null;
    adminNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    requested: { label: "Requested", color: "var(--brand-orange)" },
    confirmed: { label: "Confirmed", color: "var(--accent-blue)" },
    completed: { label: "Completed", color: "var(--accent-green)" },
    cancelled: { label: "Cancelled", color: "var(--text-muted)" },
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isPending, startTransition] = useTransition();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStatus, setEditStatus] = useState("");
    const [editScheduledDate, setEditScheduledDate] = useState("");
    const [editNotes, setEditNotes] = useState("");

    useEffect(() => {
        loadBookings();
    }, []);

    function loadBookings() {
        startTransition(async () => {
            const result = await listBookingsAction();
            if (result.success) setBookings(result.bookings as Booking[]);
        });
    }

    function startEdit(booking: Booking) {
        setEditingId(booking.id);
        setEditStatus(booking.status);
        setEditScheduledDate(booking.scheduledDate ? new Date(booking.scheduledDate).toISOString().slice(0, 16) : "");
        setEditNotes(booking.adminNotes || "");
    }

    function saveEdit() {
        if (!editingId) return;
        startTransition(async () => {
            await updateBookingStatusAction({
                bookingId: editingId,
                status: editStatus as "requested" | "confirmed" | "completed" | "cancelled",
                scheduledDate: editScheduledDate || null,
                adminNotes: editNotes || null,
            });
            setEditingId(null);
            loadBookings();
        });
    }

    return (
        <div>
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Booking Requests</h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
                    Manage audit booking requests from users.
                </p>
            </div>

            {bookings.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title="No Booking Requests Yet"
                    description="When users request an audit booking, their requests will appear here for you to review and schedule."
                />
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {bookings.map((b) => {
                        const statusInfo = STATUS_LABELS[b.status] || STATUS_LABELS.requested;
                        const isEditing = editingId === b.id;

                        return (
                            <div
                                key={b.id}
                                style={{
                                    padding: "1.25rem",
                                    background: "var(--bg-secondary)",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--border-subtle)",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                                    <span style={{
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        padding: "0.15rem 0.5rem",
                                        borderRadius: "999px",
                                        color: statusInfo.color,
                                        border: `1px solid ${statusInfo.color}`,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                    }}>
                                        {statusInfo.label}
                                    </span>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                    {!isEditing && (
                                        <button
                                            onClick={() => startEdit(b)}
                                            style={{
                                                marginLeft: "auto",
                                                fontSize: "0.75rem",
                                                color: "var(--brand-orange)",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {b.operationContext && (
                                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                                        <strong style={{ color: "var(--text-primary)" }}>Context:</strong> {b.operationContext}
                                    </div>
                                )}

                                {b.requestedDate && (
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                        Preferred: {new Date(b.requestedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                    </div>
                                )}

                                {b.scheduledDate && !isEditing && (
                                    <div style={{ fontSize: "0.8rem", color: "var(--accent-blue)", fontWeight: 600, marginTop: "0.25rem" }}>
                                        Scheduled: {new Date(b.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                    </div>
                                )}

                                {b.adminNotes && !isEditing && (
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem", fontStyle: "italic" }}>
                                        Note: {b.adminNotes}
                                    </div>
                                )}

                                {/* Edit Form */}
                                {isEditing && (
                                    <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.75rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", textTransform: "uppercase" }}>Status</label>
                                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="select-field">
                                                <option value="requested">Requested</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", textTransform: "uppercase" }}>Scheduled Date</label>
                                            <input type="datetime-local" value={editScheduledDate} onChange={(e) => setEditScheduledDate(e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", textTransform: "uppercase" }}>Admin Notes</label>
                                            <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="textarea-field" rows={2} placeholder="Internal notes..." />
                                        </div>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <button onClick={() => setEditingId(null)} className="btn-ghost" style={{ fontSize: "0.8rem" }}>Cancel</button>
                                            <button onClick={saveEdit} disabled={isPending} className="btn-primary" style={{ fontSize: "0.8rem" }}>
                                                {isPending ? "Saving..." : "Save"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
