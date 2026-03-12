"use client";

// =============================================================================
// Dashboard Error Boundary (F10)
// =============================================================================
// Shows a branded error page instead of Next.js default for uncaught errors
// in any route within the (dashboard) group.
// =============================================================================

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            textAlign: "center",
            padding: "2rem",
        }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Something went wrong
            </h1>
            <p style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                maxWidth: "24rem",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
            }}>
                We hit an unexpected error loading this page.
                {error.digest && (
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                        Error ID: {error.digest}
                    </span>
                )}
            </p>
            <button
                onClick={reset}
                style={{
                    padding: "0.5rem 1.5rem",
                    background: "var(--brand-orange)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                Try Again
            </button>
        </div>
    );
}
