"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession, useActiveOrganization } from "@cols/auth/client";
import { FeedbackPrompt } from "@/app/components/FeedbackPrompt";
import { track } from "@cols/analytics";
import { QualificationConfirmationViewed } from "@cols/analytics/event-contracts";

export default function ConfirmationPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id || "";
    const { data: activeOrg } = useActiveOrganization();
    const organizationId = activeOrg?.id || "";

    useEffect(() => {
        track(QualificationConfirmationViewed, {});
    }, []);

    return (
        <div className="max-w-lg mx-auto mt-8 text-center">
            {/* Success icon */}
            <div
                className="animate-fade-in-up w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 border-2 border-green-500/30"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
                }}
            >
                ✓
            </div>

            <h1 className="animate-fade-in-up animate-delay-100 text-[1.75rem] mb-3">
                You&apos;re In
            </h1>

            <p className="animate-fade-in-up animate-delay-200 text-[var(--text-secondary)] text-base leading-relaxed mb-10">
                Your seat for Season 1 is confirmed. Here&apos;s what happens next.
            </p>

            {/* Timeline */}
            <div className="glass-card animate-fade-in-up animate-delay-300 p-8 text-left mb-8">
                <h2 className="text-[0.8rem] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-5">
                    What Happens Next
                </h2>

                {[
                    {
                        icon: "📋",
                        title: "Tailoring Your Experience",
                        desc: "We're personalizing your program based on your answers.",
                        status: "In Progress",
                        color: "var(--brand-orange)",
                    },
                    {
                        icon: "📧",
                        title: "Welcome Email",
                        desc: "You'll receive your Season 1 welcome kit within 24 hours.",
                        status: "Upcoming",
                        color: "var(--text-muted)",
                    },
                    {
                        icon: "🚀",
                        title: "Season 1 Begins",
                        desc: "Explore your program console and get ready for Week 1.",
                        status: "Upcoming",
                        color: "var(--text-muted)",
                    },
                ].map((item, i) => (
                    <div
                        key={item.title}
                        className={`flex gap-4 py-3 ${i > 0 ? "border-t border-[var(--border-subtle)]" : ""}`}
                    >
                        <div className="text-xl shrink-0">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-[0.9rem]">
                                    {item.title}
                                </span>
                                {/* Dynamic status color from data array */}
                                <span
                                    className="text-[0.7rem] font-semibold"
                                    style={{ color: item.color }}
                                >
                                    {item.status}
                                </span>
                            </div>
                            <p className="text-[0.825rem] text-[var(--text-secondary)] leading-normal">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Link
                href="/dashboard"
                className="btn-primary animate-fade-in-up animate-delay-400"
            >
                Go to Your Program Console →
            </Link>

            {/* Post-qualification feedback prompt */}
            {userId && (
                <div className="text-left">
                    <FeedbackPrompt
                        stakeholderGroup="pilot_user"
                        context="qualification"
                    />
                </div>
            )}
        </div>
    );
}
