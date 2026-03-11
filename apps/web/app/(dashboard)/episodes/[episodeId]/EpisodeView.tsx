"use client";

// =============================================================================
// Episode View — Client Component
// =============================================================================
// Renders episode detail: video player, description, notes, assets, transcript.
// Uses EpisodePlayer as the canonical video component.
// All data from DB. No hardcoded content.
// =============================================================================

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { markComplete, saveNote } from "@/app/actions/program";
import { EpisodePlayer } from "@/app/components/program/EpisodePlayer";
import type { EpisodeDetail } from "@cocs/services";

interface Props {
    episode: EpisodeDetail;
}

export function EpisodeView({ episode }: Props) {
    const [completed, setCompleted] = useState(episode.completed);
    const [noteContent, setNoteContent] = useState(episode.note ?? "");
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showTranscript, setShowTranscript] = useState(false);

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

    return (
        <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[color:var(--text-muted)] mb-6">
                <Link href="/episodes" className="hover:text-[color:var(--text-primary)] transition-colors">
                    Episodes
                </Link>
                <span>→</span>
                <span>Module {episode.moduleOrderIndex + 1}: {episode.moduleTitle}</span>
                <span>→</span>
                <span className="text-[color:var(--text-primary)]">{episode.title}</span>
            </div>

            {/* Locked state — full page */}
            {episode.locked && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🔒</div>
                    <h1 className="text-xl font-bold mb-2">Episode Locked</h1>
                    <p className="text-[color:var(--text-secondary)] text-sm">
                        This episode unlocks in Week {episode.unlockWeek + 1} of your cohort program.
                    </p>
                    <Link href="/episodes" className="btn-primary mt-6 inline-block">
                        ← Back to Episodes
                    </Link>
                </div>
            )}

            {!episode.locked && (
                <>
                    {/* Video Player — canonical EpisodePlayer component */}
                    <div className="mb-6">
                        <EpisodePlayer
                            episodeId={episode.id}
                            moduleId={episode.moduleId}
                            programId={episode.programId}
                            videoUrl={episode.videoUrl}
                            durationSeconds={episode.durationSeconds}
                            lastPositionSeconds={episode.lastPositionSeconds}
                            locked={episode.locked}
                            onComplete={handleAutoComplete}
                        />
                    </div>

                    {/* Episode Info + Controls */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Title + Complete */}
                            <div className="glass-card p-6 mb-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-xl font-bold mb-2">{episode.title}</h1>
                                        <p className="text-xs text-[color:var(--text-muted)]">
                                            Module {episode.moduleOrderIndex + 1}: {episode.moduleTitle}
                                            {episode.durationSeconds && (
                                                <> · {Math.ceil(episode.durationSeconds / 60)} min</>
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleMarkComplete}
                                        disabled={completed}
                                        className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            completed
                                                ? "bg-green-600/20 text-green-400 cursor-default"
                                                : "btn-primary"
                                        }`}
                                    >
                                        {completed ? "✅ Completed" : "Mark Complete"}
                                    </button>
                                </div>
                                {episode.description && (
                                    <p className="text-[color:var(--text-secondary)] text-sm mt-4 leading-relaxed">
                                        {episode.description}
                                    </p>
                                )}
                            </div>

                            {/* Transcript */}
                            {episode.transcript && (
                                <div className="glass-card p-6 mb-6">
                                    <button
                                        onClick={() => setShowTranscript(!showTranscript)}
                                        className="flex items-center justify-between w-full text-left"
                                    >
                                        <h2 className="font-semibold text-sm">📜 Transcript</h2>
                                        <span className="text-xs text-[color:var(--text-muted)]">
                                            {showTranscript ? "Hide" : "Show"}
                                        </span>
                                    </button>
                                    {showTranscript && (
                                        <div className="mt-4 text-sm text-[color:var(--text-secondary)] leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                                            {episode.transcript}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            <div className="glass-card p-6 mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-semibold text-sm">📝 My Notes</h2>
                                    <span className="text-xs text-[color:var(--text-muted)]">
                                        {saving ? "Saving..." : saveStatus ?? "Auto-saves as you type"}
                                    </span>
                                </div>
                                <textarea
                                    value={noteContent}
                                    onChange={(e) => handleNoteChange(e.target.value)}
                                    placeholder="Take notes on this episode..."
                                    className="w-full min-h-[160px] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-lg p-4 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] resize-y focus:outline-none focus:border-[var(--brand-orange)] transition-colors"
                                />
                            </div>

                            {/* Nav */}
                            <div className="flex items-center justify-between">
                                {episode.prevEpisodeId ? (
                                    <Link
                                        href={`/episodes/${episode.prevEpisodeId}`}
                                        className="btn-ghost text-sm"
                                    >
                                        ← Previous
                                    </Link>
                                ) : (
                                    <div />
                                )}
                                <Link href="/episodes" className="btn-ghost text-sm">
                                    All Episodes
                                </Link>
                                {episode.nextEpisodeId ? (
                                    <Link
                                        href={`/episodes/${episode.nextEpisodeId}`}
                                        className="btn-primary text-sm"
                                    >
                                        Next →
                                    </Link>
                                ) : (
                                    <div />
                                )}
                            </div>
                        </div>

                        {/* Sidebar: Assets */}
                        {episode.assets.length > 0 && (
                            <div className="lg:w-72 shrink-0">
                                <div className="glass-card p-6">
                                    <h2 className="font-semibold text-sm mb-4">📥 Downloads</h2>
                                    <div className="flex flex-col gap-3">
                                        {episode.assets.map((asset) => (
                                            <a
                                                key={asset.id}
                                                href={asset.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
                                            >
                                                <span>📄</span>
                                                <span className="flex-1">{asset.title}</span>
                                                <span className="text-xs text-[color:var(--text-muted)]">
                                                    {asset.fileType ?? "PDF"}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
