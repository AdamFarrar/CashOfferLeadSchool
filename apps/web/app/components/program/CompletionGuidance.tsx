"use client";

// =============================================================================
// Completion Guidance — Phase 6 Feature 5
// =============================================================================
// Dashboard nudge cards. Deterministic rules, NOT AI-generated.
// Computed dynamically per user — not persisted (Rule 5).
// =============================================================================

import Link from "next/link";
import { FeaturePreview } from "@/app/components/ui/FeaturePreview";

interface GuidanceMessage {
    type: "stalled" | "no_notes" | "rapid_progress" | "completed" | "just_started";
    title: string;
    body: string;
    priority: number;
}

interface CompletionGuidanceProps {
    messages: GuidanceMessage[];
    nextEpisodeId?: string | null;
    programSlug?: string | null;
}

export function CompletionGuidance({ messages, nextEpisodeId, programSlug }: CompletionGuidanceProps) {
    if (!messages || messages.length === 0) {
        return (
            <FeaturePreview
                icon="🧭"
                title="Personalized Guidance"
                description="As you progress through the program, you'll receive tailored recommendations based on your learning patterns."
                badge="AI"
            />
        );
    }


    // Show only the top-priority message
    const msg = messages[0];

    return (
        <div style={{
            padding: "1rem 1.25rem",
            marginTop: "1rem",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
        }}>
            <div style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.35rem",
            }}>
                {msg.title}
            </div>
            <p style={{
                fontSize: "0.8rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                margin: 0,
            }}>
                {msg.body}
            </p>
            {msg.type === "stalled" && nextEpisodeId && (
                <Link
                    href={programSlug ? `/programs/${programSlug}/episodes/${nextEpisodeId}` : `/episodes/${nextEpisodeId}`}
                    style={{
                        display: "inline-block",
                        marginTop: "0.75rem",
                        fontSize: "0.75rem",
                        color: "var(--brand-orange)",
                        fontWeight: 700,
                        textDecoration: "none",
                    }}
                >
                    ▶ Resume Now
                </Link>
            )}
        </div>
    );
}
