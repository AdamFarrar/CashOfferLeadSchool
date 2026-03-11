"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { FeedbackWidget } from "@/app/components/FeedbackWidget";
import { ProgramCard } from "@/app/components/ui/Cards";
import { track, identify } from "@cocs/analytics";
import { DashboardFirstViewed } from "@cocs/analytics/event-contracts";
import { getQualificationStatus } from "@/app/actions/qualification";

// ── Season Configuration ──
const SEASON_LABEL = "Season 1";
const TOTAL_WEEKS = 12;
const CURRENT_WEEK = 1; // Will be dynamic in Phase 2

const MODULES = [
    { number: 1, title: "Convert for the Appointment", weeks: "Weeks 1–3" },
    { number: 2, title: "The Appointment", weeks: "Weeks 4–6" },
    { number: 3, title: "Offer Mechanics", weeks: "Weeks 7–9" },
    { number: 4, title: "Nurture", weeks: "Weeks 10–12" },
];

function getCurrentModule(week: number) {
    if (week <= 3) return MODULES[0];
    if (week <= 6) return MODULES[1];
    if (week <= 9) return MODULES[2];
    return MODULES[3];
}

function SessionCountdown({ targetDate }: { targetDate: string | null }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        if (!targetDate) return;

        function updateCountdown() {
            const now = new Date().getTime();
            const target = new Date(targetDate!).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setIsLive(true);
                setTimeLeft("Live Now");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${hours}h ${minutes}m`);
            }
        }

        updateCountdown();
        const interval = setInterval(updateCountdown, 60_000);
        return () => clearInterval(interval);
    }, [targetDate]);

    if (!targetDate) {
        return (
            <div className="text-[color:var(--text-muted)] text-sm">
                Session date not yet scheduled
            </div>
        );
    }

    return (
        <div className={`text-xl font-bold ${isLive ? "text-green-400" : "text-[color:var(--brand-orange)]"}`}>
            {timeLeft}
        </div>
    );
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const firstName = session?.user?.name?.split(" ")[0] || "there";
    const userId = session?.user?.id || "";
    const { data: activeOrg } = useActiveOrganization();
    const organizationId = activeOrg?.id || "";
    const [qualCompleted, setQualCompleted] = useState(false);
    const [showVerifiedToast, setShowVerifiedToast] = useState(false);

    const currentModule = getCurrentModule(CURRENT_WEEK);
    const progressPercent = Math.round((CURRENT_WEEK / TOTAL_WEEKS) * 100);

    // Read NEXT_SESSION_DATE from env (passed at build time)
    const nextSessionDate = process.env.NEXT_PUBLIC_NEXT_SESSION_DATE || null;

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("verified") === "true") {
                setShowVerifiedToast(true);
                window.history.replaceState({}, "", "/dashboard");
                const timer = setTimeout(() => setShowVerifiedToast(false), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

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
            {/* Verification success toast */}
            {showVerifiedToast && (
                <div
                    className="glass-card p-4 mb-6 flex items-center gap-3 border border-green-500/30"
                    style={{ animation: "fadeIn 0.3s ease" }}
                >
                    <span className="text-green-400 text-xl">✓</span>
                    <div className="flex-1">
                        <div className="font-semibold text-sm text-green-400">Email verified!</div>
                        <div className="text-xs text-[color:var(--text-secondary)]">
                            Your account is all set. Welcome aboard!
                        </div>
                    </div>
                    <button
                        onClick={() => setShowVerifiedToast(false)}
                        className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] text-sm"
                    >
                        ✕
                    </button>
                </div>
            )}
            {/* Welcome header */}
            <div className="mb-8">
                <h1 className="text-[1.75rem] mb-2">
                    Welcome back, {firstName} 👋
                </h1>
                <p className="text-[color:var(--text-secondary)] text-sm">
                    {SEASON_LABEL} • Week {CURRENT_WEEK} of {TOTAL_WEEKS}
                </p>
            </div>

            {/* Qualification prompt if not completed */}
            {!qualCompleted && (
                <Link
                    href="/qualify"
                    className="glass-card p-5 no-underline text-inherit flex items-center gap-4 mb-6 border border-[var(--brand-orange)]/30"
                >
                    <div className="icon-box shrink-0">📋</div>
                    <div className="flex-1">
                        <div className="font-semibold text-sm">Help Us Tailor This</div>
                        <div className="text-xs text-[color:var(--text-secondary)]">
                            Complete a few quick questions so we can personalize your experience.
                        </div>
                    </div>
                    <span className="text-[color:var(--brand-orange)] text-sm font-semibold">Start →</span>
                </Link>
            )}

            {/* Season Progress */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold">Program Timeline</h2>
                    <span className="text-xs text-[color:var(--text-muted)]">Week {CURRENT_WEEK} of {TOTAL_WEEKS}</span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progressPercent}%`,
                            background: "linear-gradient(135deg, var(--brand-orange), var(--brand-orange-dark))",
                        }}
                    />
                </div>
                <div className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
                    <span className="text-[color:var(--brand-orange)] font-semibold">Module {currentModule.number}</span>
                    <span>—</span>
                    <span>{currentModule.title}</span>
                </div>
            </div>

            {/* Two-column: Next Session + This Week */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Next Live Session */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="icon-box">📡</div>
                        <h2 className="text-sm font-semibold">Next Live Session</h2>
                    </div>
                    <SessionCountdown targetDate={nextSessionDate} />
                    {nextSessionDate && (
                        <p className="text-xs text-[color:var(--text-muted)] mt-2">
                            {new Date(nextSessionDate).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                            })}
                        </p>
                    )}
                </div>

                {/* This Week's Episode */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="icon-box">🎬</div>
                        <h2 className="text-sm font-semibold">This Week&apos;s Episode</h2>
                    </div>
                    <div className="text-sm font-semibold mb-1">
                        Episode {CURRENT_WEEK}
                    </div>
                    <div className="text-xs text-[color:var(--text-secondary)] mb-1">
                        Module {currentModule.number} — {currentModule.title}
                    </div>
                    <div className="text-xs text-[color:var(--text-muted)]">
                        Guest Operator (TBA)
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <ProgramCard
                    href="#"
                    icon="📡"
                    title="Join Live"
                    subtitle="Coming soon"
                />
                <ProgramCard
                    href="/downloads"
                    icon="📥"
                    title="Download Assets"
                    subtitle="Scripts & SOPs"
                />
                <ProgramCard
                    href="/audit"
                    icon="📋"
                    title="Book Audit"
                    subtitle="Pipeline review"
                />
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
