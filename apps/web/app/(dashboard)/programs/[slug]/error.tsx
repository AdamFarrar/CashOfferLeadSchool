"use client";

// =============================================================================
// Program Detail Route Error Boundary
// =============================================================================
// Catches render failures in /programs/[slug]. Links back to /programs.
// =============================================================================

import Link from "next/link";
import styles from "../../error.module.css";

export default function ProgramDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.icon}>📺</div>
            <h1 className={styles.heading}>
                Couldn&apos;t load this program
            </h1>
            <p className={styles.message}>
                We hit an issue loading the program details. Try again
                or browse all programs.
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
                href="/programs"
                style={{
                    display: "block",
                    marginTop: "1rem",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                }}
            >
                ← Back to Programs
            </Link>
        </div>
    );
}
