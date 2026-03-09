"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { FeedbackWidget } from "@/app/components/FeedbackWidget";
import { track, identify } from "@cocs/analytics";
import { DashboardFirstViewed } from "@cocs/analytics/event-contracts";
import { getQualificationStatus } from "@/app/actions/qualification";

export default function DashboardPage() {
    const { data: session } = useSession();
    const firstName = session?.user?.name?.split(" ")[0] || "there";
    const userId = session?.user?.id || "";
    const { data: activeOrg } = useActiveOrganization();
    const organizationId = activeOrg?.id || "";
    const [qualCompleted, setQualCompleted] = useState(false);

    useEffect(() => {
        if (userId) {
            identify(userId);
            getQualificationStatus().then((status) => {
                if (status?.submittedAt) setQualCompleted(true);
            }).catch(() => { });
        }
        const key = "cocs_dashboard_first_viewed";
        if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
            track(DashboardFirstViewed, { qualification_completed: false });
            sessionStorage.setItem(key, "1");
        }
    }, [userId]);

    return (
        <div>
            {/* Welcome header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
                    Welcome back, {firstName} 👋
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    Here&apos;s what&apos;s happening in your qualification journey.
                </p>
            </div>

            {/* Status cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
                    gap: "1.25rem",
                    marginBottom: "2.5rem",
                }}
            >
                {/* Qualification card */}
                <Link
                    href="/qualify"
                    className="glass-card"
                    style={{
                        padding: "1.5rem",
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <div
                            style={{
                                width: "2.5rem",
                                height: "2.5rem",
                                borderRadius: "var(--radius-md)",
                                background: qualCompleted ? "rgba(34, 197, 94, 0.1)" : "var(--brand-orange-glow)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.125rem",
                            }}
                        >
                            {qualCompleted ? "✅" : "📋"}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                Qualification
                            </div>
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: qualCompleted ? "#22c55e" : "var(--brand-orange)",
                                    fontWeight: 600,
                                }}
                            >
                                {qualCompleted ? "Completed" : "Action Required"}
                            </div>
                        </div>
                    </div>
                    <p
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                        }}
                    >
                        {qualCompleted
                            ? "Your operator qualification is complete. You can review or update it anytime."
                            : "Complete your operator qualification to unlock the full platform."}
                    </p>
                </Link>

                {/* Academy card */}
                <div className="glass-card" style={{ padding: "1.5rem", opacity: 0.5 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <div
                            style={{
                                width: "2.5rem",
                                height: "2.5rem",
                                borderRadius: "var(--radius-md)",
                                background: "rgba(59, 130, 246, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.125rem",
                            }}
                        >
                            🎓
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                Academy
                            </div>
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Coming in Phase 2
                            </div>
                        </div>
                    </div>
                    <p
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            lineHeight: 1.5,
                        }}
                    >
                        Video courses, downloads, and structured learning paths.
                    </p>
                </div>

                {/* Coaching card */}
                <div className="glass-card" style={{ padding: "1.5rem", opacity: 0.5 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <div
                            style={{
                                width: "2.5rem",
                                height: "2.5rem",
                                borderRadius: "var(--radius-md)",
                                background: "rgba(139, 92, 246, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.125rem",
                            }}
                        >
                            💬
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                Coaching
                            </div>
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Coming in Phase 5
                            </div>
                        </div>
                    </div>
                    <p
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            lineHeight: 1.5,
                        }}
                    >
                        1-on-1 coaching, live sessions, and expert guidance.
                    </p>
                </div>
            </div>

            {/* Quick info */}
            <div
                className="glass-card"
                style={{
                    padding: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.25rem",
                }}
            >
                <div
                    style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "50%",
                        background: "rgba(34, 197, 94, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        flexShrink: 0,
                    }}
                >
                    💡
                </div>
                <div>
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            marginBottom: "0.25rem",
                        }}
                    >
                        Getting Started
                    </div>
                    <p
                        style={{
                            fontSize: "0.825rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                        }}
                    >
                        Start by completing your{" "}
                        <Link
                            href="/qualify"
                            style={{ color: "var(--brand-orange)", textDecoration: "none" }}
                        >
                            qualification form
                        </Link>
                        . This helps us tailor your learning path and match you with the right resources.
                    </p>
                </div>
            </div>

            {/* Feedback widget */}
            {userId && (
                <FeedbackWidget
                    stakeholderGroup="pilot_user"
                />
            )}
        </div>
    );
}
