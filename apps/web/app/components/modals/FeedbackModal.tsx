"use client";

// =============================================================================
// FeedbackModal — Phase A UX Flow Corrections
// =============================================================================
// Persistent feedback modal triggered from sidebar nav.
// Replaces the inline FeedbackWidget that was on the dashboard page only.
// =============================================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { track } from "@cols/analytics";
import { FeedbackOpened, FeedbackSubmitted } from "@cols/analytics/event-contracts";

interface FeedbackModalProps {
    stakeholderGroup: "internal" | "pilot_user" | "admin";
    onClose: () => void;
}

export function FeedbackModal({ stakeholderGroup, onClose }: FeedbackModalProps) {
    const [body, setBody] = useState("");
    const [feedbackType, setFeedbackType] = useState<string>("general");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        track(FeedbackOpened, { context: "nav_modal", stakeholder_group: stakeholderGroup });
    }, [stakeholderGroup]);

    // Body scroll lock
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = original; };
    }, []);

    // Escape key to dismiss
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    // Focus modal on mount
    useEffect(() => {
        modalRef.current?.focus();
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!body.trim()) {
            setError("Please enter your feedback.");
            return;
        }

        setSubmitting(true);
        setError(null);

        const result = await submitFeedbackAction({
            stakeholderGroup,
            type: feedbackType as "general" | "feature_request" | "bug_report" | "usability" | "content",
            context: "nav_modal",
            body: body.trim(),
        });

        setSubmitting(false);

        if (result.success) {
            setSubmitted(true);
            track(FeedbackSubmitted, {
                type: feedbackType,
                context: "nav_modal",
                stakeholder_group: stakeholderGroup,
                rating: 0,
                body_length: body.trim().length,
            });
            setTimeout(() => onClose(), 2500);
        } else {
            setError(result.error || "Something went wrong.");
        }
    }, [body, feedbackType, stakeholderGroup, onClose]);

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "0.6rem 0.75rem",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        fontSize: "0.85rem",
        fontFamily: "inherit",
    };

    return (
        <div className="qualification-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Share feedback">
            <div className="qualification-modal" onClick={(e) => e.stopPropagation()} ref={modalRef} tabIndex={-1}>
                <div style={{ padding: "1.5rem" }}>
                    {submitted ? (
                        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✓</div>
                            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                                Feedback Sent!
                            </h2>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                Thanks — we read every submission.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                                    💬 Share Feedback
                                </h2>
                                <button
                                    onClick={onClose}
                                    aria-label="Close feedback"
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "var(--text-muted)",
                                        cursor: "pointer",
                                        fontSize: "1.1rem",
                                        padding: "0.25rem",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <div>
                                    <label htmlFor="feedback-type" style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                                        Type
                                    </label>
                                    <select
                                        id="feedback-type"
                                        value={feedbackType}
                                        onChange={(e) => setFeedbackType(e.target.value)}
                                        style={inputStyle}
                                    >
                                        <option value="general">General</option>
                                        <option value="feature_request">Feature Request</option>
                                        <option value="bug_report">Bug Report</option>
                                        <option value="usability">Usability</option>
                                        <option value="content">Content</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="feedback-body" style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                                        Your Feedback
                                    </label>
                                    <textarea
                                        id="feedback-body"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="What's on your mind?"
                                        rows={4}
                                        maxLength={2000}
                                        style={{
                                            ...inputStyle,
                                            resize: "vertical",
                                            lineHeight: 1.5,
                                        }}
                                    />
                                </div>

                                {error && (
                                    <div style={{
                                        padding: "0.4rem 0.6rem",
                                        borderRadius: "var(--radius-sm)",
                                        background: "rgba(239,68,68,0.08)",
                                        border: "1px solid rgba(239,68,68,0.2)",
                                        color: "#ef4444",
                                        fontSize: "0.78rem",
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    style={{
                                        padding: "0.55rem",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        borderRadius: "var(--radius-sm)",
                                        background: "var(--brand-orange)",
                                        color: "#fff",
                                        border: "none",
                                        cursor: "pointer",
                                        opacity: submitting ? 0.6 : 1,
                                    }}
                                >
                                    {submitting ? "Sending..." : "Send Feedback"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
