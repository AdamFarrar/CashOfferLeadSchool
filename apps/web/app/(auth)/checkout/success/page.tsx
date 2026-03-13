"use client";

// =============================================================================
// Checkout Success — Phase 7
// =============================================================================
// Post-payment landing page. Confirms enrollment and offers dashboard CTA.
// Wrapped in Suspense boundary for Next.js 15 static generation compatibility.
// =============================================================================

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getEnrollmentStatusAction } from "@/app/actions/stripe";

function CheckoutSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [status, setStatus] = useState<"checking" | "enrolled" | "pending">("checking");

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;

        async function checkEnrollment() {
            const result = await getEnrollmentStatusAction();
            if (result.enrolled) {
                setStatus("enrolled");
                return;
            }

            attempts++;
            if (attempts < maxAttempts) {
                // Webhook may not have fired yet — retry
                setTimeout(checkEnrollment, 2000);
            } else {
                setStatus("pending");
            }
        }

        checkEnrollment();
    }, [sessionId]);

    return (
        <div style={{
            textAlign: "center",
            maxWidth: "28rem",
            padding: "2rem",
        }}>
            {status === "checking" && (
                <>
                    <div style={{
                        fontSize: "3rem",
                        marginBottom: "1rem",
                        animation: "pulse 2s ease-in-out infinite",
                    }}>
                        ⏳
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                        Confirming your enrollment...
                    </h1>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
                        This usually takes just a few seconds.
                    </p>
                </>
            )}

            {status === "enrolled" && (
                <>
                    <div style={{
                        fontSize: "3rem",
                        marginBottom: "1rem",
                    }}>
                        🎉
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                        Welcome to Cash Offer Lead School!
                    </h1>
                    <p style={{
                        fontSize: "0.9rem",
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: "2rem",
                        lineHeight: 1.7,
                    }}>
                        Your enrollment is confirmed. You now have full access to all 12 episodes,
                        AI insights, discussions, and your personal book audit.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        style={{
                            width: "100%",
                            padding: "0.9rem",
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#fff",
                            background: "linear-gradient(135deg, #E32652 0%, #c91e45 100%)",
                            border: "none",
                            borderRadius: "0.6rem",
                            cursor: "pointer",
                            boxShadow: "0 4px 20px rgba(227, 38, 82, 0.3)",
                        }}
                    >
                        Go to Dashboard →
                    </button>
                </>
            )}

            {status === "pending" && (
                <>
                    <div style={{
                        fontSize: "3rem",
                        marginBottom: "1rem",
                    }}>
                        ✅
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                        Payment Received!
                    </h1>
                    <p style={{
                        fontSize: "0.9rem",
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: "2rem",
                        lineHeight: 1.7,
                    }}>
                        Your payment was successful. Your enrollment is being processed and should be
                        ready momentarily. If you don&apos;t see access within a few minutes, refresh
                        the page or contact support.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        style={{
                            width: "100%",
                            padding: "0.9rem",
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#fff",
                            background: "linear-gradient(135deg, #E32652 0%, #c91e45 100%)",
                            border: "none",
                            borderRadius: "0.6rem",
                            cursor: "pointer",
                            boxShadow: "0 4px 20px rgba(227, 38, 82, 0.3)",
                        }}
                    >
                        Go to Dashboard →
                    </button>
                </>
            )}
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div style={{
            minHeight: "100vh",
            background: "#050505",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', -apple-system, sans-serif",
        }}>
            <Suspense fallback={
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse 2s ease-in-out infinite" }}>⏳</div>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>Loading...</p>
                </div>
            }>
                <CheckoutSuccessContent />
            </Suspense>
        </div>
    );
}
