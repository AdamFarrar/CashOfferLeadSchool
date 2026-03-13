"use client";

// =============================================================================
// AdminSetupChecklist — P2-5: Admin Setup Status
// =============================================================================
// Shows platform configuration status at a glance — what's configured vs
// what needs attention. Queries actual counts from the server.
// =============================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminSetupStatusAction } from "@/app/actions/admin-setup";

interface CheckItem {
    label: string;
    status: "done" | "empty" | "loading";
    detail?: string;
    href: string;
}

export function AdminSetupChecklist() {
    const [items, setItems] = useState<CheckItem[]>([
        { label: "Episodes uploaded", status: "loading", href: "/admin/program" },
        { label: "Download assets", status: "loading", href: "/admin/downloads" },
        { label: "Email templates", status: "loading", href: "/admin/email-templates" },
        { label: "Automation rules", status: "loading", href: "/admin/automation" },
        { label: "AI insights generated", status: "loading", href: "/admin/intelligence" },
        { label: "Live sessions scheduled", status: "loading", href: "/admin/sessions" },
    ]);

    useEffect(() => {
        getAdminSetupStatusAction().then((result) => {
            if (!result.success) return;
            const d = result.data;
            setItems([
                { label: "Episodes uploaded", status: d.episodes > 0 ? "done" : "empty", detail: d.episodes > 0 ? `${d.episodes} episodes` : "No episodes", href: "/admin/program" },
                { label: "Download assets", status: d.assets > 0 ? "done" : "empty", detail: d.assets > 0 ? `${d.assets} files` : "No assets uploaded", href: "/admin/downloads" },
                { label: "Email templates", status: d.emailTemplates > 0 ? "done" : "empty", detail: d.emailTemplates > 0 ? `${d.emailTemplates} templates` : "No templates", href: "/admin/email-templates" },
                { label: "Automation rules", status: d.automationRules > 0 ? "done" : "empty", detail: d.automationRules > 0 ? `${d.automationRules} rules` : "No rules", href: "/admin/automation" },
                { label: "AI insights generated", status: d.aiInsights > 0 ? "done" : "empty", detail: d.aiInsights > 0 ? `${d.aiInsights} insights` : "Not generated", href: "/admin/intelligence" },
                { label: "Live sessions scheduled", status: d.liveSessions > 0 ? "done" : "empty", detail: d.liveSessions > 0 ? `${d.liveSessions} sessions` : "None scheduled", href: "/admin/sessions" },
            ]);
        }).catch(() => {});
    }, []);

    const doneCount = items.filter((i) => i.status === "done").length;
    const allDone = doneCount === items.length;
    const loadingCount = items.filter((i) => i.status === "loading").length;

    return (
        <div style={{
            padding: "1.25rem",
            background: "var(--bg-secondary)",
            border: `1px solid ${allDone ? "rgba(34, 197, 94, 0.3)" : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Platform Setup
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                        {loadingCount > 0 ? "Checking..." : allDone ? "All systems configured ✓" : `${doneCount}/${items.length} configured`}
                    </div>
                </div>
                {!allDone && doneCount > 0 && (
                    <div style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "50%",
                        border: "3px solid var(--border-subtle)",
                        borderTopColor: "var(--brand-orange)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "var(--brand-orange)",
                    }}>
                        {Math.round((doneCount / items.length) * 100)}%
                    </div>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {items.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            padding: "0.4rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            textDecoration: "none",
                            color: "inherit",
                            fontSize: "0.8rem",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <span style={{
                            width: "1.1rem",
                            height: "1.1rem",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.6rem",
                            flexShrink: 0,
                            ...(item.status === "done"
                                ? { background: "rgba(34, 197, 94, 0.15)", color: "var(--accent-green)" }
                                : item.status === "loading"
                                    ? { background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }
                                    : { background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }),
                        }}>
                            {item.status === "done" ? "✓" : item.status === "loading" ? "·" : "!"}
                        </span>
                        <span style={{ flex: 1, color: item.status === "done" ? "var(--text-secondary)" : "var(--text-primary)" }}>
                            {item.label}
                        </span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                            {item.detail ?? ""}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
