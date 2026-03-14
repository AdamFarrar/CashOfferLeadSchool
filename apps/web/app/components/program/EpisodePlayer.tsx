"use client";

// =============================================================================
// EpisodePlayer — Platform Video Component
// =============================================================================
// Single reusable video player for all episode playback.
// Emits rate-limited analytics events. Manages resume state.
// Includes binge-watch overlay: auto-advance to next episode on completion.
//
// ARCHITECTURE: hooks MUST be called before any conditional returns
// (React rules-of-hooks). All branching is done in JSX, not via early returns.
// =============================================================================

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { logPlaybackEvent, updatePosition } from "@/app/actions/program";

interface EpisodePlayerProps {
    episodeId: string;
    moduleId: string;
    programId: string;
    programSlug?: string | null;
    videoUrl: string | null;
    durationSeconds: number | null;
    lastPositionSeconds: number;
    locked: boolean;
    onComplete?: () => void;
    nextEpisodeId?: string | null;
    nextEpisodeTitle?: string | null;
}

type PlaybackState = "idle" | "playing" | "paused";

const COUNTDOWN_SECONDS = 10;

export function EpisodePlayer({
    episodeId,
    moduleId,
    programId,
    programSlug,
    videoUrl,
    durationSeconds,
    lastPositionSeconds,
    locked,
    onComplete,
    nextEpisodeId,
    nextEpisodeTitle,
}: EpisodePlayerProps) {
    const router = useRouter();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const playbackState = useRef<PlaybackState>("idle");
    const startedFired = useRef(false);
    const completedFired = useRef(false);
    const positionUpdateTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentPosition = useRef(lastPositionSeconds);
    const [isReady, setIsReady] = useState(false);

    // Binge-watch overlay state
    const [showNextOverlay, setShowNextOverlay] = useState(false);
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (positionUpdateTimer.current) {
                clearInterval(positionUpdateTimer.current);
                positionUpdateTimer.current = null;
            }
            if (countdownTimer.current) {
                clearInterval(countdownTimer.current);
                countdownTimer.current = null;
            }
        };
    }, []);

    // Reset refs when episodeId changes
    useEffect(() => {
        startedFired.current = false;
        completedFired.current = false;
        playbackState.current = "idle";
        currentPosition.current = lastPositionSeconds;
        setIsReady(false);
        setShowNextOverlay(false);
        setCountdown(COUNTDOWN_SECONDS);

        if (positionUpdateTimer.current) {
            clearInterval(positionUpdateTimer.current);
            positionUpdateTimer.current = null;
        }
        if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = null;
        }
    }, [episodeId, lastPositionSeconds]);

    const startCountdown = useCallback(() => {
        if (!nextEpisodeId) return;

        setShowNextOverlay(true);
        setCountdown(COUNTDOWN_SECONDS);

        countdownTimer.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (countdownTimer.current) {
                        clearInterval(countdownTimer.current);
                        countdownTimer.current = null;
                    }
                    const nextUrl = programSlug ? `/programs/${programSlug}/episodes/${nextEpisodeId}` : `/episodes/${nextEpisodeId}`;
                    router.push(nextUrl);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [nextEpisodeId, router]);

    const cancelCountdown = useCallback(() => {
        setShowNextOverlay(false);
        setCountdown(COUNTDOWN_SECONDS);
        if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = null;
        }
    }, []);

    const startPositionTracking = useCallback(() => {
        if (positionUpdateTimer.current) return;

        positionUpdateTimer.current = setInterval(() => {
            if (playbackState.current !== "playing") return;

            currentPosition.current += 10;

            updatePosition(episodeId, currentPosition.current, durationSeconds).then(
                (result) => {
                    if (result.autoCompleted && !completedFired.current) {
                        completedFired.current = true;
                        logPlaybackEvent(episodeId, "episode_completed", {
                            moduleId,
                            programId,
                            positionSeconds: currentPosition.current,
                        });
                        onComplete?.();
                        startCountdown();
                    }
                },
            );
        }, 10_000);
    }, [episodeId, moduleId, programId, durationSeconds, onComplete, startCountdown]);

    const handleIframeLoad = useCallback(() => {
        setIsReady(true);

        if (!startedFired.current) {
            startedFired.current = true;
            playbackState.current = "playing";
            logPlaybackEvent(episodeId, "episode_started", {
                moduleId,
                programId,
                positionSeconds: currentPosition.current,
            });
            startPositionTracking();
        }
    }, [episodeId, moduleId, programId, startPositionTracking]);

    // ── Locked State ──
    if (locked) {
        return (
            <div style={{ aspectRatio: "16/9", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "0.75rem" }}>🔒</div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>
                        Episode Locked
                    </p>
                </div>
            </div>
        );
    }

    // ── No Video ──
    if (!videoUrl) {
        return (
            <div style={{
                aspectRatio: "16/9",
                background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
            }}>
                <div style={{ textAlign: "center", maxWidth: "20rem", padding: "2rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.7 }}>🎬</div>
                    <p style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem",
                    }}>
                        Episode Being Prepared
                    </p>
                    <p style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.6,
                        margin: 0,
                    }}>
                        This episode&apos;s video is being finalized and will appear here once it&apos;s ready. Check back soon.
                    </p>
                </div>
            </div>
        );
    }

    const embedUrl = getEmbedUrl(videoUrl, lastPositionSeconds);
    const circumference = 2 * Math.PI * 22;
    const strokeOffset = circumference - (countdown / COUNTDOWN_SECONDS) * circumference;

    return (
        <div style={{ position: "relative" }}>
            <iframe
                ref={iframeRef}
                src={embedUrl ?? undefined}
                style={{ display: "block", width: "100%", aspectRatio: "16/9", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Episode Player"
                onLoad={handleIframeLoad}
            />

            {/* Resume indicator */}
            {lastPositionSeconds > 0 && !isReady && (
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "0.5rem 1rem",
                    background: "rgba(0,0,0,0.8)",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                    <span>▶</span>
                    <span>Resuming from {formatTime(lastPositionSeconds)}</span>
                </div>
            )}

            {/* ── Binge-Watch Overlay ── */}
            {showNextOverlay && nextEpisodeId && (
                <div className="next-overlay">
                    <span className="next-overlay-label">Up Next</span>
                    <span className="next-overlay-title">
                        {nextEpisodeTitle || "Next Episode"}
                    </span>

                    <div className="next-overlay-countdown">
                        <svg viewBox="0 0 48 48" width="48" height="48">
                            <circle
                                cx="24" cy="24" r="22"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeOffset}
                                style={{ transition: "stroke-dashoffset 1s linear" }}
                            />
                        </svg>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", position: "relative", zIndex: 1 }}>
                            {countdown}
                        </span>
                    </div>

                    <button
                        className="next-overlay-cta"
                        onClick={() => router.push(programSlug ? `/programs/${programSlug}/episodes/${nextEpisodeId}` : `/episodes/${nextEpisodeId}`)}
                    >
                        Continue Watching →
                    </button>

                    <button className="next-overlay-cancel" onClick={cancelCountdown}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Helpers ──

function getEmbedUrl(videoUrl: string, startSeconds: number): string | null {
    const ytMatch = videoUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    if (ytMatch) {
        const start = startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : "";
        return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&enablejsapi=1${start}`;
    }

    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        const hash = startSeconds > 0 ? `#t=${Math.floor(startSeconds)}s` : "";
        return `https://player.vimeo.com/video/${vimeoMatch[1]}${hash}`;
    }

    if (videoUrl.includes("embed") || videoUrl.includes("player.vimeo.com")) {
        return videoUrl;
    }

    return null;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
