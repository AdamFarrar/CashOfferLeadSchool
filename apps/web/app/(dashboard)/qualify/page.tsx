"use client";

// =============================================================================
// /qualify — Redirect to Dashboard (Phase A)
// =============================================================================
// Qualification is now handled via the QualificationModal on the dashboard.
// This page redirects anyone who navigates here directly back to /dashboard.
// =============================================================================

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QualifyRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard");
    }, [router]);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
        }}>
            Redirecting to dashboard...
        </div>
    );
}
