"use client";

// =============================================================================
// EmptyState — Phase H (Product Hardening)
// =============================================================================
// Reusable empty-state component. Used when a section has valid zero-data.
// Communicates purpose, explains why it's empty, and guides next action.
// =============================================================================

import Link from "next/link";

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    cta?: { label: string; href: string };
    secondaryAction?: { label: string; href: string };
}

export function EmptyState({ icon, title, description, cta, secondaryAction }: EmptyStateProps) {
    return (
        <div style={{
            textAlign: "center",
            padding: "4rem 2rem",
            maxWidth: "28rem",
            margin: "0 auto",
        }}>
            <div style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                lineHeight: 1,
            }}>
                {icon}
            </div>
            <h2 style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
            }}>
                {title}
            </h2>
            <p style={{
                fontSize: "0.85rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                margin: "0 0 1.5rem 0",
            }}>
                {description}
            </p>
            {cta && (
                <Link
                    href={cta.href}
                    className="program-hero-cta"
                    style={{ display: "inline-block" }}
                >
                    {cta.label}
                </Link>
            )}
            {secondaryAction && (
                <div style={{ marginTop: "0.75rem" }}>
                    <Link
                        href={secondaryAction.href}
                        style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            textDecoration: "none",
                        }}
                    >
                        {secondaryAction.label}
                    </Link>
                </div>
            )}
        </div>
    );
}
