"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { getAdminFeedbackAction, reviewFeedbackAction } from "@/app/actions/feedback";

// =============================================================================
// Admin Feedback Review Page — Phase 1.5A
// =============================================================================
// Role-gated to owner and admin. Filterable by stakeholder group, status,
// and context. Supports setting review status and admin notes.
// =============================================================================

type FeedbackEntry = {
    id: string;
    userId: string;
    stakeholderGroup: string;
    type: string;
    context: string;
    rating: number | null;
    body: string;
    status: string;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    adminNotes: string | null;
    promptSeenAt: Date | null;
    dismissedAt: Date | null;
    submittedAt: Date | null;
    createdAt: Date;
};

const STATUS_COLORS: Record<string, string> = {
    new: "var(--brand-orange)",
    reviewed: "rgba(59, 130, 246, 0.9)",
    actioned: "rgba(34, 197, 94, 0.9)",
    dismissed: "var(--text-muted)",
};

const GROUP_LABELS: Record<string, string> = {
    internal: "Internal",
    pilot_user: "Pilot User",
    admin: "Admin",
};

export default function AdminFeedbackPage() {
    const { data: session } = useSession();
    const { data: activeOrg } = useActiveOrganization();
    const userRole = activeOrg?.members?.find(
        (m: { userId: string }) => m.userId === session?.user?.id
    )?.role || "";
    const [entries, setEntries] = useState<FeedbackEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterGroup, setFilterGroup] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState<string>("");
    const [updating, setUpdating] = useState(false);

    const loadFeedback = useCallback(async () => {
        setLoading(true);
        const data = await getAdminFeedbackAction({
            stakeholderGroup: filterGroup as any || undefined,
            status: filterStatus as any || undefined,
        });
        setEntries(data as FeedbackEntry[]);
        setLoading(false);
    }, [filterGroup, filterStatus]);

    useEffect(() => {
        loadFeedback();
    }, [loadFeedback]);

    const handleReview = useCallback(async (feedbackId: string, status: string) => {
        setUpdating(true);
        await reviewFeedbackAction({
            feedbackId,
            status: status as "new" | "reviewed" | "actioned" | "dismissed",
            adminNotes: adminNotes.trim() || undefined,
        });
        setUpdating(false);
        setExpandedId(null);
        setAdminNotes("");
        loadFeedback();
    }, [adminNotes, loadFeedback]);

    if (!["owner", "admin"].includes(userRole)) {
        return (
            <div style={{ textAlign: "center", padding: "3rem" }}>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Access Denied</h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    You don&apos;t have permission to view this page.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Feedback Review</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Review and manage stakeholder feedback submissions.
                </p>
            </div>

            {/* Filters */}
            <div
                style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                }}
            >
                <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    style={{
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.825rem",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                    }}
                >
                    <option value="">All Groups</option>
                    <option value="internal">Internal</option>
                    <option value="pilot_user">Pilot User</option>
                    <option value="admin">Admin</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.825rem",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="actioned">Actioned</option>
                    <option value="dismissed">Dismissed</option>
                </select>

                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center" }}>
                    {entries.length} result{entries.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Results */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    Loading feedback...
                </div>
            ) : entries.length === 0 ? (
                <div
                    className="glass-card"
                    style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}
                >
                    No feedback found matching your filters.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="glass-card"
                            style={{ padding: "1.25rem" }}
                        >
                            {/* Entry header */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                    {/* Status badge */}
                                    <span
                                        style={{
                                            fontSize: "0.65rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            padding: "0.15rem 0.5rem",
                                            borderRadius: "var(--radius-full)",
                                            background: `${STATUS_COLORS[entry.status]}20`,
                                            color: STATUS_COLORS[entry.status],
                                            letterSpacing: "0.03em",
                                        }}
                                    >
                                        {entry.status}
                                    </span>

                                    {/* Group badge */}
                                    <span
                                        style={{
                                            fontSize: "0.65rem",
                                            padding: "0.15rem 0.5rem",
                                            borderRadius: "var(--radius-full)",
                                            background: "var(--border-subtle)",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        {GROUP_LABELS[entry.stakeholderGroup] || entry.stakeholderGroup}
                                    </span>

                                    {/* Type badge */}
                                    <span
                                        style={{
                                            fontSize: "0.65rem",
                                            padding: "0.15rem 0.5rem",
                                            borderRadius: "var(--radius-full)",
                                            background: "var(--border-subtle)",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        {entry.type.replace("_", " ")}
                                    </span>

                                    {/* Rating */}
                                    {entry.rating && (
                                        <span style={{ fontSize: "0.75rem", color: "var(--brand-orange)" }}>
                                            {"★".repeat(entry.rating)}{"☆".repeat(5 - entry.rating)}
                                        </span>
                                    )}
                                </div>

                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Context */}
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                                Context: {entry.context}
                            </div>

                            {/* Body */}
                            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
                                {entry.body}
                            </p>

                            {/* Prompt lifecycle */}
                            {(entry.promptSeenAt || entry.dismissedAt) && (
                                <div style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", gap: "1rem" }}>
                                    {entry.promptSeenAt && <span>Seen: {new Date(entry.promptSeenAt).toLocaleString()}</span>}
                                    {entry.dismissedAt && <span>Dismissed: {new Date(entry.dismissedAt).toLocaleString()}</span>}
                                    {entry.submittedAt && <span>Submitted: {new Date(entry.submittedAt).toLocaleString()}</span>}
                                </div>
                            )}

                            {/* Admin notes (if reviewed) */}
                            {entry.adminNotes && (
                                <div
                                    style={{
                                        marginTop: "0.75rem",
                                        padding: "0.625rem",
                                        fontSize: "0.8rem",
                                        background: "rgba(59, 130, 246, 0.05)",
                                        borderRadius: "var(--radius-sm)",
                                        borderLeft: "2px solid rgba(59, 130, 246, 0.3)",
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    <strong style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Admin Notes:</strong>
                                    <p style={{ marginTop: "0.25rem" }}>{entry.adminNotes}</p>
                                </div>
                            )}

                            {/* Action bar */}
                            <div style={{ marginTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
                                {expandedId === entry.id ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes (optional)..."
                                            rows={2}
                                            maxLength={1000}
                                            style={{
                                                width: "100%",
                                                padding: "0.5rem",
                                                fontSize: "0.8rem",
                                                background: "var(--bg-primary)",
                                                color: "var(--text-primary)",
                                                border: "1px solid var(--border-subtle)",
                                                borderRadius: "var(--radius-sm)",
                                                resize: "none",
                                            }}
                                        />
                                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                                            {(["reviewed", "actioned", "dismissed"] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleReview(entry.id, s)}
                                                    disabled={updating}
                                                    style={{
                                                        padding: "0.35rem 0.75rem",
                                                        fontSize: "0.725rem",
                                                        fontWeight: 600,
                                                        borderRadius: "var(--radius-sm)",
                                                        border: `1px solid ${STATUS_COLORS[s]}40`,
                                                        background: `${STATUS_COLORS[s]}15`,
                                                        color: STATUS_COLORS[s],
                                                        cursor: "pointer",
                                                        textTransform: "capitalize",
                                                        opacity: updating ? 0.5 : 1,
                                                    }}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => { setExpandedId(null); setAdminNotes(""); }}
                                                style={{
                                                    padding: "0.35rem 0.75rem",
                                                    fontSize: "0.725rem",
                                                    background: "transparent",
                                                    border: "1px solid var(--border-subtle)",
                                                    borderRadius: "var(--radius-sm)",
                                                    color: "var(--text-muted)",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setExpandedId(entry.id)}
                                        style={{
                                            padding: "0.35rem 0.75rem",
                                            fontSize: "0.725rem",
                                            fontWeight: 600,
                                            background: "transparent",
                                            border: "1px solid var(--border-subtle)",
                                            borderRadius: "var(--radius-sm)",
                                            color: "var(--text-secondary)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Review →
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
