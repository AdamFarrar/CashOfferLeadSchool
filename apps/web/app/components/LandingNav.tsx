"use client";

import Link from "next/link";
import { useState } from "react";

export function LandingNav() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[rgba(5,5,5,0.7)] backdrop-blur-xl">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 font-bold text-lg"
                    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-orange-dark)] flex items-center justify-center text-sm">
                        🏠
                    </span>
                    COCS
                </Link>

                {/* Desktop nav */}
                <div className="hidden sm:flex items-center gap-3">
                    <Link href="/login" className="btn-ghost py-2 px-5 text-sm">
                        Log In
                    </Link>
                    <Link href="/register" className="btn-primary py-2 px-5 text-sm">
                        Save My Seat
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="sm:hidden bg-transparent border-none text-[color:var(--text-primary)] text-xl cursor-pointer p-2"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="sm:hidden border-t border-[var(--border-subtle)] bg-[rgba(5,5,5,0.95)] backdrop-blur-xl px-4 py-4 flex flex-col gap-3">
                    <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="btn-ghost py-2.5 px-4 text-sm text-center"
                    >
                        Log In
                    </Link>
                    <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="btn-primary py-2.5 px-4 text-sm text-center"
                    >
                        Save My Seat
                    </Link>
                </div>
            )}
        </nav>
    );
}
