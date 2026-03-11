"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            setToken(params.get("token"));
        }
    }, []);

    const passwordStrength = getPasswordStrength(password);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!token) {
            setError("Invalid or expired reset link. Please request a new one.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: password, token }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data?.message || "Failed to reset password. The link may have expired.");
                setLoading(false);
                return;
            }

            setSuccess(true);
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    }

    if (!token && typeof window !== "undefined") {
        return (
            <div className="text-center">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-[1.75rem] mx-auto mb-6"
                    style={{ background: "rgba(239, 68, 68, 0.15)" }}
                >
                    ⚠️
                </div>
                <h1 className="text-2xl mb-3">Invalid Reset Link</h1>
                <p className="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed mb-8">
                    This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link href="/forgot-password" className="btn-primary w-full flex justify-center">
                    Request New Link
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-[1.75rem] mx-auto mb-6"
                    style={{ background: "rgba(34, 197, 94, 0.15)" }}
                >
                    ✓
                </div>
                <h1 className="text-2xl mb-3">Password Updated</h1>
                <p className="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed mb-8">
                    Your password has been successfully reset. You can now sign in with your new credentials.
                </p>
                <Link href="/login" className="btn-primary w-full flex justify-center">
                    Sign In
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
                    🔒
                </div>
                <h1 className="text-2xl mb-2">Set New Password</h1>
                <p className="text-[0.9rem] text-[var(--text-secondary)]">
                    Choose a strong password for your account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                    <label
                        htmlFor="new-password"
                        className="block text-[0.825rem] font-semibold text-[var(--text-secondary)] mb-2"
                    >
                        New Password
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        className="input-field"
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        autoFocus
                    />
                    {password && (
                        <div className="mt-2 flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className="h-1 flex-1 rounded-full transition-all"
                                    style={{
                                        background: level <= passwordStrength.level
                                            ? passwordStrength.color
                                            : "var(--bg-secondary)",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="confirm-password"
                        className="block text-[0.825rem] font-semibold text-[var(--text-secondary)] mb-2"
                    >
                        Confirm Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        className="input-field"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
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
                    {loading ? "Updating..." : "Update Password"}
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

function getPasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { level: 0, color: "var(--bg-secondary)" },
        { level: 1, color: "#ef4444" },
        { level: 2, color: "#f59e0b" },
        { level: 3, color: "#22c55e" },
        { level: 4, color: "#22c55e" },
    ];

    return levels[score] || levels[0];
}
