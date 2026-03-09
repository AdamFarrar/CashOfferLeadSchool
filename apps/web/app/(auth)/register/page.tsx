"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@cocs/auth/client";
import { track } from "@cocs/analytics";
import { AuthRegistrationStarted, AuthRegistrationCompleted } from "@cocs/analytics/event-contracts";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        track(AuthRegistrationStarted, { method: "email" });
    }, []);

    const passwordStrength = getPasswordStrength(password);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signUp.email({
                name,
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message || "Registration failed. Please try again.");
                setLoading(false);
                return;
            }

            // Hash email for analytics (no PII)
            const emailHash = await crypto.subtle
                .digest("SHA-256", new TextEncoder().encode(email))
                .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join(""));

            track(AuthRegistrationCompleted, { method: "email", email_hash: emailHash });

            // Store email in sessionStorage instead of URL to avoid PII in browser history/logs
            sessionStorage.setItem("verify_email_address", email);
            router.push("/verify-email");
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    }

    return (
        <>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    Create Your Account
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Start your qualification journey today.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                    <label
                        htmlFor="name"
                        style={{
                            display: "block",
                            fontSize: "0.825rem",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="input-field"
                        placeholder="John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                    />
                </div>

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
                    <label
                        htmlFor="password"
                        style={{
                            display: "block",
                            fontSize: "0.825rem",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="input-field"
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                    />
                    {password.length > 0 && (
                        <div style={{ marginTop: "0.5rem" }}>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.25rem",
                                    marginBottom: "0.25rem",
                                }}
                            >
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        style={{
                                            flex: 1,
                                            height: "3px",
                                            borderRadius: "2px",
                                            background:
                                                level <= passwordStrength.level
                                                    ? passwordStrength.color
                                                    : "var(--border-default)",
                                            transition: "background 0.2s",
                                        }}
                                    />
                                ))}
                            </div>
                            <span
                                style={{
                                    fontSize: "0.7rem",
                                    color: passwordStrength.color,
                                }}
                            >
                                {passwordStrength.label}
                            </span>
                        </div>
                    )}
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
                    {loading ? "Creating Account..." : "Create Account"}
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
                Already have an account?{" "}
                <Link
                    href="/login"
                    style={{
                        color: "var(--brand-orange)",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}
                >
                    Log in
                </Link>
            </p>
        </>
    );
}

function getPasswordStrength(password: string) {
    if (password.length === 0) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
    if (score <= 2) return { level: 2, label: "Fair", color: "#f59e0b" };
    if (score <= 3) return { level: 3, label: "Good", color: "#3b82f6" };
    return { level: 4, label: "Strong", color: "#22c55e" };
}
