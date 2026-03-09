"use client";

import { useState, useCallback, useEffect } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { track } from "@cocs/analytics";
import { FeedbackPromptViewed, FeedbackOpened, FeedbackSubmitted } from "@cocs/analytics/event-contracts";

// =============================================================================
// Dashboard Feedback Widget — Phase 1.5A
// =============================================================================
// Persistent, collapsed widget on the dashboard for ongoing feedback.
// =============================================================================

interface FeedbackWidgetProps {
    stakeholderGroup: "internal" | "pilot_user" | "admin";
}

export function FeedbackWidget({
    stakeholderGroup,
}: FeedbackWidgetProps) {
    const [expanded, setExpanded] = useState(false);
    const [body, setBody] = useState("");
    const [feedbackType, setFeedbackType] = useState<string>("general");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        track(FeedbackPromptViewed, { context: "dashboard", stakeholder_group: stakeholderGroup });
    }, [stakeholderGroup]);

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
            context: "dashboard",
            body: body.trim(),
        });

        setSubmitting(false);

        if (result.success) {
            setSubmitted(true);
            setBody("");
            setFeedbackType("general");
            track(FeedbackSubmitted, {
                type: feedbackType,
                context: "dashboard",
                stakeholder_group: stakeholderGroup,
                rating: 0,
                body_length: body.trim().length,
            });
            setTimeout(() => {
                setSubmitted(false);
                setExpanded(false);
            }, 3000);
        } else {
            setError(result.error || "Something went wrong.");
        }
    }, [body, feedbackType, stakeholderGroup]);

    return (
        <div
            className="glass-card"
            style={{ padding: expanded ? "1.5rem" : "1rem 1.5rem" }}
        >
            {/* Collapsed header */}
            <div
                onClick={() => {
                    if (!submitted) {
                        const wasExpanded = expanded;
                        setExpanded(!expanded);
                        if (!wasExpanded) {
                            track(FeedbackOpened, { context: "dashboard", stakeholder_group: stakeholderGroup });
                        }
                    }
                }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span style={{ fontSize: "1rem" }}>
                        {submitted ? "✓" : "💬"}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {submitted ? "Feedback sent!" : "Share Feedback"}
                    </span>
                </div>
                {!submitted && (
                    <span
                        style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            transition: "transform 0.2s",
                            transform: expanded ? "rotate(180deg)" : "rotate(0)",
                        }}
                    >
                        ▼
                    </span>
                )}
            </div>

            {/* Expanded form */}
            {expanded && !submitted && (
                <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    {/* Type */}
                    <select
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        style={{
                            padding: "0.5rem",
                            fontSize: "0.8rem",
                            background: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                        }}
                    >
                        <option value="general">General</option>
                        <option value="feature_request">Feature Request</option>
                        <option value="bug_report">Bug Report</option>
                        <option value="usability">Usability</option>
                        <option value="content">Content</option>
                    </select>

                    {/* Body */}
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="What's on your mind?"
                        rows={3}
                        maxLength={2000}
                        style={{
                            width: "100%",
                            padding: "0.625rem",
                            fontSize: "0.825rem",
                            background: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                            resize: "vertical",
                            lineHeight: 1.5,
                        }}
                    />

                    {/* Error */}
                    {error && (
                        <div style={{ fontSize: "0.75rem", color: "var(--error-text)" }}>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary"
                        style={{
                            fontSize: "0.8rem",
                            padding: "0.5rem 1rem",
                            alignSelf: "flex-end",
                            opacity: submitting ? 0.6 : 1,
                        }}
                    >
                        {submitting ? "Sending..." : "Send"}
                    </button>
                </div>
            )}
        </div>
    );
}
