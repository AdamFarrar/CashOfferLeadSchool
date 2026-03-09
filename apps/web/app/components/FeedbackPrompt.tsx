"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { track } from "@cocs/analytics";
import {
    FeedbackPromptViewed,
    FeedbackOpened,
    FeedbackSubmitted as FeedbackSubmittedContract,
    FeedbackDismissed,
} from "@cocs/analytics/event-contracts";

// =============================================================================
// Post-Qualification Feedback Prompt — Phase 1.5A
// =============================================================================
// Non-modal inline card shown after qualification submission.
// Tracks prompt_seen_at, dismissed_at, and submitted_at lifecycle.
// =============================================================================

interface FeedbackPromptProps {
    stakeholderGroup: "internal" | "pilot_user" | "admin";
    context: string;
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export function FeedbackPrompt({
    stakeholderGroup,
    context,
}: FeedbackPromptProps) {
    const [visible, setVisible] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState("");
    const [feedbackType, setFeedbackType] = useState<string>("general");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const seenRecorded = useRef(false);
    const promptSeenAt = useRef<string | null>(null);

    useEffect(() => {
        if (!seenRecorded.current) {
            seenRecorded.current = true;
            promptSeenAt.current = new Date().toISOString();
            track(FeedbackPromptViewed, { context, stakeholder_group: stakeholderGroup });
        }
    }, [context, stakeholderGroup]);

    const handleDismiss = useCallback(() => {
        const seenTime = promptSeenAt.current ? Math.round((Date.now() - new Date(promptSeenAt.current).getTime()) / 1000) : 0;
        track(FeedbackDismissed, { context, time_visible_s: seenTime });
        setVisible(false);
    }, [context]);

    const handleSubmit = useCallback(async () => {
        if (!body.trim()) {
            setError("Please share your feedback before submitting.");
            return;
        }

        setSubmitting(true);
        setError(null);

        const result = await submitFeedbackAction({
            stakeholderGroup,
            type: feedbackType as "general" | "feature_request" | "bug_report" | "usability" | "content",
            context,
            body: body.trim(),
            rating: rating > 0 ? rating : undefined,
            promptSeenAt: promptSeenAt.current || undefined,
        });

        setSubmitting(false);

        if (result.success) {
            track(FeedbackSubmittedContract, {
                type: feedbackType,
                context,
                stakeholder_group: stakeholderGroup,
                rating: rating > 0 ? rating : 0,
                body_length: body.trim().length,
            });
            setSubmitted(true);
        } else {
            setError(result.error || "Something went wrong.");
        }
    }, [body, rating, feedbackType, stakeholderGroup, context]);

    if (!visible) return null;

    if (submitted) {
        return (
            <div
                className="glass-card animate-fade-in-up"
                style={{
                    padding: "1.25rem 1.5rem",
                    marginTop: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    borderLeft: "3px solid rgba(34, 197, 94, 0.4)",
                }}
            >
                <span style={{ fontSize: "1.25rem" }}>✓</span>
                <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Thank you for your feedback!
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        Your input helps us build a better platform.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="glass-card animate-fade-in-up animate-delay-400"
            style={{
                padding: "1.5rem",
                marginTop: "1.5rem",
                borderLeft: "3px solid rgba(249, 115, 22, 0.3)",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: expanded ? "1.25rem" : 0,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span
                        style={{
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "var(--radius-md)",
                            background: "var(--brand-orange-glow)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.9rem",
                        }}
                    >
                        💬
                    </span>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            How was your experience?
                        </div>
                        <p style={{ fontSize: "0.775rem", color: "var(--text-secondary)" }}>
                            Quick feedback helps us improve.
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.25rem" }}>
                    {!expanded && (
                        <button
                            onClick={() => {
                                track(FeedbackOpened, { context, stakeholder_group: stakeholderGroup });
                                setExpanded(true);
                            }}
                            style={{
                                padding: "0.35rem 0.75rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                background: "var(--brand-orange)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "var(--radius-sm)",
                                cursor: "pointer",
                            }}
                        >
                            Share Feedback
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        style={{
                            padding: "0.35rem 0.5rem",
                            fontSize: "0.75rem",
                            background: "transparent",
                            color: "var(--text-muted)",
                            border: "none",
                            cursor: "pointer",
                        }}
                        title="Dismiss"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Expanded form */}
            {expanded && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Rating */}
                    <div>
                        <label style={{ fontSize: "0.775rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>
                            Rating (optional)
                        </label>
                        <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setRating(n)}
                                    style={{
                                        width: "2rem",
                                        height: "2rem",
                                        borderRadius: "var(--radius-sm)",
                                        border: `1px solid ${rating >= n ? "var(--brand-orange)" : "var(--border-subtle)"}`,
                                        background: rating >= n ? "var(--brand-orange-glow)" : "transparent",
                                        color: rating >= n ? "var(--brand-orange)" : "var(--text-muted)",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                            {rating > 0 && (
                                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
                                    {RATING_LABELS[rating]}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Type selector */}
                    <div>
                        <label style={{ fontSize: "0.775rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>
                            Type
                        </label>
                        <select
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value)}
                            style={{
                                padding: "0.5rem",
                                fontSize: "0.825rem",
                                background: "var(--bg-primary)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-sm)",
                                width: "100%",
                            }}
                        >
                            <option value="general">General Feedback</option>
                            <option value="feature_request">Feature Request</option>
                            <option value="bug_report">Bug Report</option>
                            <option value="usability">Usability</option>
                            <option value="content">Content</option>
                        </select>
                    </div>

                    {/* Body */}
                    <div>
                        <label style={{ fontSize: "0.775rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>
                            Your feedback
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Tell us what you think..."
                            rows={3}
                            maxLength={2000}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                fontSize: "0.85rem",
                                background: "var(--bg-primary)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-sm)",
                                resize: "vertical",
                                lineHeight: 1.5,
                            }}
                        />
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textAlign: "right", marginTop: "0.25rem" }}>
                            {body.length}/2000
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ fontSize: "0.8rem", color: "var(--error-text)", padding: "0.5rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-sm)" }}>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary"
                        style={{
                            fontSize: "0.825rem",
                            padding: "0.625rem 1.25rem",
                            alignSelf: "flex-end",
                            opacity: submitting ? 0.6 : 1,
                        }}
                    >
                        {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                </div>
            )}
        </div>
    );
}
