"use client";

// =============================================================================
// Program Detail Page — Client Component
// =============================================================================
// Fetches program data client-side to avoid Server Component module-scope
// BetterAuth initialization crash. Passes data to EpisodeLibrary.
// =============================================================================

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ProgramWithModules } from "@cols/services";
import { EpisodeLibrary } from "../../episodes/EpisodeLibrary";

export default function ProgramDetailPage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;

    const [program, setProgram] = useState<ProgramWithModules | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProgram() {
            try {
                const { getProgramBySlugAction } = await import(
                    "@/app/actions/program"
                );
                const data = await getProgramBySlugAction(slug);
                if (data) {
                    // Rehydrate Date fields lost during JSON serialization
                    data.cohortStartDate = data.cohortStartDate
                        ? new Date(data.cohortStartDate)
                        : null;
                }
                setProgram(data);
            } catch (err) {
                console.error("[PROGRAM_DETAIL] Failed to load:", err);
                setError("Failed to load program.");
            } finally {
                setLoading(false);
            }
        }
        loadProgram();
    }, [slug]);

    if (loading) {
        return (
            <div style={{ textAlign: "center", paddingTop: "5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📚</div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    Loading program…
                </p>
            </div>
        );
    }

    if (error || !program) {
        return (
            <div style={{ textAlign: "center", paddingTop: "5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>😕</div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Program not found
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                    {error || "This program doesn't exist or you don't have access."}
                </p>
                <Link
                    href="/programs"
                    style={{
                        padding: "0.5rem 1.5rem",
                        borderRadius: "0.5rem",
                        background: "var(--accent, #e53e3e)",
                        color: "#fff",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}
                >
                    Back to Programs
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <nav style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                <Link href="/programs" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                    Programs
                </Link>
                <span style={{ margin: "0 0.5rem" }}>›</span>
                <span>{program.title}</span>
            </nav>

            <EpisodeLibrary program={program} />
        </div>
    );
}
