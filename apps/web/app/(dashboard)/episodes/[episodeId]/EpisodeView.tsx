"use client";

// =============================================================================
// Episode View — Cinematic 4-Zone Layout (Phase 4)
// =============================================================================
// Zone 1: Full-width video stage + editorial metadata + action strip
// Zone 2: Two-column learning workspace (transcript + notes)
// Zone 3: Episode navigation cards (prev/next)
// Zone 4: Episode discussion (content-anchored threads)
//
// No glass-card wrappers. No LMS panels. Streaming-platform feel.
// Discussion placement: BELOW learning workspace (learning-first).
// =============================================================================

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { markComplete, saveNote } from "@/app/actions/program";
import { getEpisodeThreadsAction } from "@/app/actions/discussion";
import { getEpisodeInsightsAction, getEpisodeIntelligenceAction } from "@/app/actions/ai";
import { EpisodePlayer } from "@/app/components/program/EpisodePlayer";
import { DiscussionThreadList } from "@/app/components/program/DiscussionThread";
import { EpisodeTakeaways } from "@/app/components/program/EpisodeTakeaways";
import { EpisodeChat } from "@/app/components/program/EpisodeChat";
import { EpisodeReflection } from "@/app/components/program/EpisodeReflection";
import { BestMoments } from "@/app/components/program/BestMoments";
import { OperatorHighlights } from "@/app/components/program/OperatorHighlights";
import type { EpisodeDetail, ThreadSummary } from "@cocs/services";

interface Props {
    episode: EpisodeDetail;
}

// Episode-specific discussion prompts
const DISCUSSION_PROMPTS = [
    "What part of this episode changed how you think about your operation?",
    "What would you test in your business after this lesson?",
    "What's one thing from this episode you can implement today?",
    "How does this connect to something you've already tried?",
];

