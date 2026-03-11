"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await fetch("/api/auth/forget-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, redirectTo: "/reset-password" }),
            });
            setSubmitted(true);
        } catch {
            // Always show success to prevent email enumeration
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="text-center">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-[1.75rem] mx-auto mb-6"
                    style={{ background: "var(--brand-orange-glow)" }}
                >
                    ✉️
                </div>

                <h1 className="text-2xl mb-3">Check Your Email</h1>

                <p className="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed mb-6">
                    If an account exists for <strong className="text-[var(--text-primary)]">{email}</strong>,
                    you will receive a password reset link shortly. Please check your inbox and spam folder.
                </p>

                <p className="text-xs text-[var(--text-muted)] mb-8">
                    The link will expire in 1 hour for security purposes.
                </p>

                <Link href="/login" className="btn-ghost w-full flex">
                    ← Return to Sign In
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-8">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-[1.75rem] mx-auto mb-6"
                    style={{ background: "var(--brand-orange-glow)" }}
                >
                    🔑
                </div>

                <h1 className="text-2xl mb-2">Reset Your Password</h1>

                <p className="text-[0.9rem] text-[var(--text-secondary)]">
                    Enter the email address associated with your account and we&apos;ll send you a secure reset link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                    <label
                        htmlFor="reset-email"
                        className="block text-[0.825rem] font-semibold text-[var(--text-secondary)] mb-2"
                    >
                        Email Address
                    </label>
                    <input
                        id="reset-email"
                        type="email"
                        className="input-field"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        autoFocus
                    />
                </div>

                {error && (
                    <div className="px-4 py-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className={`btn-primary w-full ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <p className="text-center mt-6 text-[0.85rem] text-[var(--text-secondary)]">
                Remember your password?{" "}
                <Link
                    href="/login"
                    className="text-[var(--brand-orange)] no-underline font-semibold"
                >
                    Sign In
                </Link>
            </p>
        </>
    );
}
