"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, useActiveOrganization } from "@cols/auth/client";
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
            <div className="text-center p-12">
                <h1 className="text-2xl mb-2">Access Denied</h1>
                <p className="text-[var(--text-secondary)]">
                    You don&apos;t have permission to view this page.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl mb-2">Feedback Review</h1>
                <p className="text-[var(--text-secondary)] text-[0.9rem]">
                    Review and manage stakeholder feedback submissions.
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="px-3 py-2 text-[0.825rem] bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)]"
                >
                    <option value="">All Groups</option>
                    <option value="internal">Internal</option>
                    <option value="pilot_user">Pilot User</option>
                    <option value="admin">Admin</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 text-[0.825rem] bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)]"
                >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="actioned">Actioned</option>
                    <option value="dismissed">Dismissed</option>
                </select>

                <span className="text-[0.8rem] text-[var(--text-muted)] self-center">
                    {entries.length} result{entries.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Results */}
            {loading ? (
                <div className="text-center p-12 text-[var(--text-muted)]">
                    Loading feedback...
                </div>
            ) : entries.length === 0 ? (
                <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                    No feedback found matching your filters.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="glass-card p-5"
                        >
                            {/* Entry header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Status badge — dynamic color from STATUS_COLORS map */}
                                    <span
                                        className="text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide"
                                        style={{
                                            background: `${STATUS_COLORS[entry.status]}20`,
                                            color: STATUS_COLORS[entry.status],
                                        }}
                                    >
                                        {entry.status}
                                    </span>

                                    {/* Group badge */}
                                    <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-[var(--border-subtle)] text-[var(--text-secondary)]">
                                        {GROUP_LABELS[entry.stakeholderGroup] || entry.stakeholderGroup}
                                    </span>

                                    {/* Type badge */}
                                    <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-[var(--border-subtle)] text-[var(--text-secondary)]">
                                        {entry.type.replace("_", " ")}
                                    </span>

                                    {/* Rating */}
                                    {entry.rating && (
                                        <span className="text-xs text-[var(--brand-orange)]">
                                            {"★".repeat(entry.rating)}{"☆".repeat(5 - entry.rating)}
                                        </span>
                                    )}
                                </div>

                                <span className="text-[0.7rem] text-[var(--text-muted)] whitespace-nowrap">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Context */}
                            <div className="text-[0.7rem] text-[var(--text-muted)] mb-2">
                                Context: {entry.context}
                            </div>

                            {/* Body */}
                            <p className="text-[0.85rem] leading-relaxed text-[var(--text-primary)]">
                                {entry.body}
                            </p>

                            {/* Prompt lifecycle */}
                            {(entry.promptSeenAt || entry.dismissedAt) && (
                                <div className="mt-3 text-[0.7rem] text-[var(--text-muted)] flex gap-4">
                                    {entry.promptSeenAt && <span>Seen: {new Date(entry.promptSeenAt).toLocaleString()}</span>}
                                    {entry.dismissedAt && <span>Dismissed: {new Date(entry.dismissedAt).toLocaleString()}</span>}
                                    {entry.submittedAt && <span>Submitted: {new Date(entry.submittedAt).toLocaleString()}</span>}
                                </div>
                            )}

                            {/* Admin notes (if reviewed) */}
                            {entry.adminNotes && (
                                <div className="mt-3 p-2.5 text-[0.8rem] bg-blue-500/5 rounded-[var(--radius-sm)] border-l-2 border-blue-500/30 text-[var(--text-secondary)]">
                                    <strong className="text-[0.7rem] uppercase tracking-wide">Admin Notes:</strong>
                                    <p className="mt-1">{entry.adminNotes}</p>
                                </div>
                            )}

                            {/* Action bar */}
                            <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
                                {expandedId === entry.id ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes (optional)..."
                                            rows={2}
                                            maxLength={1000}
                                            className="w-full p-2 text-[0.8rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] resize-none"
                                        />
                                        <div className="flex gap-1.5 flex-wrap">
                                            {(["reviewed", "actioned", "dismissed"] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleReview(entry.id, s)}
                                                    disabled={updating}
                                                    className="px-3 py-1.5 text-[0.725rem] font-semibold rounded-[var(--radius-sm)] cursor-pointer capitalize"
                                                    style={{
                                                        border: `1px solid ${STATUS_COLORS[s]}40`,
                                                        background: `${STATUS_COLORS[s]}15`,
                                                        color: STATUS_COLORS[s],
                                                        opacity: updating ? 0.5 : 1,
                                                    }}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => { setExpandedId(null); setAdminNotes(""); }}
                                                className="px-3 py-1.5 text-[0.725rem] bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[var(--text-muted)] cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setExpandedId(entry.id)}
                                        className="px-3 py-1.5 text-[0.725rem] font-semibold bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] cursor-pointer"
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