export function EpisodeView({ episode }: Props) {
    const [completed, setCompleted] = useState(episode.completed);
    const [noteContent, setNoteContent] = useState(episode.note ?? "");
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Zone 4: Discussion state
    const [threads, setThreads] = useState<ThreadSummary[]>([]);
    const [threadTotal, setThreadTotal] = useState(0);
    const [discussionLoaded, setDiscussionLoaded] = useState(false);
    const [, startTransition] = useTransition();

    // Load episode discussion on mount
    useEffect(() => {
        startTransition(async () => {
            try {
                const result = await getEpisodeThreadsAction(episode.id, 1);
                if (result.success) {
                    setThreads(result.threads ?? []);
                    setThreadTotal(result.total ?? 0);
                }
            } catch (e) {
                console.error("[EpisodeView] Failed to load discussion:", e);
            }
            setDiscussionLoaded(true);
        });
    }, [episode.id]);

    // Zone 1.5 + 5: AI Insights
    const [aiTakeaways, setAiTakeaways] = useState<string[] | null>(null);
    const [aiReflection, setAiReflection] = useState<string[] | null>(null);

    // Phase 6: Best Moments + Operator Highlights
    type BestMomentData = { title: string; timestampSeconds: number | null; source: "transcript" | "discussion"; description: string };
    type HighlightData = { title: string; body: string; timestampSeconds: number | null; referencePostId: string | null };
    const [bestMoments, setBestMoments] = useState<BestMomentData[] | null>(null);
    const [highlights, setHighlights] = useState<HighlightData[]>([]);
    const playerRef = useRef<{ seekTo?: (seconds: number) => void }>(null);

    useEffect(() => {
        getEpisodeInsightsAction(episode.id).then((result) => {
            if (result.success && result.data) {
                const takeawaysData = result.data.takeaways as { takeaways?: string[] } | null;
                const reflectionData = result.data.reflection as { prompts?: string[] } | null;
                if (takeawaysData?.takeaways) setAiTakeaways(takeawaysData.takeaways);
                if (reflectionData?.prompts) setAiReflection(reflectionData.prompts);
            }
        });

        // Phase 6: Load intelligence data
        getEpisodeIntelligenceAction(episode.id).then((result) => {
            if (result.success && result.data) {
                const momentsData = result.data.bestMoments as { moments?: BestMomentData[] } | null;
                if (momentsData?.moments) setBestMoments(momentsData.moments);
                if (result.data.highlights) setHighlights(result.data.highlights as HighlightData[]);
            }
        });
    }, [episode.id]);

    const handleMarkComplete = useCallback(async () => {
        const result = await markComplete(episode.id);
        if (result.success) {
            setCompleted(true);
        }
    }, [episode.id]);

    const handleAutoComplete = useCallback(() => {
        setCompleted(true);
    }, []);

    const handleNoteChange = useCallback(
        (value: string) => {
            setNoteContent(value);
            setSaveStatus(null);

            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(async () => {
                setSaving(true);
                const result = await saveNote(episode.id, value);
                setSaving(false);
                setSaveStatus(result.success ? "Saved" : result.error ?? "Error");
                if (result.success) {
                    setTimeout(() => setSaveStatus(null), 2000);
                }
            }, 1500);
        },
        [episode.id],
    );

    // Pick a deterministic prompt based on episode ID
    const promptIndex = episode.id.charCodeAt(0) % DISCUSSION_PROMPTS.length;
    const discussionPrompt = DISCUSSION_PROMPTS[promptIndex];

    // ── Locked State ──
    if (episode.locked) {
        return (
            <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔒</div>
                <h1 className="episode-title">{episode.title}</h1>
                <p style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.5rem",
                }}>
                    {episode.moduleTitle}
                </p>
                <p className="episode-subtitle" style={{ textTransform: "none", marginBottom: "1rem" }}>
                    This episode unlocks in Week {episode.unlockWeek + 1} of your cohort program.
                </p>
                <p style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    maxWidth: "28rem",
                    margin: "0 auto 2rem",
                    lineHeight: 1.6,
                }}>
                    Complete the earlier episodes first — each one builds on the last.
                    You&apos;ll be notified when this episode is ready.
                </p>
                <Link href="/programs" className="program-hero-cta">
                    ← Back to Programs
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* ── ZONE 1: Cinematic Video Stage ── */}
            <div className="video-stage">
                {episode.videoUrl ? (
                    <EpisodePlayer
                        episodeId={episode.id}
                        moduleId={episode.moduleId}
                        programId={episode.programId}
                        programSlug={episode.programSlug}
                        videoUrl={episode.videoUrl}
                        durationSeconds={episode.durationSeconds}
                        lastPositionSeconds={episode.lastPositionSeconds}
                        locked={episode.locked}
                        onComplete={handleAutoComplete}
                        nextEpisodeId={episode.nextEpisodeId}
                        nextEpisodeTitle={null}
                    />
                ) : (
                    <div style={{
                        aspectRatio: "16 / 9",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                    }}>
                        <span style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎬</span>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.35rem" }}>
                            Episode Video Preparing
                        </div>
                        <p style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            maxWidth: "24rem",
                            textAlign: "center",
                            lineHeight: 1.5,
                            margin: 0,
                        }}>
                            This episode&apos;s video is being finalized.
                            You can still read the transcript and notes below.
                        </p>
                    </div>
                )}

                <div className="video-stage-meta">
                    <h1 className="episode-title">{episode.title}</h1>
                    <p className="episode-subtitle">
                        Module {episode.moduleOrderIndex + 1}: {episode.moduleTitle}
                        {episode.durationSeconds && (
                            <> · {Math.ceil(episode.durationSeconds / 60)} min</>
                        )}
                    </p>
                    {episode.description && (
                        <p style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            marginTop: "0.75rem",
                            lineHeight: "1.6",
                            maxWidth: "42rem",
                        }}>
                            {episode.description}
                        </p>
                    )}

                    {/* Action Strip */}
                    <div className="episode-actions">
                        <button
                            onClick={handleMarkComplete}
                            disabled={completed}
                            className={`episode-action-btn ${completed ? "completed" : ""}`}
                            aria-label={completed ? "Episode completed" : "Mark this episode as complete"}
                        >
                            {completed ? "✅ Completed" : "☐ Mark Complete"}
                        </button>

                        {episode.assets.length > 0 && (
                            <a
                                href="#downloads"
                                className="episode-action-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById("downloads")?.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                📥 Downloads ({episode.assets.length})
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* ── ZONE 1.5: AI Key Takeaways ── */}
            <EpisodeTakeaways takeaways={aiTakeaways} />

            {/* ── ZONE 1.7: Operator Highlights (Phase 6) ── */}
            <OperatorHighlights
                highlights={highlights}
                onSeek={(s) => playerRef.current?.seekTo?.(s)}
            />

            {/* ── ZONE 1.9: Best Moments Timeline (Phase 6) ── */}
            <BestMoments
                moments={bestMoments}
                onSeek={(s) => playerRef.current?.seekTo?.(s)}
            />

            {/* ── ZONE 2: Learning Workspace ── */}
            <div className={`workspace ${!episode.transcript ? "single-column" : ""}`}
                 style={!episode.transcript ? { gridTemplateColumns: "1fr" } : undefined}>

                {/* Transcript Column */}
                {episode.transcript && (
                    <div>
                        <div className="workspace-section-label">Transcript</div>
                        <div className="workspace-transcript">
                            {episode.transcript}
                        </div>
                    </div>
                )}

                {/* Notes Column */}
                <div className="workspace-notes">
                    <div className="workspace-section-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Your Notes</span>
                        <span style={{
                            fontWeight: 500,
                            color: saveStatus === "Saved"
                                ? "var(--accent-green)"
                                : saveStatus
                                    ? "var(--brand-orange)"
                                    : "var(--text-muted)",
                        }}>
                            {saving ? "Saving..." : saveStatus ?? "Auto-saves"}
                        </span>
                    </div>
                    <textarea
                        value={noteContent}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        placeholder="Take notes on this episode..."
                    />
                </div>
            </div>

            {/* ── AI Reflection Prompts (below workspace) ── */}
            <EpisodeReflection prompts={aiReflection} />

            {/* ── Downloads (if assets) ── */}
            {episode.assets.length > 0 && (
                <div id="downloads" style={{ marginTop: "2rem" }}>
                    <div className="workspace-section-label">Downloads</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {episode.assets.map((asset) => (
                            <a
                                key={asset.id}
                                href={asset.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="module-episode-item"
                            >
                                <span>📄</span>
                                <span style={{ flex: 1 }}>{asset.title}</span>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                    {asset.fileType ?? "PDF"}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* ── ZONE 3: Episode Navigation ── */}
            <nav className="episode-nav">
                {episode.prevEpisodeId ? (
                    <Link href={episode.programSlug ? `/programs/${episode.programSlug}/episodes/${episode.prevEpisodeId}` : `/episodes/${episode.prevEpisodeId}`} className="episode-nav-card" aria-label="Go to previous episode">
                        <span className="nav-label">← Previous</span>
                        <span className="nav-title">Previous Episode</span>
                    </Link>
                ) : (
                    <div />
                )}

                <Link href="/programs" className="episode-nav-center">
                    All Programs
                </Link>

                {episode.nextEpisodeId ? (
                    <Link href={episode.programSlug ? `/programs/${episode.programSlug}/episodes/${episode.nextEpisodeId}` : `/episodes/${episode.nextEpisodeId}`} className="episode-nav-card next" aria-label="Go to next episode">
                        <span className="nav-label">Next →</span>
                        <span className="nav-title">Next Episode</span>
                    </Link>
                ) : (
                    <div />
                )}
            </nav>

            {/* ── ZONE 4: Episode Discussion ── */}
            {discussionLoaded && (
                <div style={{ marginTop: "3rem" }}>
                    <DiscussionThreadList
                        threads={threads}
                        total={threadTotal}
                        programId={episode.programId}
                        moduleId={episode.moduleId}
                        episodeId={episode.id}
                        discussionPrompt={discussionPrompt}
                    />
                </div>
            )}

            {/* ── AI Chat FAB ── */}
            <EpisodeChat episodeId={episode.id} hasTranscript={!!episode.transcript} />
        </div>
    );
}
