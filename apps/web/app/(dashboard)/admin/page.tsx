"use client";

import Link from "next/link";
import { ADMIN_NAV_ITEMS } from "@/app/lib/admin-nav";
import { AdminSetupChecklist } from "@/app/components/admin/AdminSetupChecklist";


export default function AdminPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Administration</h1>
                <p className="text-[0.9rem] text-[var(--text-secondary)]">
                    Platform management and configuration.
                </p>
            </div>

            <AdminSetupChecklist />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "16px",
                }}
            >
                {ADMIN_NAV_ITEMS.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="no-underline"
                        style={{
                            display: "block",
                            padding: "24px",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                            transition: "border-color 0.2s, transform 0.15s",
                            cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
                            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        }}
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                                <h3
                                    className="text-[0.95rem] font-semibold"
                                    style={{ color: "var(--text-primary)", margin: 0 }}
                                >
                                    {item.label}
                                </h3>
                            </div>
                        </div>
                        <p
                            className="text-[0.8rem] leading-relaxed"
                            style={{ color: "var(--text-secondary)", margin: 0 }}
                        >
                            {item.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

