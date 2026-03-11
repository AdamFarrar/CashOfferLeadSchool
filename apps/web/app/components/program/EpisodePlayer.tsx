"use client";

// =============================================================================
// EpisodePlayer — Platform Video Component
// =============================================================================
// Single reusable video player for all episode playback.
// Emits rate-limited analytics events. Manages resume state.
// No page-specific players — this is the canonical video component.
//
// ARCHITECTURE: hooks MUST be called before any conditional returns
// (React rules-of-hooks). All branching is done in JSX, not via early returns.
// =============================================================================

import { useRef, useEffect, useState, useCallback } from "react";
import { logPlaybackEvent, updatePosition } from "@/app/actions/program";

interface EpisodePlayerProps {
    episodeId: string;
    moduleId: string;
    programId: string;
    videoUrl: string | null;
    durationSeconds: number | null;
    lastPositionSeconds: number;
    locked: boolean;
    onComplete?: () => void;
}

type PlaybackState = "idle" | "playing" | "paused";

export function EpisodePlayer({
    episodeId,
    moduleId,
    programId,
    videoUrl,
    durationSeconds,
    lastPositionSeconds,
    locked,
    onComplete,
}: EpisodePlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const playbackState = useRef<PlaybackState>("idle");
    const startedFired = useRef(false);
    const completedFired = useRef(false);
    const positionUpdateTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentPosition = useRef(lastPositionSeconds);
    const [isReady, setIsReady] = useState(false);

    // Cleanup interval on unmount — MUST be before any conditional returns
    useEffect(() => {
        return () => {
            if (positionUpdateTimer.current) {
                clearInterval(positionUpdateTimer.current);
                positionUpdateTimer.current = null;
            }
        };
    }, []);

    // Reset refs when episodeId changes (e.g. navigating between episodes)
    useEffect(() => {
        startedFired.current = false;
        completedFired.current = false;
        playbackState.current = "idle";
        currentPosition.current = lastPositionSeconds;
        setIsReady(false);

        if (positionUpdateTimer.current) {
            clearInterval(positionUpdateTimer.current);
            positionUpdateTimer.current = null;
        }
    }, [episodeId, lastPositionSeconds]);

    const startPositionTracking = useCallback(() => {
        if (positionUpdateTimer.current) return;

        positionUpdateTimer.current = setInterval(() => {
            if (playbackState.current !== "playing") return;

            currentPosition.current += 10;

            // Write to progress table (NOT event_log — rate limited)
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
                    }
                },
            );
        }, 10_000);
    }, [episodeId, moduleId, programId, durationSeconds, onComplete]);

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
            <div className="glass-card overflow-hidden">
                <div className="aspect-video bg-[var(--surface-raised)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-5xl mb-3">🔒</div>
                        <p className="text-[color:var(--text-muted)] text-sm font-medium">
                            Episode Locked
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── No Video ──
    if (!videoUrl) {
        return (
            <div className="glass-card overflow-hidden">
                <div className="aspect-video bg-[var(--surface-raised)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-4xl mb-3">🎬</div>
                        <p className="text-[color:var(--text-muted)] text-sm">
                            Video coming soon
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const embedUrl = getEmbedUrl(videoUrl, lastPositionSeconds);

    return (
        <div className="glass-card overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                    ref={iframeRef}
                    src={embedUrl ?? undefined}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Episode Player"
                    onLoad={handleIframeLoad}
                />
            </div>
            {lastPositionSeconds > 0 && !isReady && (
                <div className="px-4 py-2 bg-[var(--surface-raised)] text-xs text-[color:var(--text-muted)] flex items-center gap-2">
                    <span>▶</span>
                    <span>
                        Resuming from {formatTime(lastPositionSeconds)}
                    </span>
                </div>
            )}
        </div>
    );
}

// ── Helpers ──

function getEmbedUrl(videoUrl: string, startSeconds: number): string | null {
    // YouTube
    const ytMatch = videoUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    if (ytMatch) {
        const start = startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : "";
        return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&enablejsapi=1${start}`;
    }

    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        const hash = startSeconds > 0 ? `#t=${Math.floor(startSeconds)}s` : "";
        return `https://player.vimeo.com/video/${vimeoMatch[1]}${hash}`;
    }

    // Already an embed URL
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
