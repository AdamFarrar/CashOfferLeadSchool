"use client";

// =============================================================================
// Programs Route Error Boundary
// =============================================================================
// Catches render failures in /programs. Shows contextual recovery UI
// with link to Dashboard. Defense-in-depth behind action-level try/catch.
// =============================================================================

import Link from "next/link";
import styles from "../error.module.css";

export default function ProgramsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.icon}>📚</div>
            <h1 className={styles.heading}>
                Couldn&apos;t load programs
            </h1>
            <p className={styles.message}>
                We hit an issue loading your programs. This is
                usually temporary — try again or head back to the dashboard.
                {error.digest && (
                    <span className={styles.digest}>
                        Error ID: {error.digest}
                    </span>
                )}
            </p>
            <button onClick={reset} className={styles.retryBtn}>
                Try Again
            </button>
            <Link
                href="/dashboard"
                style={{
                    display: "block",
                    marginTop: "1rem",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                }}
            >
                ← Back to Dashboard
            </Link>
        </div>
    );
}
