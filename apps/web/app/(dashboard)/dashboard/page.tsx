"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { FeedbackWidget } from "@/app/components/FeedbackWidget";
import { track, identify } from "@cocs/analytics";
import { DashboardFirstViewed } from "@cocs/analytics/event-contracts";
import { getQualificationStatus } from "@/app/actions/qualification";

export default function DashboardPage() {
    const { data: session } = useSession();
    const firstName = session?.user?.name?.split(" ")[0] || "there";
    const userId = session?.user?.id || "";
    const { data: activeOrg } = useActiveOrganization();
    const organizationId = activeOrg?.id || "";
    const [qualCompleted, setQualCompleted] = useState(false);

    useEffect(() => {
        if (userId) {
            identify(userId, { organizationId: organizationId || undefined });
            getQualificationStatus().then((status) => {
                const completed = !!status?.submittedAt;
                if (completed) setQualCompleted(true);
                const key = "cocs_dashboard_first_viewed";
                if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
                    track(DashboardFirstViewed, { qualification_completed: completed });
                    sessionStorage.setItem(key, "1");
                }
            }).catch(() => {
                const key = "cocs_dashboard_first_viewed";
                if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
                    track(DashboardFirstViewed, { qualification_completed: false });
                    sessionStorage.setItem(key, "1");
                }
            });
        }
    }, [userId, organizationId]);

    return (
        <div>
            {/* Welcome header */}
            <div className="mb-8">
                <h1 className="text-[1.75rem] mb-2">
                    Welcome back, {firstName} 👋
                </h1>
                <p className="text-[color:var(--text-secondary)] text-[0.95rem]">
                    Here&apos;s what&apos;s happening in your qualification journey.
                </p>
            </div>

            {/* Status cards */}
            <div className="dashboard-grid mb-10">
                {/* Qualification card */}
                <Link
                    href="/qualify"
                    className="glass-card p-6 no-underline text-inherit"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-lg"
                            style={{ background: qualCompleted ? "rgba(34, 197, 94, 0.1)" : "var(--brand-orange-glow)" }}
                        >
                            {qualCompleted ? "✅" : "📋"}
                        </div>
                        <div>
                            <div className="font-semibold text-[0.95rem]">Qualification</div>
                            <div className={`text-xs font-semibold ${qualCompleted ? "text-[#22c55e]" : "text-[color:var(--brand-orange)]"}`}>
                                {qualCompleted ? "Completed" : "Action Required"}
                            </div>
                        </div>
                    </div>
                    <p className="text-[0.85rem] text-[color:var(--text-secondary)] leading-normal">
                        {qualCompleted
                            ? "Your operator qualification is complete. You can review or update it anytime."
                            : "Complete your operator qualification to unlock the full platform."}
                    </p>
                </Link>

                {/* Academy card */}
                <div className="phase-card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[rgba(59,130,246,0.1)] flex items-center justify-center text-lg">
                            🎓
                        </div>
                        <div>
                            <div className="font-semibold text-[0.95rem]">Academy</div>
                            <div className="text-xs text-[color:var(--text-muted)]">Coming in Phase 2</div>
                        </div>
                    </div>
                    <p className="text-[0.85rem] text-[color:var(--text-muted)] leading-normal">
                        Video courses, downloads, and structured learning paths.
                    </p>
                </div>

                {/* Coaching card */}
                <div className="phase-card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[rgba(139,92,246,0.1)] flex items-center justify-center text-lg">
                            💬
                        </div>
                        <div>
                            <div className="font-semibold text-[0.95rem]">Coaching</div>
                            <div className="text-xs text-[color:var(--text-muted)]">Coming in Phase 5</div>
                        </div>
                    </div>
                    <p className="text-[0.85rem] text-[color:var(--text-muted)] leading-normal">
                        1-on-1 coaching, live sessions, and expert guidance.
                    </p>
                </div>
            </div>

            {/* Quick info */}
            <div className="glass-card p-6 flex items-center gap-4 mb-5">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0"
                    style={{ background: "rgba(34, 197, 94, 0.1)" }}
                >
                    {qualCompleted ? "🎉" : "💡"}
                </div>
                <div>
                    <div className="font-semibold text-[0.9rem] mb-1">
                        {qualCompleted ? "You're All Set" : "Getting Started"}
                    </div>
                    <p className="text-[0.825rem] text-[color:var(--text-secondary)] leading-normal">
                        {qualCompleted
                            ? "Your qualification is complete. We're preparing your personalized learning path. More features coming soon!"
                            : <>Start by completing your{" "}
                                <Link
                                    href="/qualify"
                                    className="text-[color:var(--brand-orange)] no-underline"
                                >
                                    qualification form
                                </Link>
                                . This helps us tailor your learning path and match you with the right resources.</>}
                    </p>
                </div>
            </div>

            {/* Feedback widget */}
            {userId && (
                <FeedbackWidget
                    stakeholderGroup="pilot_user"
                />
            )}
        </div>
    );
}
