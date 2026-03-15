"use client";

// =============================================================================
// Programs Page — Client Component
// =============================================================================
// Uses client-side data fetching to avoid module-scope BetterAuth init crash
// that occurs when Server Components import @cols/auth/server.
// The dashboard, sessions, and other working pages use the same pattern.
// =============================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProgramSummary } from "@cols/services";

export default function ProgramsPage() {
    const [programs, setPrograms] = useState<ProgramSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPrograms() {
            try {
                const { getUserProgramsAction } = await import(
                    "@/app/actions/program"
                );
                const data = await getUserProgramsAction();
                setPrograms(data);
            } catch (err) {
                console.error("[PROGRAMS] Failed to load:", err);
                setError("Failed to load programs. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        loadPrograms();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: "center", paddingTop: "5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📚</div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    Loading programs…
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: "center", paddingTop: "5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Something went wrong
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                    {error}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: "0.5rem 1.5rem",
                        borderRadius: "0.5rem",
                        background: "var(--accent, #e53e3e)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (programs.length === 0) {
        return (
            <div style={{ textAlign: "center", paddingTop: "5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📚</div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    No Programs Available
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    Your cohort programs will appear here once they&apos;re available.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                Your Programs
            </h1>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem",
            }}>
                {programs.map((prog) => (
                    <Link
                        key={prog.id}
                        href={`/programs/${prog.slug ?? prog.id}`}
                        style={{
                            display: "block",
                            background: "var(--surface, #1a1a2e)",
                            borderRadius: "0.75rem",
                            padding: "1.25rem",
                            textDecoration: "none",
                            color: "inherit",
                            border: "1px solid var(--border, #2a2a3e)",
                            transition: "border-color 0.2s, transform 0.2s",
                        }}
                    >
                        {prog.previewImageUrl && (
                            <img
                                src={prog.previewImageUrl}
                                alt={prog.title}
                                style={{
                                    width: "100%",
                                    borderRadius: "0.5rem",
                                    marginBottom: "0.75rem",
                                    objectFit: "cover",
                                    maxHeight: "180px",
                                }}
                            />
                        )}
                        <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>
                            {prog.title}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                            {prog.totalModules} modules · {prog.totalEpisodes} episodes
                        </div>
                        <div style={{
                            height: "4px",
                            borderRadius: "2px",
                            background: "var(--border, #2a2a3e)",
                            overflow: "hidden",
                        }}>
                            <div style={{
                                height: "100%",
                                borderRadius: "2px",
                                background: "var(--accent, #e53e3e)",
                                width: `${prog.progressPercent}%`,
                                transition: "width 0.3s ease",
                            }} />
                        </div>
                        <div style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: "0.5rem",
                        }}>
                            {prog.progressPercent}% complete
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
