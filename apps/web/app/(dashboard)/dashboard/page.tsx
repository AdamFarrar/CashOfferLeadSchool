"use client";

// =============================================================================
// Program Console Dashboard (Phase 3.5)
// =============================================================================
// Streaming-platform homepage feel. Not a SaaS dashboard.
//
// Section 1: Hero — Resume/Next Episode (large, cinematic)
// Section 2: This Week — Current module progress + episode list
// Section 3: Program Resources (editorial, not widgets)
//
// Preserved: analytics tracking, qualification modal, session countdown,
//            verification toast.
// =============================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { QualificationModal } from "@/app/components/modals/QualificationModal";
import { track, identify } from "@cocs/analytics";
import { DashboardFirstViewed } from "@cocs/analytics/event-contracts";
import { getQualificationStatus } from "@/app/actions/qualification";
import { getDashboardProgress } from "@/app/actions/program";
import { getDashboardIntelligenceAction } from "@/app/actions/ai";
import { CompletionGuidance } from "@/app/components/program/CompletionGuidance";
import { CohortSignals } from "@/app/components/program/CohortSignals";
import type { DashboardProgress } from "@cocs/services";
import { getNextSessionAction } from "@/app/actions/live-sessions";
import { LoadingSkeleton } from "@/app/components/ui/LoadingSkeleton";

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
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem 1.25rem",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                marginTop: "1.5rem",
                opacity: 0.6,
            }}>
                <span style={{ fontSize: "1.25rem" }}>📡</span>
                <div>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                        Live Sessions
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Live coaching sessions are scheduled during the active season. Stay tuned.
                    </div>
                </div>
                <Link href="/sessions" style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--brand-orange)", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                    View Sessions →
                </Link>
            </div>
        );
    }

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1.25rem",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            marginTop: "1.5rem",
        }}>
            <span style={{ fontSize: "1.25rem" }}>📡</span>
            <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                    Next Live Session
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: isLive ? "var(--accent-green)" : "var(--brand-orange)" }}>
                    {timeLeft}
                </div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {new Date(targetDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZoneName: "short",
                })}
            </span>
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

    // Phase 6: Intelligence layer
    type GuidanceMsg = { type: string; title: string; body: string; priority: number };
    type CohortSignalData = { signalType: string; title: string; description: string; episodeId?: string; episodeTitle?: string };
    const [guidanceMessages, setGuidanceMessages] = useState<GuidanceMsg[]>([]);
    const [cohortSignals, setCohortSignals] = useState<CohortSignalData[] | null>(null);

    const [nextSessionDate, setNextSessionDate] = useState<string | null>(null);

    // Load next session from DB
    useEffect(() => {
        getNextSessionAction().then((result) => {
            if (result.session?.scheduledAt) {
                setNextSessionDate(new Date(result.session.scheduledAt).toISOString());
            }
        }).catch(() => {});
    }, []);

    // Verification toast
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

    // Analytics + data loading (UNCHANGED)
    useEffect(() => {
        if (userId) {
            identify(userId, { organizationId: organizationId || undefined });

            getDashboardProgress().then((data) => {
                if (data) setProgress(data);
            });

            // Phase 6: Load intelligence data
            getDashboardIntelligenceAction().then((result) => {
                if (result.success && result.data) {
                    if (result.data.guidance) {
                        setGuidanceMessages(result.data.guidance as GuidanceMsg[]);
                    }
                    const signals = result.data.cohortSignals as { signals?: CohortSignalData[] } | null;
                    if (signals?.signals) {
                        setCohortSignals(signals.signals);
                    }
                }
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

    // Derive current module
    const currentModuleData = progress?.modules.find((m) => {
        return m.completedEpisodes < m.totalEpisodes;
    }) || progress?.modules[0];

    // Resume or next episode info
    const heroEpisode = progress?.resumeEpisode || progress?.nextEpisode;
    const isResume = !!progress?.resumeEpisode;

    return (
        <div>
            {/* Verification toast */}
            {showVerifiedToast && (
                <div
                    style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1.5rem",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        animation: "fadeIn 0.3s ease",
                    }}
                >
                    <span style={{ color: "var(--accent-green)", fontSize: "1.1rem" }}>✓</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--accent-green)" }}>Email verified!</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                            Your account is all set. Welcome aboard!
                        </div>
                    </div>
                    <button
                        onClick={() => setShowVerifiedToast(false)}
                        style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Qualification modal — blocks dashboard until completed */}
            {!qualCompleted && (
                <QualificationModal
                    nextSessionDate={nextSessionDate}
                    onComplete={() => setQualCompleted(true)}
                />
            )}

            {/* ── SECTION 1: Program Hero (Continue / Resume) ── */}
            <div className="program-hero">
                <div className="program-hero-label">
                    {isResume ? "Continue Watching" : "Your Program"}
                </div>

                {heroEpisode ? (
                    <>
                        <div className="program-hero-title">{heroEpisode.title}</div>
                        <div className="program-hero-subtitle">
                        {isResume
                            ? `Resume from ${formatTime((progress?.resumeEpisode as { lastPositionSeconds: number })?.lastPositionSeconds ?? 0)}`
                            : (progress?.nextEpisode as { moduleTitle?: string })?.moduleTitle ?? ""}
                    </div>
                    </>
                ) : (
                    <>
                        <div className="program-hero-title">
                            Welcome, {firstName} 👋
                        </div>
                        <div className="program-hero-subtitle">
                            {progress
                                ? (progress.completedEpisodes > 0
                                    ? "All available episodes completed — stay tuned for new content!"
                                    : "Your program is ready — start your first episode below.")
                                : ""}
                        </div>
                        {!progress && <LoadingSkeleton variant="hero" />}
                    </>
                )}



                {/* Progress bar */}
                <div className="program-hero-progress">
                    <div
                        className="program-hero-progress-fill"
                        style={{ width: `${progress?.progressPercent ?? 0}%` }}
                    />
                </div>

                {heroEpisode ? (
                    <Link
                        href={`/episodes/${heroEpisode.id}`}
                        className="program-hero-cta"
                    >
                        {isResume ? "▶ Resume" : "▶ Start Episode"}
                    </Link>
                ) : (
                    <Link href="/programs" className="program-hero-cta">
                        Browse Episodes
                    </Link>
                )}

                {progress && (
                    <span style={{
                        display: "inline-block",
                        marginLeft: "1rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                    }}>
                        {progress.completedEpisodes}/{progress.totalEpisodes} episodes complete
                    </span>
                )}
            </div>

            {/* Completion Celebration — only when 100% */}
            {progress && progress.progressPercent === 100 && !heroEpisode && (
                <div style={{
                    margin: "1.5rem 0",
                    padding: "1.5rem",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(34, 197, 94, 0.04)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>🎉</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--accent-green)" }}>
                                Program Complete!
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                You&apos;ve completed all {progress.totalEpisodes} episodes — outstanding commitment.
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <Link href="/audit" style={{
                            padding: "0.35rem 0.9rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            borderRadius: "var(--radius-sm)",
                            background: "var(--brand-orange)",
                            color: "#fff",
                            textDecoration: "none",
                        }}>
                            📋 Book Your Audit
                        </Link>
                        <Link href="/discussion" style={{
                            padding: "0.35rem 0.9rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            textDecoration: "none",
                        }}>
                            💬 Join Discussion
                        </Link>
                        <Link href="/downloads" style={{
                            padding: "0.35rem 0.9rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            textDecoration: "none",
                        }}>
                            📥 Get Downloads
                        </Link>
                    </div>
                </div>
            )}

            {/* Phase 6: Completion Guidance */}
            <CompletionGuidance
                messages={guidanceMessages as Parameters<typeof CompletionGuidance>[0]["messages"]}
                nextEpisodeId={progress?.nextEpisode?.id}
            />

            {/* Live session */}
            <SessionCountdown targetDate={nextSessionDate} />

            {/* ── SECTION 2: This Week in the Program ── */}
            {currentModuleData && (
                <div className="module-progress">
                    <div className="module-progress-header">
                        <div className="module-progress-title">
                            This Week — Module {currentModuleData.orderIndex + 1}: {currentModuleData.title}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {currentModuleData.completedEpisodes}/{currentModuleData.totalEpisodes} done
                        </span>
                    </div>

                    {/* Module progress bars */}
                    <div className="module-episode-list">
                        {progress?.modules.map((mod) => {
                            const pct = mod.totalEpisodes > 0
                                ? Math.round((mod.completedEpisodes / mod.totalEpisodes) * 100)
                                : 0;
                            const isCurrent = mod.id === currentModuleData.id;

                            return (
                                <Link
                                    key={mod.id}
                                    href="/programs"
                                    className={`module-episode-item ${isCurrent ? "active" : ""}`}
                                >
                                    <span className={`status-dot ${pct === 100 ? "done" : isCurrent ? "current" : "pending"}`} />
                                    <span style={{ flex: 1 }}>
                                        Module {mod.orderIndex + 1}: {mod.title}
                                    </span>
                                    <span style={{ fontSize: "0.65rem", color: pct === 100 ? "var(--accent-green)" : "var(--text-muted)" }}>
                                        {pct === 100 ? "✓ Complete" : `${mod.completedEpisodes}/${mod.totalEpisodes}`}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Phase 6: Cohort Signals */}
            <CohortSignals signals={cohortSignals as Parameters<typeof CohortSignals>[0]["signals"]} />

            {/* ── SECTION 3: Program Resources ── */}
            <div className="program-resources">
                <Link href="/programs" className="resource-link">
                    <span className="resource-icon">📺</span>
                    Episodes
                </Link>
                <Link href="/downloads" className="resource-link">
                    <span className="resource-icon">📥</span>
                    Downloads
                </Link>
                <Link href="/discussion" className="resource-link">
                    <span className="resource-icon">💬</span>
                    Discussion
                </Link>
                <Link href="/notes" className="resource-link">
                    <span className="resource-icon">📝</span>
                    My Notes
                </Link>
            </div>
        </div>
    );
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
