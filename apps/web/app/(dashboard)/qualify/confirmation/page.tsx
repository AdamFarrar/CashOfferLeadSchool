"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { FeedbackPrompt } from "@/app/components/FeedbackPrompt";
import { track } from "@cocs/analytics";
import { QualificationConfirmationViewed } from "@cocs/analytics/event-contracts";

export default function ConfirmationPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id || "";
    const { data: activeOrg } = useActiveOrganization();
    const organizationId = activeOrg?.id || "";

    useEffect(() => {
        track(QualificationConfirmationViewed, {});
    }, []);

    return (
        <div
            style={{
                maxWidth: "32rem",
                margin: "2rem auto",
                textAlign: "center",
            }}
        >
            {/* Success icon */}
            <div
                className="animate-fade-in-up"
                style={{
                    width: "5rem",
                    height: "5rem",
                    borderRadius: "50%",
                    background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
                    border: "2px solid rgba(34, 197, 94, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.25rem",
                    margin: "0 auto 2rem",
                }}
            >
                ✓
            </div>

            <h1
                className="animate-fade-in-up animate-delay-100"
                style={{
                    fontSize: "1.75rem",
                    marginBottom: "0.75rem",
                }}
            >
                Qualification Complete!
            </h1>

            <p
                className="animate-fade-in-up animate-delay-200"
                style={{
                    color: "var(--text-secondary)",
                    fontSize: "1rem",
                    lineHeight: 1.6,
                    marginBottom: "2.5rem",
                }}
            >
                Your operator qualification has been submitted. Here&apos;s what
                happens next.
            </p>

            {/* Timeline */}
            <div
                className="glass-card animate-fade-in-up animate-delay-300"
                style={{
                    padding: "2rem",
                    textAlign: "left",
                    marginBottom: "2rem",
                }}
            >
                <h2
                    style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "1.25rem",
                    }}
                >
                    What Happens Next
                </h2>

                {[
                    {
                        icon: "📋",
                        title: "Review",
                        desc: "We'll review your qualification within 24 hours.",
                        status: "In Progress",
                        color: "var(--brand-orange)",
                    },
                    {
                        icon: "🎓",
                        title: "Academy Access",
                        desc: "Once approved, you'll unlock the full learning platform.",
                        status: "Upcoming",
                        color: "var(--text-muted)",
                    },
                    {
                        icon: "🚀",
                        title: "Start Converting",
                        desc: "Apply your training and begin generating cash offers.",
                        status: "Upcoming",
                        color: "var(--text-muted)",
                    },
                ].map((item, i) => (
                    <div
                        key={item.title}
                        style={{
                            display: "flex",
                            gap: "1rem",
                            padding: "0.75rem 0",
                            borderTop:
                                i > 0 ? "1px solid var(--border-subtle)" : "none",
                        }}
                    >
                        <div style={{ fontSize: "1.25rem", flexShrink: 0 }}>
                            {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "0.25rem",
                                }}
                            >
                                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                    {item.title}
                                </span>
                                <span
                                    style={{
                                        fontSize: "0.7rem",
                                        color: item.color,
                                        fontWeight: 600,
                                    }}
                                >
                                    {item.status}
                                </span>
                            </div>
                            <p
                                style={{
                                    fontSize: "0.825rem",
                                    color: "var(--text-secondary)",
                                    lineHeight: 1.5,
                                }}
                            >
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Link
                href="/dashboard"
                className="btn-primary animate-fade-in-up animate-delay-400"
            >
                Go to Dashboard →
            </Link>

            {/* Post-qualification feedback prompt */}
            {userId && (
                <div style={{ textAlign: "left" }}>
                    <FeedbackPrompt
                        stakeholderGroup="pilot_user"
                        context="qualification"
                    />
                </div>
            )}
        </div>
    );
}
