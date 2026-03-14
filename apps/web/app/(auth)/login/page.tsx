"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@cols/auth/client";
import { track, identify } from "@cols/analytics";
import { AuthLoginCompleted } from "@cols/analytics/event-contracts";
import { loginAction } from "@/app/actions/login";
import { TURNSTILE_SITE_KEY } from "@/app/lib/turnstile";

declare global {
    interface Window {
        turnstile?: {
            render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
            reset: (widgetId: string) => void;
        };
    }
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const turnstileRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    // Load Turnstile script
    useEffect(() => {
        const siteKey = TURNSTILE_SITE_KEY;
        if (!siteKey) return;

        if (document.getElementById("turnstile-script")) {
            // Script already loaded (e.g. from register page), just render
            if (turnstileRef.current && window.turnstile && !widgetIdRef.current) {
                widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => setTurnstileToken(token),
                    "expired-callback": () => setTurnstileToken(""),
                    theme: "dark",
                });
            }
            return;
        }

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Server-side rate limit + Turnstile verification
            const serverCheck = await loginAction({ email, password, turnstileToken });
            if (!serverCheck.success) {
                setError(serverCheck.error ?? "Invalid email or password.");
                setLoading(false);
                // Reset Turnstile widget
                if (widgetIdRef.current && window.turnstile) {
                    window.turnstile.reset(widgetIdRef.current);
                    setTurnstileToken("");
                }
                return;
            }

            // Establish client session via BetterAuth
            const result = await signIn.email({
                email,
                password,
            });

            if (result.error) {
                setError("Invalid email or password.");
                setLoading(false);
                return;
            }

            if (result.data?.user?.id) {
                identify(result.data.user.id, {
                    emailVerified: result.data.user.emailVerified ?? undefined,
                });
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
            <div className="text-center mb-8">
                <h1 className="text-2xl mb-2">
                    Welcome Back
                </h1>
                <p className="text-[0.9rem] text-[var(--text-secondary)]">
                    Sign in to continue the program.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                    <div className="flex justify-between items-center mb-2">
                        <label
                            htmlFor="password"
                            className="text-[0.825rem] font-semibold text-[var(--text-secondary)]"
                        >
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs text-[var(--brand-orange)] no-underline"
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
                    {loading ? "Signing In..." : "Sign In"}
                </button>
            </form>

            <p className="text-center mt-6 text-[0.85rem] text-[var(--text-secondary)]">
                Not enrolled yet?{" "}
                <Link
                    href="/register"
                    className="text-[var(--brand-orange)] no-underline font-semibold"
                >
                    Save your seat
                </Link>
            </p>
        </>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="text-center p-8">
                <div className="text-[var(--text-muted)] text-[0.9rem]">Loading...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
