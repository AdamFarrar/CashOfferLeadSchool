"use client";

// =============================================================================
// Program Detail Route Error Boundary
// =============================================================================
// Catches render failures in /programs/[slug]. Links back to /programs.
// =============================================================================

import Link from "next/link";

export default function ProgramDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📺</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Couldn&apos;t load this program
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "24rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                We hit an issue loading the program details. Try again
                or browse all programs.
                {error.digest && (
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                        Error ID: {error.digest}
                    </span>
                )}
            </p>
            <button
                onClick={reset}
                style={{ padding: "0.5rem 1.5rem", background: "var(--brand-orange)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
            >
                Try Again
            </button>
            <Link
                href="/programs"
                style={{ display: "block", marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}
            >
                ← Back to Programs
            </Link>
        </div>
    );
}
