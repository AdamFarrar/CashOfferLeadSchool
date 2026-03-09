"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "@cocs/auth/client";
import { resetIdentity } from "@cocs/analytics";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/qualify", label: "Qualification", icon: "✅" },
    { href: "#", label: "Academy", icon: "🎓", locked: true },
    { href: "#", label: "Coaching", icon: "💬", locked: true },
    { href: "#", label: "Analytics", icon: "📈", locked: true },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        zIndex: 40,
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: "16rem",
                    background: "var(--bg-secondary)",
                    borderRight: "1px solid var(--border-subtle)",
                    padding: "1.5rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 50,
                    transform: sidebarOpen ? "translateX(0)" : undefined,
                    transition: "transform 0.2s ease",
                }}
                className="sidebar-desktop"
            >
                {/* Logo */}
                <Link
                    href="/dashboard"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        textDecoration: "none",
                        color: "var(--text-primary)",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginBottom: "2rem",
                        paddingLeft: "0.5rem",
                    }}
                >
                    <span
                        style={{
                            width: "1.75rem",
                            height: "1.75rem",
                            borderRadius: "0.375rem",
                            background:
                                "linear-gradient(135deg, var(--brand-orange), var(--brand-orange-dark))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                        }}
                    >
                        🏠
                    </span>
                    COCS
                </Link>

                {/* Nav */}
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                    {NAV_ITEMS.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.label}
                                href={item.locked ? "#" : item.href}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.625rem",
                                    padding: "0.625rem 0.75rem",
                                    borderRadius: "var(--radius-md)",
                                    textDecoration: "none",
                                    fontSize: "0.875rem",
                                    fontWeight: active ? 600 : 400,
                                    color: item.locked
                                        ? "var(--text-muted)"
                                        : active
                                            ? "var(--text-primary)"
                                            : "var(--text-secondary)",
                                    background: active
                                        ? "rgba(249, 115, 22, 0.08)"
                                        : "transparent",
                                    cursor: item.locked ? "default" : "pointer",
                                    transition: "background 0.15s",
                                    opacity: item.locked ? 0.5 : 1,
                                }}
                            >
                                <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                                {item.label}
                                {item.locked && (
                                    <span
                                        style={{
                                            marginLeft: "auto",
                                            fontSize: "0.65rem",
                                            padding: "0.1rem 0.4rem",
                                            borderRadius: "var(--radius-full)",
                                            background: "var(--border-subtle)",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        Soon
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div
                    style={{
                        borderTop: "1px solid var(--border-subtle)",
                        paddingTop: "1rem",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.625rem",
                            padding: "0.5rem",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <div
                            style={{
                                width: "2rem",
                                height: "2rem",
                                borderRadius: "50%",
                                background:
                                    "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                            }}
                        >
                            {session?.user?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: "0.825rem",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {session?.user?.name || "User"}
                            </div>
                            <div
                                style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {session?.user?.email || ""}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetIdentity(); signOut(); }}
                        style={{
                            width: "100%",
                            padding: "0.5rem",
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            background: "transparent",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            transition: "border-color 0.15s",
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div
                style={{
                    flex: 1,
                    marginLeft: "16rem",
                    minWidth: 0,
                }}
                className="main-content"
            >
                {/* Top bar (mobile) */}
                <header
                    className="mobile-header"
                    style={{
                        display: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 30,
                        padding: "0.75rem 1rem",
                        background: "rgba(5, 5, 5, 0.9)",
                        backdropFilter: "blur(12px)",
                        borderBottom: "1px solid var(--border-subtle)",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-primary)",
                            fontSize: "1.25rem",
                            cursor: "pointer",
                        }}
                    >
                        ☰
                    </button>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>COCS</span>
                    <div style={{ width: "1.25rem" }} />
                </header>

                <main style={{ padding: "2rem" }}>{children}</main>
            </div>

            {/* Responsive styles */}
            <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop {
            transform: ${sidebarOpen ? "translateX(0)" : "translateX(-100%)"} !important;
          }
          .main-content {
            margin-left: 0 !important;
          }
          .mobile-header {
            display: flex !important;
          }
        }
      `}</style>
        </div>
    );
}
