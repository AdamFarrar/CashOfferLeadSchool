"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { FeedbackWidget } from "@/app/components/FeedbackWidget";
import { ProgramCard } from "@/app/components/ui/Cards";
import { track, identify } from "@cocs/analytics";
import { DashboardFirstViewed } from "@cocs/analytics/event-contracts";
import { getQualificationStatus } from "@/app/actions/qualification";
import { getDashboardProgress } from "@/app/actions/program";
import type { DashboardProgress } from "@cocs/services";

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
    const [progress, setProgress] = useState<DashboardProgress | null>(null);

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

            // Fetch program progress from server
            getDashboardProgress().then((data) => {
                if (data) setProgress(data);
            });

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

    // Derive current module from progress data
    const currentModuleData = progress?.modules.find((m) => {
        return m.completedEpisodes < m.totalEpisodes;
    }) || progress?.modules[0];

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
                    {progress
                        ? `${progress.programTitle} • Week ${progress.currentWeek + 1} of ${progress.totalEpisodes}`
                        : "Loading program data..."}
                </p>
            </div>

            {/* Qualification prompt */}
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

            {/* Program Progress — DB-driven */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold">Program Progress</h2>
                    <span className="text-xs text-[color:var(--text-muted)]">
                        {progress
                            ? `${progress.completedEpisodes}/${progress.totalEpisodes} episodes`
                            : "—"}
                    </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progress?.progressPercent ?? 0}%`,
                            background: "linear-gradient(135deg, var(--brand-orange), var(--brand-orange-dark))",
                        }}
                    />
                </div>
                {currentModuleData && (
                    <div className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
                        <span className="text-[color:var(--brand-orange)] font-semibold">
                            Module {currentModuleData.orderIndex + 1}
                        </span>
                        <span>—</span>
                        <span>{currentModuleData.title}</span>
                        <span className="ml-auto text-[color:var(--text-muted)]">
                            {currentModuleData.completedEpisodes}/{currentModuleData.totalEpisodes} done
                        </span>
                    </div>
                )}
            </div>

            {/* Module Breakdown */}
            {progress && progress.modules.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {progress.modules.map((mod) => {
                        const pct = mod.totalEpisodes > 0
                            ? Math.round((mod.completedEpisodes / mod.totalEpisodes) * 100)
                            : 0;
                        return (
                            <div key={mod.id} className="glass-card p-4">
                                <div className="text-xs text-[color:var(--brand-orange)] font-semibold mb-1">
                                    Module {mod.orderIndex + 1}
                                </div>
                                <div className="text-xs font-medium mb-2 truncate">{mod.title}</div>
                                <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${pct}%`,
                                            background: pct === 100
                                                ? "var(--success-green, #22c55e)"
                                                : "var(--brand-orange)",
                                        }}
                                    />
                                </div>
                                <div className="text-[10px] text-[color:var(--text-muted)] mt-1">
                                    {mod.completedEpisodes}/{mod.totalEpisodes}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Two-column: Next/Resume Episode + Next Session */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Next / Resume Episode */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="icon-box">🎬</div>
                        <h2 className="text-sm font-semibold">
                            {progress?.resumeEpisode ? "Resume Watching" : "Next Episode"}
                        </h2>
                    </div>
                    {progress?.resumeEpisode ? (
                        <Link
                            href={`/episodes/${progress.resumeEpisode.id}`}
                            className="no-underline text-inherit"
                        >
                            <div className="text-sm font-semibold mb-1">
                                {progress.resumeEpisode.title}
                            </div>
                            <div className="text-xs text-[color:var(--text-muted)]">
                                Resume from {formatTime(progress.resumeEpisode.lastPositionSeconds)}
                            </div>
                        </Link>
                    ) : progress?.nextEpisode ? (
                        <Link
                            href={`/episodes/${progress.nextEpisode.id}`}
                            className="no-underline text-inherit"
                        >
                            <div className="text-sm font-semibold mb-1">
                                {progress.nextEpisode.title}
                            </div>
                            <div className="text-xs text-[color:var(--text-secondary)]">
                                {progress.nextEpisode.moduleTitle}
                            </div>
                        </Link>
                    ) : (
                        <div className="text-xs text-[color:var(--text-muted)]">
                            All available episodes completed!
                        </div>
                    )}
                </div>

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
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <ProgramCard
                    href="/episodes"
                    icon="📺"
                    title="Episodes"
                    subtitle="Browse all episodes"
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

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
