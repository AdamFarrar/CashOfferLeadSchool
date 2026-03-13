"use client";

// =============================================================================
// Best Moments Timeline — Phase 6 Feature 3
// =============================================================================
// Displays AI-detected best moments as clickable timestamp links.
// Clicking seeks the video player to that moment.
// =============================================================================

import { FeaturePreview } from "@/app/components/ui/FeaturePreview";

interface BestMoment {
    title: string;
    timestampSeconds: number | null;
    source: "transcript" | "discussion";
    description: string;
}

interface BestMomentsProps {
    moments: BestMoment[] | null;
    onSeek?: (seconds: number) => void;
}

export function BestMoments({ moments, onSeek }: BestMomentsProps) {
    if (!moments || moments.length === 0) {
        return (
            <FeaturePreview
                icon="⚡"
                title="Best Moments"
                description="AI-detected highlights and key moments will appear here once insights are generated for this episode."
                badge="AI"
            />
        );
    }


    return (
        <div className="best-moments">
            <div className="workspace-section-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>⚡</span>
                <span>Best Moments</span>
                <span
                    style={{
                        fontSize: "0.65rem",
                        background: "var(--brand-orange-glow)",
                        color: "var(--brand-orange-light)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: 600,
                    }}
                >
                    AI
                </span>
            </div>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginTop: "0.75rem",
            }}>
                {moments.map((moment, i) => (
                    <div
                        key={i}
                        className="best-moment-card"
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.75rem",
                            padding: "0.75rem 1rem",
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-subtle)",
                            cursor: moment.timestampSeconds !== null && onSeek ? "pointer" : "default",
                            transition: "border-color 0.15s ease",
                        }}
                        onClick={() => {
                            if (moment.timestampSeconds !== null && onSeek) {
                                onSeek(moment.timestampSeconds);
                            }
                        }}
                        role={moment.timestampSeconds !== null && onSeek ? "button" : undefined}
                        tabIndex={moment.timestampSeconds !== null && onSeek ? 0 : undefined}
                        aria-label={
                            moment.timestampSeconds !== null
                                ? `Jump to ${formatTimestamp(moment.timestampSeconds)} — ${moment.title}`
                                : moment.title
                        }
                    >
                        {/* Timestamp badge */}
                        <span style={{
                            flexShrink: 0,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            fontFamily: "var(--font-mono, monospace)",
                            color: moment.timestampSeconds !== null
                                ? "var(--brand-orange)"
                                : "var(--text-muted)",
                            minWidth: "3.2rem",
                            marginTop: "0.15rem",
                        }}>
                            {moment.timestampSeconds !== null
                                ? formatTimestamp(moment.timestampSeconds)
                                : "—"}
                        </span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: "0.825rem",
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                lineHeight: 1.4,
                            }}>
                                {moment.title}
                            </div>
                            <div style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                                marginTop: "0.2rem",
                                lineHeight: 1.4,
                            }}>
                                {moment.description}
                            </div>
                        </div>

                        {/* Source indicator */}
                        <span style={{
                            flexShrink: 0,
                            fontSize: "0.6rem",
                            color: "var(--text-muted)",
                            padding: "0.1rem 0.4rem",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                        }}>
                            {moment.source === "discussion" ? "💬" : "🎙️"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
