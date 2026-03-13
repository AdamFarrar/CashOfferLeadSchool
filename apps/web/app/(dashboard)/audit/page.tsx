"use client";

// =============================================================================
// Book Audit — Phase H (Product Hardening)
// =============================================================================
// Booking state machine page:
// - no booking → show request form
// - pending → show request status
// - confirmed → show booked details
// - completed → show completion state
// =============================================================================

import { useState, useEffect, useTransition } from "react";
import { submitBookingAction, getMyBookingAction } from "@/app/actions/booking";

type BookingData = {
    id: string;
    status: string;
    requestedDate: Date | null;
    scheduledDate: Date | null;
    operationContext: string | null;
    adminNotes: string | null;
    createdAt: Date;
};

export default function AuditPage() {
    const [booking, setBooking] = useState<BookingData | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [requestedDate, setRequestedDate] = useState("");
    const [operationContext, setOperationContext] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        startTransition(async () => {
            const result = await getMyBookingAction();
            if (result.success && result.booking) {
                setBooking(result.booking as BookingData);
            }
            setLoaded(true);
        });
    }, []);

    function handleSubmit() {
        setError("");
        if (!operationContext.trim()) {
            setError("Tell us about your current operation so we can prepare.");
            return;
        }

        startTransition(async () => {
            const result = await submitBookingAction({
                requestedDate: requestedDate || null,
                operationContext: operationContext.trim(),
            });
            if (result.success && result.booking) {
                setBooking(result.booking as BookingData);
            } else {
                setError(result.error || "Failed to submit request.");
            }
        });
    }

    if (!loaded) {
        return (
            <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--text-muted)" }}>
                Loading...
            </div>
        );
    }

    // ── State: Completed ──
    if (booking?.status === "completed") {
        return (
            <div style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: "28rem", margin: "0 auto" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Audit Complete</h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Your conversion audit has been completed. Check your email for the full audit report and recommended next steps.
                </p>
                {booking.adminNotes && (
                    <div style={{
                        marginTop: "1.5rem",
                        padding: "1rem",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        textAlign: "left",
                    }}>
                        <strong>Notes from your auditor:</strong> {booking.adminNotes}
                    </div>
                )}
            </div>
        );
    }

    // ── State: Confirmed ──
    if (booking?.status === "confirmed") {
        return (
            <div style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: "28rem", margin: "0 auto" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Audit Confirmed</h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
                    Your conversion audit has been scheduled. You'll receive a calendar invite with details.
                </p>
                {booking.scheduledDate && (
                    <div style={{
                        padding: "1rem 1.25rem",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        display: "inline-block",
                    }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                            Scheduled For
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-blue)" }}>
                            {new Date(booking.scheduledDate).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                            })}
                        </div>
                    </div>
                )}
                {booking.adminNotes && (
                    <div style={{
                        marginTop: "1rem",
                        padding: "0.75rem 1rem",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                    }}>
                        {booking.adminNotes}
                    </div>
                )}
            </div>
        );
    }

    // ── State: Requested (Pending) ──
    if (booking?.status === "requested") {
        return (
            <div style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: "28rem", margin: "0 auto" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Request Submitted</h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Your audit request has been received. Our team will review your submission and reach out to confirm scheduling.
                </p>
                <div style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    textAlign: "left",
                }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                        Your Request
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        {booking.operationContext}
                    </div>
                    {booking.requestedDate && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                            Preferred: {new Date(booking.requestedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── State: No Booking (Request Form) ──
    return (
        <div style={{ maxWidth: "32rem", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Book Your Conversion Audit</h1>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    One-on-one review of your current lead flow, conversion points, and cash offer operation. Our team will analyze your setup and provide specific, actionable recommendations.
                </p>
            </div>

            {/* What's Covered */}
            <div style={{
                padding: "1.25rem",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "1.5rem",
            }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    What's Covered
                </div>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                    {[
                        "🔍 Lead flow analysis — landing pages, forms, follow-up timing",
                        "📊 Conversion point mapping — where leads drop off and why",
                        "📞 Follow-up sequence review — scripts, cadence, channel mix",
                        "💰 Revenue per lead optimization — pricing, offer structure",
                        "📋 Custom action plan — prioritized fixes specific to your operation",
                    ].map((item) => (
                        <div key={item} style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Request Form */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Request Your Audit</h2>

                <div style={{ display: "grid", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Tell Us About Your Operation *
                        </label>
                        <textarea
                            value={operationContext}
                            onChange={(e) => setOperationContext(e.target.value)}
                            placeholder="Describe your current lead generation setup, monthly volume, conversion rates, and what you'd most like help with..."
                            className="textarea-field"
                            rows={5}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Preferred Date (optional)
                        </label>
                        <input
                            type="date"
                            value={requestedDate}
                            onChange={(e) => setRequestedDate(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>

                {error && (
                    <div style={{ marginTop: "1rem", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "0.8rem" }}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="btn-primary"
                    style={{ width: "100%", marginTop: "1rem" }}
                >
                    {isPending ? "Submitting..." : "Submit Request"}
                </button>
            </div>
        </div>
    );
}
