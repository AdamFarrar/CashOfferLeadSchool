"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { authClient, signOut, useSession } from "@cocs/auth/client";
import { resetIdentity } from "@cocs/analytics";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Home", icon: "🏠" },
    { href: "/episodes", label: "Episodes", icon: "🎬" },
    { href: "/downloads", label: "Downloads", icon: "📥" },
    { href: "/discussion", label: "Discussion", icon: "💬" },
    { href: "/notes", label: "My Notes", icon: "📝" },
    { href: "/audit", label: "Book Audit", icon: "📋" },
];

const ADMIN_NAV_ITEMS = [
    { href: "/admin/email-templates", label: "Email Templates", icon: "📧" },
    { href: "/admin/automation-rules", label: "Automation Rules", icon: "⚡" },
    { href: "/admin/feedback", label: "Feedback", icon: "💬" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState("");

    // Auto-set active org if user has one but hasn't selected it
    useEffect(() => {
        if (!session?.session?.activeOrganizationId && session?.user?.id) {
            authClient.organization.list().then((res) => {
                const orgs = res.data;
                if (orgs && orgs.length > 0) {
                    authClient.organization.setActive({ organizationId: orgs[0].id });
                }
            }).catch(() => { });
        }
    }, [session?.user?.id, session?.session?.activeOrganizationId]);

    // Fetch user role for admin nav
    useEffect(() => {
        if (session?.session?.activeOrganizationId) {
            authClient.organization.getActiveMember().then((res) => {
                setUserRole(res.data?.role || "");
            }).catch(() => { });
        }
    }, [session?.session?.activeOrganizationId]);

    const isAdmin = ["owner", "admin"].includes(userRole);

    return (
        <div className="dashboard-layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 z-40"
                />
            )}

            {/* Sidebar */}
            <aside className="sidebar sidebar-desktop z-50 px-4">
                {/* Logo */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 no-underline text-[color:var(--text-primary)] font-bold text-[0.95rem] mb-8 pl-2"
                >
                    <span className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-orange-dark)] flex items-center justify-center text-xs">
                        🏠
                    </span>
                    COCS
                </Link>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`sidebar-link ${active ? "sidebar-link-active font-semibold" : ""}`}
                            >
                                <span className="text-base">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* Admin section — visible to owner/admin only */}
                    {isAdmin && (
                        <>
                            <div className="mt-3 mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-widest text-[color:var(--text-muted)]">
                                Admin
                            </div>
                            {ADMIN_NAV_ITEMS.map((item) => {
                                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`sidebar-link ${active ? "sidebar-link-active font-semibold" : ""}`}
                                    >
                                        <span className="text-base">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>

                {/* User */}
                <div className="sidebar-footer">
                    <div className="flex items-center gap-2.5 p-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center text-xs font-bold">
                            {session?.user?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[0.825rem] font-semibold truncate">
                                {session?.user?.name || "User"}
                            </div>
                            <div className="text-[0.7rem] text-[color:var(--text-muted)] truncate">
                                {session?.user?.email || ""}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetIdentity(); signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } }); }}
                        className="w-full p-2 text-[0.8rem] text-[color:var(--text-muted)] bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer transition-colors hover:border-[var(--border-hover)]"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="main-content min-w-0">
                {/* Top bar (mobile) */}
                <header className="mobile-header hidden sticky top-0 z-30 py-3 px-4 bg-[rgba(5,5,5,0.9)] backdrop-blur-md border-b border-[var(--border-subtle)] items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="bg-transparent border-none text-[color:var(--text-primary)] text-xl cursor-pointer"
                    >
                        ☰
                    </button>
                    <span className="font-bold text-[0.95rem]">COCS</span>
                    <div className="w-5" />
                </header>

                <main className="p-8">{children}</main>
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
