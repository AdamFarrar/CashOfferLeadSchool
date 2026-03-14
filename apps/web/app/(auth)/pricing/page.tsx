"use client";

// =============================================================================
// Pricing Page — Phase 7
// =============================================================================
// Premium sales page for the Cash Offer Lead School program.
// Calls createCheckoutSessionAction → redirects to Stripe Checkout.
// =============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@cols/auth/client";
import { createCheckoutSessionAction, getEnrollmentStatusAction } from "@/app/actions/stripe";

const FEATURES = [
    { icon: "🎬", text: "12 Expert Video Episodes" },
    { icon: "📋", text: "Downloadable Scripts & Checklists" },
    { icon: "🤖", text: "AI-Powered Insights & Chat" },
    { icon: "💬", text: "Private Discussion Community" },
    { icon: "📝", text: "Personal Note-Taking System" },
    { icon: "📊", text: "1-on-1 Book Audit Session" },
    { icon: "🔒", text: "Lifetime Access" },
    { icon: "⚡", text: "Weekly Cohort Insights" },
];

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // Check if already enrolled
    useEffect(() => {
        if (session?.user?.id) {
            getEnrollmentStatusAction().then((result) => {
                if (result.enrolled) {
                    router.push("/dashboard");
                }
                setChecking(false);
            });
        } else {
            setChecking(false);
        }
    }, [session?.user?.id, router]);

    async function handleEnroll() {
        if (!session?.user?.id) {
            router.push("/login?callbackUrl=/pricing");
            return;
        }

        setLoading(true);
        const result = await createCheckoutSessionAction();

        if (result.success && result.url) {
            window.location.href = result.url;
        } else if (result.enrolled) {
            router.push("/dashboard");
        } else {
            setLoading(false);
            alert(result.error || "Something went wrong. Please try again.");
        }
    }

    if (checking) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#050505",
                color: "#fff",
            }}>
                <div style={{ fontSize: "1rem", opacity: 0.5 }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#050505",
            color: "#fff",
            fontFamily: "'Inter', -apple-system, sans-serif",
        }}>
            {/* Hero */}
            <div style={{
                textAlign: "center",
                padding: "5rem 1.5rem 3rem",
                maxWidth: "50rem",
                margin: "0 auto",
            }}>
                <div style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#E32652",
                    marginBottom: "1rem",
                }}>
                    Cash Offer Lead School
                </div>
                <h1 style={{
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: "1.5rem",
                    background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>
                    Master the Cash Offer Game
                </h1>
                <p style={{
                    fontSize: "1.1rem",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.6)",
                    maxWidth: "36rem",
                    margin: "0 auto",
                }}>
                    The complete system for converting leads into cash offer deals.
                    12 episodes of battle-tested strategies, AI-powered insights,
                    and a personal book audit.
                </p>
            </div>

            {/* Pricing Card */}
            <div style={{
                maxWidth: "28rem",
                margin: "0 auto 4rem",
                padding: "0 1.5rem",
            }}>
                <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(227, 38, 82, 0.2)",
                    borderRadius: "1rem",
                    padding: "2.5rem",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Glow */}
                    <div style={{
                        position: "absolute",
                        top: "-50%",
                        left: "-50%",
                        width: "200%",
                        height: "200%",
                        background: "radial-gradient(circle at 50% 50%, rgba(227,38,82,0.06) 0%, transparent 60%)",
                        pointerEvents: "none",
                    }} />

                    <div style={{ position: "relative" }}>
                        {/* Badge */}
                        <div style={{
                            display: "inline-block",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            background: "rgba(227, 38, 82, 0.12)",
                            color: "#E32652",
                            padding: "0.3rem 0.75rem",
                            borderRadius: "2rem",
                            marginBottom: "1.5rem",
                        }}>
                            Full Access
                        </div>

                        {/* Price */}
                        <div style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "0.25rem",
                            marginBottom: "0.5rem",
                        }}>
                            <span style={{ fontSize: "3rem", fontWeight: 800 }}>$997</span>
                            <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" }}>one-time</span>
                        </div>
                        <p style={{
                            fontSize: "0.8rem",
                            color: "rgba(255,255,255,0.4)",
                            marginBottom: "2rem",
                        }}>
                            Lifetime access. No recurring fees.
                        </p>

                        {/* CTA */}
                        <button
                            onClick={handleEnroll}
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "0.9rem",
                                fontSize: "1rem",
                                fontWeight: 700,
                                color: "#fff",
                                background: loading
                                    ? "rgba(227, 38, 82, 0.5)"
                                    : "linear-gradient(135deg, #E32652 0%, #c91e45 100%)",
                                border: "none",
                                borderRadius: "0.6rem",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: loading ? "none" : "0 4px 20px rgba(227, 38, 82, 0.3)",
                                marginBottom: "2rem",
                            }}
                        >
                            {loading ? "Redirecting to checkout..." : "Enroll Now"}
                        </button>

                        {/* Features */}
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                        }}>
                            {FEATURES.map((f, i) => (
                                <div key={i} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    fontSize: "0.85rem",
                                    color: "rgba(255,255,255,0.7)",
                                }}>
                                    <span>{f.icon}</span>
                                    <span>{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trust signals */}
                <div style={{
                    textAlign: "center",
                    marginTop: "1.5rem",
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.3)",
                }}>
                    🔒 Secure payment powered by Stripe · 30-day money-back guarantee
                </div>
            </div>
        </div>
    );
}
