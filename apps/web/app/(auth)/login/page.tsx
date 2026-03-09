"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@cocs/auth/client";
import { track, identify } from "@cocs/analytics";
import { AuthLoginCompleted } from "@cocs/analytics/event-contracts";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn.email({
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message || "Invalid email or password.");
                setLoading(false);
                return;
            }

            if (result.data?.user?.id) {
                identify(result.data.user.id);
            }
            track(AuthLoginCompleted, { method: "email" });

            router.push(callbackUrl);
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    }

    return (
        <>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    Welcome Back
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Sign in to continue your journey.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                    <label
                        htmlFor="email"
                        style={{
                            display: "block",
                            fontSize: "0.825rem",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="input-field"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>

                <div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <label
                            htmlFor="password"
                            style={{
                                fontSize: "0.825rem",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                            }}
                        >
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            style={{
                                fontSize: "0.75rem",
                                color: "var(--brand-orange)",
                                textDecoration: "none",
                            }}
                        >
                            Forgot?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        className="input-field"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>

                {error && (
                    <div
                        style={{
                            padding: "0.75rem 1rem",
                            borderRadius: "var(--radius-md)",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#ef4444",
                            fontSize: "0.875rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{
                        width: "100%",
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>
            </form>

            <p
                style={{
                    textAlign: "center",
                    marginTop: "1.5rem",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                }}
            >
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    style={{
                        color: "var(--brand-orange)",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}
                >
                    Sign up
                </Link>
            </p>
        </>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
