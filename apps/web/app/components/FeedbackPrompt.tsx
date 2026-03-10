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
            <div className="glass-card animate-fade-in-up px-6 py-5 mt-6 flex items-center gap-3 border-l-[3px] border-green-500/40">
                <span className="text-xl">✓</span>
                <div>
                    <div className="font-semibold text-[0.9rem]">
                        Thank you for your feedback!
                    </div>
                    <p className="text-[0.8rem] text-[var(--text-secondary)] mt-1">
                        Your input helps us build a better platform.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card animate-fade-in-up animate-delay-400 p-6 mt-6 border-l-[3px] border-orange-500/30">
            {/* Header */}
            <div className={`flex justify-between items-start ${expanded ? "mb-5" : ""}`}>
                <div className="flex items-center gap-2.5">
                    <span
                        className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[0.9rem]"
                        style={{ background: "var(--brand-orange-glow)" }}
                    >
                        💬
                    </span>
                    <div>
                        <div className="font-semibold text-[0.9rem]">
                            How was your experience?
                        </div>
                        <p className="text-[0.775rem] text-[var(--text-secondary)]">
                            Quick feedback helps us improve.
                        </p>
                    </div>
                </div>

                <div className="flex gap-1">
                    {!expanded && (
                        <button
                            onClick={() => {
                                track(FeedbackOpened, { context, stakeholder_group: stakeholderGroup });
                                setExpanded(true);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white border-none rounded-[var(--radius-sm)] cursor-pointer"
                            style={{ background: "var(--brand-orange)" }}
                        >
                            Share Feedback
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="px-2 py-1.5 text-xs bg-transparent text-[var(--text-muted)] border-none cursor-pointer"
                        title="Dismiss"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Expanded form */}
            {expanded && (
                <div className="flex flex-col gap-4">
                    {/* Rating */}
                    <div>
                        <label className="text-[0.775rem] text-[var(--text-secondary)] block mb-2">
                            Rating (optional)
                        </label>
                        <div className="flex gap-1.5 items-center">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setRating(n)}
                                    className="w-8 h-8 rounded-[var(--radius-sm)] text-[0.8rem] font-semibold cursor-pointer transition-all duration-150"
                                    style={{
                                        border: `1px solid ${rating >= n ? "var(--brand-orange)" : "var(--border-subtle)"}`,
                                        background: rating >= n ? "var(--brand-orange-glow)" : "transparent",
                                        color: rating >= n ? "var(--brand-orange)" : "var(--text-muted)",
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                            {rating > 0 && (
                                <span className="text-xs text-[var(--text-secondary)] ml-2">
                                    {RATING_LABELS[rating]}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Type selector */}
                    <div>
                        <label className="text-[0.775rem] text-[var(--text-secondary)] block mb-2">
                            Type
                        </label>
                        <select
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value)}
                            className="p-2 text-[0.825rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] w-full"
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
                        <label className="text-[0.775rem] text-[var(--text-secondary)] block mb-2">
                            Your feedback
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Tell us what you think..."
                            rows={3}
                            maxLength={2000}
                            className="w-full p-3 text-[0.85rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] resize-y leading-relaxed"
                        />
                        <div className="text-[0.65rem] text-[var(--text-muted)] text-right mt-1">
                            {body.length}/2000
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-[0.8rem] text-[var(--error-text)] p-2 bg-red-500/10 rounded-[var(--radius-sm)]">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`btn-primary text-[0.825rem] px-5 py-2.5 self-end ${submitting ? "opacity-60" : ""}`}
                    >
                        {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                </div>
            )}
        </div>
    );
}
