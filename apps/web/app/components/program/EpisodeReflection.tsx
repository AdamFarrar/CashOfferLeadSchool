"use client";

// =============================================================================
// Episode Reflection (Feature 5)
// =============================================================================
// Displays AI-generated reflection prompts below the notes editor.
// Forces learners to apply what they learned. Increases completion rates.
// User responses stored in existing episode_note (no new tables).
// =============================================================================

import { FeaturePreview } from "@/app/components/ui/FeaturePreview";

interface EpisodeReflectionProps {
    prompts: string[] | null;
}

export function EpisodeReflection({ prompts }: EpisodeReflectionProps) {
    if (!prompts || prompts.length === 0) {
        return (
            <div style={{ marginTop: "2rem" }}>
                <FeaturePreview
                    icon="💡"
                    title="Reflect & Apply"
                    description="AI-generated reflection prompts will appear here to help you apply what you've learned."
                    badge="AI"
                />
            </div>
        );
    }


    return (
        <div style={{ marginTop: "2rem" }}>
            <div className="workspace-section-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>💡</span>
                <span>Reflect &amp; Apply</span>
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
                gap: "0.75rem",
                marginTop: "0.75rem",
            }}>
                {prompts.map((prompt, i) => (
                    <div
                        key={i}
                        style={{
                            padding: "1rem 1.25rem",
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-subtle)",
                            fontSize: "0.875rem",
                            lineHeight: "1.6",
                            color: "var(--text-secondary)",
                            display: "flex",
                            gap: "0.75rem",
                        }}
                    >
                        <span style={{
                            color: "var(--brand-orange)",
                            fontWeight: 700,
                            flexShrink: 0,
                            fontSize: "1rem",
                        }}>
                            {i + 1}.
                        </span>
                        <span>{prompt}</span>
                    </div>
                ))}
                <p style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    margin: 0,
                }}>
                    Use the notes editor above to write your reflections.
                </p>
            </div>
        </div>
    );
}
