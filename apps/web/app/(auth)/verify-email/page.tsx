"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@cocs/auth/client";
import { track } from "@cocs/analytics";
import { AuthEmailVerificationSent } from "@cocs/analytics/event-contracts";

function VerifyEmailForm() {
    const searchParams = useSearchParams();
    // Prefer sessionStorage (no PII in URL), fallback to query param for compat
    const email = (typeof window !== "undefined" && sessionStorage.getItem("verify_email_address"))
        || searchParams.get("email")
        || "";
    const [resent, setResent] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        track(AuthEmailVerificationSent, {});
    }, []);

    async function handleResend() {
        if (!email || loading) return;
        setLoading(true);
        try {
            await authClient.sendVerificationEmail({
                email,
            });
            setResent(true);
        } catch {
            // Silently fail — don't reveal whether email exists
        }
        setLoading(false);
    }

    return (
        <div style={{ textAlign: "center" }}>
            <div
                style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "50%",
                    background: "var(--brand-orange-glow)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    margin: "0 auto 1.5rem",
                }}
            >
                ✉️
            </div>

            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                Check Your Inbox
            </h1>

            <p
                style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    marginBottom: "0.5rem",
                }}
            >
                We&apos;ve sent a verification link to
            </p>
            {email && (
                <p
                    style={{
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        marginBottom: "2rem",
                    }}
                >
                    {email}
                </p>
            )}

            <p
                style={{
                    color: "var(--text-muted)",
                    fontSize: "0.825rem",
                    lineHeight: 1.6,
                    marginBottom: "2rem",
                }}
            >
                Click the link in the email to verify your account. The link expires in
                24 hours.
            </p>

            {resent ? (
                <div
                    style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.2)",
                        color: "#22c55e",
                        fontSize: "0.875rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    Verification email resent successfully.
                </div>
            ) : (
                <button
                    onClick={handleResend}
                    disabled={loading || !email}
                    className="btn-ghost"
                    style={{
                        width: "100%",
                        marginBottom: "1.5rem",
                        opacity: loading || !email ? 0.5 : 1,
                    }}
                >
                    {loading ? "Sending..." : "Resend Verification Email"}
                </button>
            )}

            <Link
                href="/login"
                style={{
                    color: "var(--text-muted)",
                    fontSize: "0.825rem",
                    textDecoration: "none",
                }}
            >
                Already verified? Log in →
            </Link>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading...</div>
            </div>
        }>
            <VerifyEmailForm />
        </Suspense>
    );
}
