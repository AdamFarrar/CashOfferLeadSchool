"use client";

import Link from "next/link";

const ADMIN_SECTIONS = [
    {
        href: "/admin/email-templates",
        icon: "📧",
        title: "Email Templates",
        description: "Manage verification, password reset, and welcome email templates. Customize branding, content, and publish changes.",
        status: "Active",
    },
    {
        href: "/admin/automation-rules",
        icon: "⚡",
        title: "Automation Rules",
        description: "Configure event-driven automation. Control which emails send on registration, verification, and password reset.",
        status: "Active",
    },
    {
        href: "/admin/feedback",
        icon: "💬",
        title: "Feedback",
        description: "Review user-submitted feedback and NPS responses.",
        status: "Active",
    },
    {
        href: "#",
        icon: "👥",
        title: "User Management",
        description: "View and manage enrolled users, roles, and organization memberships.",
        status: "Coming Soon",
    },
    {
        href: "#",
        icon: "📊",
        title: "Analytics",
        description: "Platform-wide engagement metrics, conversion funnels, and cohort analysis.",
        status: "Coming Soon",
    },
    {
        href: "#",
        icon: "🎓",
        title: "Course Management",
        description: "Manage episodes, modules, downloads, and program content.",
        status: "Coming Soon",
    },
];

export default function AdminPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Administration</h1>
                <p className="text-[0.9rem] text-[var(--text-secondary)]">
                    Platform management and configuration.
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "16px",
                }}
            >
                {ADMIN_SECTIONS.map((section) => {
                    const isComingSoon = section.status === "Coming Soon";
                    const Card = isComingSoon ? "div" : Link;

                    return (
                        <Card
                            key={section.title}
                            href={isComingSoon ? undefined as any : section.href}
                            className="no-underline"
                            style={{
                                display: "block",
                                padding: "24px",
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                transition: "border-color 0.2s, transform 0.15s",
                                cursor: isComingSoon ? "default" : "pointer",
                                opacity: isComingSoon ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (!isComingSoon) {
                                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
                                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                            }}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <span className="text-2xl">{section.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3
                                            className="text-[0.95rem] font-semibold"
                                            style={{ color: "var(--text-primary)", margin: 0 }}
                                        >
                                            {section.title}
                                        </h3>
                                        {isComingSoon && (
                                            <span
                                                style={{
                                                    fontSize: "0.65rem",
                                                    fontWeight: 600,
                                                    padding: "2px 8px",
                                                    borderRadius: "999px",
                                                    background: "rgba(255,255,255,0.06)",
                                                    color: "var(--text-muted)",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px",
                                                }}
                                            >
                                                Soon
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p
                                className="text-[0.8rem] leading-relaxed"
                                style={{ color: "var(--text-secondary)", margin: 0 }}
                            >
                                {section.description}
                            </p>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
