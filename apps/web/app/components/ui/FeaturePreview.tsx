"use client";

// =============================================================================
// FeaturePreview — Phase H (Product Hardening)
// =============================================================================
// Shows that a feature exists but is not yet populated/generated.
// Keeps features discoverable even when data doesn't exist yet.
// =============================================================================

interface FeaturePreviewProps {
    icon: string;
    title: string;
    description: string;
    badge?: string;
}

export function FeaturePreview({ icon, title, description, badge }: FeaturePreviewProps) {
    return (
        <div style={{
            padding: "1rem 1.25rem",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            opacity: 0.7,
            marginTop: "1rem",
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.35rem",
            }}>
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                <span style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                }}>
                    {title}
                </span>
                {badge && (
                    <span style={{
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        background: "var(--brand-orange-glow)",
                        color: "var(--brand-orange-light)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "var(--radius-sm)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}>
                        {badge}
                    </span>
                )}
            </div>
            <p style={{
                fontSize: "0.75rem",
                lineHeight: 1.5,
                color: "var(--text-muted)",
                margin: 0,
            }}>
                {description}
            </p>
        </div>
    );
}
