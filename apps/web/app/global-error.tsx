"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "1rem",
                        padding: "2rem",
                        background: "#0a0a0a",
                        color: "#ededed",
                        fontFamily: "Inter, system-ui, sans-serif",
                    }}
                >
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                        Something went wrong
                    </h2>
                    <p style={{ color: "#a1a1a1" }}>
                        An unexpected error occurred. Our team has been notified.
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            padding: "0.75rem 1.5rem",
                            borderRadius: "0.5rem",
                            background: "linear-gradient(135deg, #f97316, #ea580c)",
                            color: "#fff",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
