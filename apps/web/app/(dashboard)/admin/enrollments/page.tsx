"use client";

// =============================================================================
// Admin Enrollments Page — Phase 7
// =============================================================================
// Lists all enrollments, allows manual enrollment of users.
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@cocs/auth/client";
import { adminListEnrollmentsAction, adminEnrollUserAction } from "@/app/actions/stripe";

interface EnrollmentRow {
    id: string;
    userId: string;
    status: string;
    amountCents: number;
    currency: string;
    enrolledAt: string;
    stripeCustomerId: string | null;
    userName: string;
    userEmail: string;
}

export default function AdminEnrollmentsPage() {
    const { data: session } = useSession();
    const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);
    const [manualUserId, setManualUserId] = useState("");

    const loadEnrollments = useCallback(async () => {
        setLoading(true);
        const result = await adminListEnrollmentsAction(1);
        if (result.success) {
            setEnrollments(result.enrollments as EnrollmentRow[]);
            setTotal(result.total);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadEnrollments();
    }, [loadEnrollments]);

    const handleManualEnroll = async () => {
        if (!manualUserId.trim()) return setStatus("Enter a user ID.");
        setStatus("Enrolling...");
        const result = await adminEnrollUserAction(manualUserId.trim());
        if (result.success) {
            setStatus("✅ User enrolled successfully.");
            setManualUserId("");
            loadEnrollments();
        } else {
            setStatus(`❌ ${result.error}`);
        }
    };

    if (!session) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: "56rem" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                💳 Enrollment Management
            </h1>

            {status && (
                <div style={{
                    padding: "0.75rem 1rem",
                    marginBottom: "1.5rem",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${status.startsWith("✅") ? "rgba(34,197,94,0.3)" : status.startsWith("❌") ? "rgba(239,68,68,0.3)" : "var(--border-subtle)"}`,
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                }}>
                    {status}
                </div>
            )}

            {/* Manual Enrollment */}
            <div style={{
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(227, 38, 82, 0.15)",
                marginBottom: "2rem",
            }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                    ➕ Manual Enrollment
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 0.75rem" }}>
                    Enroll a user without payment (comp/test). Enter their user UUID.
                </p>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                        type="text"
                        value={manualUserId}
                        onChange={(e) => setManualUserId(e.target.value)}
                        placeholder="User UUID"
                        style={{
                            flex: 1,
                            padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "0.8rem",
                            fontFamily: "var(--font-mono, monospace)",
                        }}
                    />
                    <button
                        onClick={handleManualEnroll}
                        className="episode-action-btn"
                        style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
                    >
                        Enroll User
                    </button>
                </div>
            </div>

            {/* Enrollments Table */}
            <div style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                marginBottom: "0.5rem",
            }}>
                All Enrollments ({total})
            </div>

            {loading ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Loading enrollments...
                </div>
            ) : enrollments.length === 0 ? (
                <div style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                }}>
                    No enrollments yet. Users need to complete checkout or be manually enrolled.
                </div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.8rem",
                    }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                <th style={thStyle}>User</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Enrolled</th>
                                <th style={thStyle}>Stripe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.map((e) => (
                                <tr key={e.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 600 }}>{e.userName}</div>
                                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{e.userEmail}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            fontSize: "0.65rem",
                                            fontWeight: 700,
                                            padding: "0.15rem 0.5rem",
                                            borderRadius: "2rem",
                                            background: e.status === "active"
                                                ? "rgba(34,197,94,0.12)"
                                                : e.status === "refunded"
                                                    ? "rgba(239,68,68,0.12)"
                                                    : "rgba(251,191,36,0.12)",
                                            color: e.status === "active"
                                                ? "#22c55e"
                                                : e.status === "refunded"
                                                    ? "#ef4444"
                                                    : "#fbbf24",
                                        }}>
                                            {e.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        {e.amountCents > 0
                                            ? `$${(e.amountCents / 100).toFixed(2)}`
                                            : "Comp"}
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                        {new Date(e.enrolledAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                                        {e.stripeCustomerId === "manual" ? "Manual" : e.stripeCustomerId?.slice(0, 12) ?? "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "0.5rem 0.75rem",
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
};

const tdStyle: React.CSSProperties = {
    padding: "0.75rem",
    verticalAlign: "middle",
};
