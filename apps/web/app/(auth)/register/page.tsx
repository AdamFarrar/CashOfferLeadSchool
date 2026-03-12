"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@cocs/analytics";
import { AuthRegistrationStarted, AuthRegistrationCompleted } from "@cocs/analytics/event-contracts";
import { registerAction } from "@/app/actions/register";

declare global {
    interface Window {
        turnstile?: {
            render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
            reset: (widgetId: string) => void;
        };
    }
}

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const turnstileRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        track(AuthRegistrationStarted, { method: "email" });
    }, []);

    // Load Turnstile script
    useEffect(() => {
        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        if (!siteKey) return;

        if (document.getElementById("turnstile-script")) return;

        const script = document.createElement("script");
        script.id = "turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
        script.async = true;
        script.defer = true;

        (window as unknown as Record<string, unknown>).onTurnstileLoad = () => {
            if (turnstileRef.current && window.turnstile) {
                widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => setTurnstileToken(token),
                    "expired-callback": () => setTurnstileToken(""),
                    theme: "dark",
                });
            }
        };

        document.head.appendChild(script);
    }, []);

    const passwordStrength = getPasswordStrength(password);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await registerAction({
                name,
                email,
                password,
                turnstileToken,
            });

            if (!result.success) {
                setError(result.message);
                setLoading(false);
                // Reset Turnstile widget
                if (widgetIdRef.current && window.turnstile) {
                    window.turnstile.reset(widgetIdRef.current);
                    setTurnstileToken("");
                }
                return;
            }

            // Hash email for analytics (no PII)
            const emailHash = await crypto.subtle
                .digest("SHA-256", new TextEncoder().encode(email))
                .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join(""));

            track(AuthRegistrationCompleted, { method: "email", email_hash: emailHash });

            sessionStorage.setItem("verify_email_address", email);
            router.push("/verify-email");
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    }

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-2xl mb-2">
                    Save My Seat
                </h1>
                <p className="text-[0.9rem] text-[var(--text-secondary)]">
                    Join Season 1 of the Cash Offer Conversion School.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-[0.825rem] font-semibold text-[var(--text-secondary)] mb-2"
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
                        className="block text-[0.825rem] font-semibold text-[var(--text-secondary)] mb-2"
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
                        className="block text-[0.825rem] font-semibold text-[var(--text-secondary)] mb-2"
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
                        <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className="flex-1 h-[3px] rounded-sm transition-colors duration-200"
                                        style={{
                                            background:
                                                level <= passwordStrength.level
                                                    ? passwordStrength.color
                                                    : "var(--border-default)",
                                        }}
                                    />
                                ))}
                            </div>
                            <span
                                className="text-[0.7rem]"
                                style={{ color: passwordStrength.color }}
                            >
                                {passwordStrength.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Turnstile CAPTCHA widget */}
                <div ref={turnstileRef} />

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
                    {loading ? "Reserving your seat..." : "Save My Seat"}
                </button>
            </form>

            <p className="text-center mt-6 text-[0.85rem] text-[var(--text-secondary)]">
                Already enrolled?{" "}
                <Link
                    href="/login"
                    className="text-[var(--brand-orange)] no-underline font-semibold"
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
