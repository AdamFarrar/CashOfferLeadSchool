"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resendVerificationEmail } from "@/app/actions/resend-verification";
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
            await resendVerificationEmail(email);
            setResent(true);
        } catch {
            // Silently fail — don't reveal whether email exists
        }
        setLoading(false);
    }

    return (
        <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-[1.75rem] mx-auto mb-6" style={{ background: "var(--brand-orange-glow)" }}>
                ✉️
            </div>

            <h1 className="text-2xl mb-3">
                Check Your Inbox
            </h1>

            <p className="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed mb-2">
                We&apos;ve sent a verification link to
            </p>
            {email && (
                <p className="font-semibold text-[0.95rem] mb-8">
                    {email}
                </p>
            )}

            <p className="text-[0.825rem] text-[var(--text-muted)] leading-relaxed mb-8">
                Click the link in the email to verify your account. The link expires in
                24 hours.
            </p>

            {resent ? (
                <div className="px-4 py-3 rounded-[var(--radius-md)] bg-green-500/10 border border-green-500/20 text-green-500 text-sm mb-6">
                    Verification email resent successfully.
                </div>
            ) : (
                <button
                    onClick={handleResend}
                    disabled={loading || !email}
                    className={`btn-ghost w-full mb-6 ${loading || !email ? "opacity-50" : ""}`}
                >
                    {loading ? "Sending..." : "Resend Verification Email"}
                </button>
            )}

            <Link
                href="/login"
                className="text-[0.825rem] text-[var(--text-muted)] no-underline"
            >
                Already verified? Log in →
            </Link>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="text-center p-8">
                <div className="text-[var(--text-muted)] text-[0.9rem]">Loading...</div>
            </div>
        }>
            <VerifyEmailForm />
        </Suspense>
    );
}
