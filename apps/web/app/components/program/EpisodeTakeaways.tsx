"use client";

// =============================================================================
// Episode Takeaways (Feature 1)
// =============================================================================
// Displays AI-generated key takeaways below the video metadata.
// Read-only for users. Loaded from cached ai_insight.
// =============================================================================

import { FeaturePreview } from "@/app/components/ui/FeaturePreview";

interface EpisodeTakeawaysProps {
    takeaways: string[] | null;
}

export function EpisodeTakeaways({ takeaways }: EpisodeTakeawaysProps) {
    if (!takeaways || takeaways.length === 0) {
        return (
            <FeaturePreview
                icon="🎯"
                title="Key Takeaways"
                description="AI-generated key takeaways will appear here once insights are prepared for this episode."
                badge="AI"
            />
        );
    }


    return (
        <div className="episode-takeaways">
            <div className="workspace-section-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>🎯</span>
                <span>Key Takeaways</span>
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
            <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
            }}>
                {takeaways.map((t, i) => (
                    <li
                        key={i}
                        style={{
                            display: "flex",
                            gap: "0.75rem",
                            fontSize: "0.875rem",
                            lineHeight: "1.6",
                            color: "var(--text-secondary)",
                        }}
                    >
                        <span style={{
                            color: "var(--brand-orange)",
                            fontWeight: 700,
                            flexShrink: 0,
                            marginTop: "0.1rem",
                        }}>
                            →
                        </span>
                        <span>{t}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
