"use client";

// =============================================================================
// DownloadsListClient — Phase H P3 Enhancement
// =============================================================================
// Client-side wrapper for downloads list with module filtering.
// =============================================================================

import { useState, useMemo } from "react";
import { EmptyState } from "@/app/components/ui/EmptyState";

interface Asset {
    id: string;
    title: string;
    fileUrl: string;
    fileType: string | null;
    episodeTitle: string;
    moduleTitle: string;
}

export function DownloadsListClient({ assets }: { assets: Asset[] }) {
    const [activeModule, setActiveModule] = useState<string>("all");

    const modules = useMemo(() => {
        const set = new Set(assets.map((a) => a.moduleTitle));
        return Array.from(set).sort();
    }, [assets]);

    const filtered = activeModule === "all"
        ? assets
        : assets.filter((a) => a.moduleTitle === activeModule);

    if (assets.length === 0) {
        return (
            <EmptyState
                icon="📥"
                title="Materials Are On the Way"
                description="Downloadable scripts, checklists, templates, and SOPs will appear here as your program team releases materials for each episode. Check back after completing your next episode."
                cta={{ label: "Browse Episodes", href: "/episodes" }}
            />
        );
    }

    return (
        <>
            {/* Module filter pills */}
            {modules.length > 1 && (
                <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                }}>
                    <button
                        onClick={() => setActiveModule("all")}
                        style={{
                            padding: "0.3rem 0.75rem",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            border: "1px solid",
                            borderColor: activeModule === "all" ? "var(--brand-orange)" : "var(--border-subtle)",
                            background: activeModule === "all" ? "var(--brand-orange-glow)" : "transparent",
                            color: activeModule === "all" ? "var(--brand-orange)" : "var(--text-muted)",
                            cursor: "pointer",
                        }}
                    >
                        All ({assets.length})
                    </button>
                    {modules.map((mod) => {
                        const count = assets.filter((a) => a.moduleTitle === mod).length;
                        const isActive = activeModule === mod;
                        return (
                            <button
                                key={mod}
                                onClick={() => setActiveModule(mod)}
                                style={{
                                    padding: "0.3rem 0.75rem",
                                    borderRadius: "999px",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    border: "1px solid",
                                    borderColor: isActive ? "var(--brand-orange)" : "var(--border-subtle)",
                                    background: isActive ? "var(--brand-orange-glow)" : "transparent",
                                    color: isActive ? "var(--brand-orange)" : "var(--text-muted)",
                                    cursor: "pointer",
                                }}
                            >
                                {mod} ({count})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Asset grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1rem",
            }}>
                {filtered.map((asset) => (
                    <a
                        key={asset.id}
                        href={asset.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "1rem 1.25rem",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                            textDecoration: "none",
                            color: "inherit",
                            transition: "border-color 0.2s ease",
                        }}
                    >
                        <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>📄</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                                {asset.title}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {asset.episodeTitle} · {asset.moduleTitle}
                            </div>
                        </div>
                        <span style={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            color: "var(--brand-orange)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            flexShrink: 0,
                        }}>
                            {asset.fileType ?? "PDF"}
                        </span>
                    </a>
                ))}
            </div>
        </>
    );
}
