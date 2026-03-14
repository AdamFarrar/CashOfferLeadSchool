"use client";

// =============================================================================
// Operator Highlights Feature 2
// =============================================================================
// Displays admin-curated "Highlighted Moment" cards.
// Each card shows a title, body text, and optional timestamp link.
// =============================================================================

import { FeaturePreview } from "@/app/components/ui/FeaturePreview";

interface Highlight {
    title: string;
    body: string;
    timestampSeconds: number | null;
    referencePostId: string | null;
}

interface OperatorHighlightsProps {
    highlights: Highlight[];
    onSeek?: (seconds: number) => void;
}

export function OperatorHighlights({ highlights, onSeek }: OperatorHighlightsProps) {
    if (!highlights || highlights.length === 0) {
        return (
            <FeaturePreview
                icon="⭐"
                title="Highlighted Moments"
                description="Curated highlights from your program team will appear here as they review episode content."
            />
        );
    }


    return (
        <div className="operator-highlights">
            <div className="workspace-section-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>⭐</span>
                <span>Highlighted Moments</span>
            </div>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginTop: "0.75rem",
            }}>
                {highlights.map((h, i) => (
                    <div
                        key={i}
                        style={{
                            padding: "1rem 1.25rem",
                            background: "linear-gradient(135deg, rgba(227, 38, 82, 0.04), rgba(255, 122, 0, 0.04))",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(227, 38, 82, 0.15)",
                        }}
                    >
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                        }}>
                            <span style={{
                                fontSize: "0.825rem",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                            }}>
                                {h.title}
                            </span>
                            {h.timestampSeconds !== null && (
                                <button
                                    onClick={() => onSeek?.(h.timestampSeconds!)}
                                    aria-label={`Jump to ${formatTimestamp(h.timestampSeconds)}`}
                                    style={{
                                        fontSize: "0.65rem",
                                        fontFamily: "var(--font-mono, monospace)",
                                        color: "var(--brand-orange)",
                                        background: "var(--brand-orange-glow)",
                                        border: "none",
                                        borderRadius: "var(--radius-sm)",
                                        padding: "0.15rem 0.4rem",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    ▶ {formatTimestamp(h.timestampSeconds)}
                                </button>
                            )}
                        </div>
                        <p style={{
                            fontSize: "0.825rem",
                            lineHeight: 1.6,
                            color: "var(--text-secondary)",
                            margin: 0,
                        }}>
                            {h.body}
                        </p>
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
