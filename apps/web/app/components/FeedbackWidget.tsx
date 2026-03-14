"use client";

import { useState, useCallback, useEffect } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { track } from "@cols/analytics";
import { FeedbackPromptViewed, FeedbackOpened, FeedbackSubmitted } from "@cols/analytics/event-contracts";

// =============================================================================
// Dashboard Feedback Widget
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
        <div className={`glass-card ${expanded ? "p-6" : "px-6 py-4"}`}>
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
                className="flex items-center justify-between cursor-pointer select-none"
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-base">
                        {submitted ? "✓" : "💬"}
                    </span>
                    <span className="font-semibold text-sm">
                        {submitted ? "Feedback sent!" : "Share Feedback"}
                    </span>
                </div>
                {!submitted && (
                    <span
                        className="text-xs text-[var(--text-muted)] transition-transform duration-200"
                        style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
                    >
                        ▼
                    </span>
                )}
            </div>

            {/* Expanded form */}
            {expanded && !submitted && (
                <div className="mt-5 flex flex-col gap-3.5">
                    {/* Type */}
                    <select
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        className="p-2 text-[0.8rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)]"
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
                        className="w-full p-2.5 text-[0.825rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] resize-y leading-relaxed"
                    />

                    {/* Error */}
                    {error && (
                        <div className="text-xs text-[var(--error-text)]">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`btn-primary text-[0.8rem] px-4 py-2 self-end ${submitting ? "opacity-60" : ""}`}
                    >
                        {submitting ? "Sending..." : "Send"}
                    </button>
                </div>
            )}
        </div>
    );
}
