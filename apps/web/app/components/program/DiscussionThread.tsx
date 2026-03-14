"use client";

// =============================================================================
// Discussion Thread List — Phase 4
// =============================================================================
// Renders threads for a program or episode context.
// Includes "Start a Thread" form and participation prompts.
// =============================================================================

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ThreadSummary } from "@cols/services";
import {
    createThreadAction,
    getEpisodeThreadsAction,
    getProgramThreadsAction,
    checkConductAction,
} from "@/app/actions/discussion";
import { ConductAgreementModal } from "./ConductAgreementModal";

interface Props {
    threads: ThreadSummary[];
    total: number;
    programId: string;
    moduleId?: string | null;
    episodeId?: string | null;
    discussionPrompt?: string;
    hasAgreedToConduct?: boolean;
}

export function DiscussionThreadList({
    threads: initialThreads,
    total: initialTotal,
    programId,
    moduleId,
    episodeId,
    discussionPrompt,
    hasAgreedToConduct: initialConductStatus = false,
}: Props) {
    const [threads, setThreads] = useState(initialThreads);
    const [total, setTotal] = useState(initialTotal);
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [threadType, setThreadType] = useState<string>(episodeId ? "episode" : "general");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<"all" | "general" | "episode">("all");
    const [hasAgreed, setHasAgreed] = useState(initialConductStatus);
    const [showConduct, setShowConduct] = useState(false);

    const hasMore = threads.length < total;

    function loadMore() {
        const nextPage = page + 1;
        const filter = activeTab === "all" ? undefined : activeTab;
        startTransition(async () => {
            const result = episodeId
                ? await getEpisodeThreadsAction(episodeId, nextPage)
                : await getProgramThreadsAction(programId, nextPage, filter);
            if (result.success && result.threads) {
                setThreads((prev) => [...prev, ...result.threads]);
                setPage(nextPage);
                setTotal(result.total);
            }
        });
    }

    function switchTab(tab: "all" | "general" | "episode") {
        setActiveTab(tab);
        const filter = tab === "all" ? undefined : tab;
        startTransition(async () => {
            const result = episodeId
                ? await getEpisodeThreadsAction(episodeId, 1)
                : await getProgramThreadsAction(programId, 1, filter);
            if (result.success && result.threads) {
                setThreads(result.threads);
                setTotal(result.total);
                setPage(1);
            }
        });
    }

    async function handleStartPost() {
        if (hasAgreed) {
            setShowForm(!showForm);
            return;
        }
        // Check conduct status
        const result = await checkConductAction();
        if (result.agreed) {
            setHasAgreed(true);
            setShowForm(!showForm);
        } else {
            setShowConduct(true);
        }
    }

    function handleSubmit() {
        setError("");
        if (!title.trim()) { setError("Title is required."); return; }
        if (!body.trim()) { setError("Post body is required."); return; }

        startTransition(async () => {
            const result = await createThreadAction({
                programId,
                moduleId: moduleId ?? undefined,
                episodeId: episodeId ?? undefined,
                title: title.trim(),
                body: body.trim(),
                threadType,
            });

            if (result.success) {
                setShowForm(false);
                setTitle("");
                setBody("");
                // Refresh thread list
                const filter = activeTab === "all" ? undefined : activeTab;
                const refresh = episodeId
                    ? await getEpisodeThreadsAction(episodeId, 1)
                    : await getProgramThreadsAction(programId, 1, filter);
                if (refresh.success && refresh.threads) {
                    setThreads(refresh.threads);
                    setTotal(refresh.total);
                    setPage(1);
                }
            } else {
                setError(result.error || "Failed to create thread.");
            }
        });
    }

    return (
        <div className="discussion-section">
            {/* Conduct Agreement Modal */}
            {showConduct && (
                <ConductAgreementModal
                    onAgreed={() => {
                        setShowConduct(false);
                        setHasAgreed(true);
                        setShowForm(true);
                    }}
                />
            )}

            {/* Header */}
            <div className="discussion-header">
                <div>
                    <h2 className="discussion-title">Discussion</h2>
                    {total > 0 && (
                        <span className="discussion-count">
                            {total} thread{total !== 1 ? "s" : ""} · {threads.reduce((s, t) => s + t.postCount, 0)} posts
                        </span>
                    )}
                </div>
                <button
                    onClick={handleStartPost}
                    className="discussion-cta"
                    aria-label={showForm ? "Cancel starting a thread" : "Start a new discussion thread"}
                >
                    {showForm ? "Cancel" : "+ Start a Thread"}
                </button>
            </div>

            {/* Thread Type Tabs */}
            {!episodeId && (
                <div className="discussion-tabs">
                    {(["all", "general", "episode"] as const).map((tab) => (
                        <button
                            key={tab}
                            className={`discussion-tab ${activeTab === tab ? "active" : ""}`}
                            onClick={() => switchTab(tab)}
                            disabled={isPending}
                        >
                            {tab === "all" ? "All" : tab === "general" ? "💬 General" : "📺 Episode"}
                        </button>
                    ))}
                </div>
            )}

            {/* Participation Prompt */}
            {threads.length === 0 && !showForm && (
                <div className="discussion-prompt">
                    <div className="discussion-prompt-icon">💬</div>
                    <h3 className="discussion-prompt-title">Start the Conversation</h3>
                    {discussionPrompt && (
                        <p className="discussion-prompt-text">{discussionPrompt}</p>
                    )}
                    <button onClick={() => setShowForm(true)} className="discussion-cta" style={{ marginTop: "1rem" }} aria-label="Be the first to post in this discussion">
                        Be the First to Post
                    </button>
                </div>
            )}

            {/* Create Thread Form */}
            {showForm && (
                <div className="discussion-form">
                    <input
                        type="text"
                        placeholder="Thread title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={255}
                        className="discussion-input"
                    />
                    {!episodeId && (
                        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", cursor: "pointer", opacity: threadType === "general" ? 1 : 0.5 }}>
                                <input type="radio" name="threadType" value="general" checked={threadType === "general"} onChange={() => setThreadType("general")} />
                                💬 General
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", cursor: "pointer", opacity: threadType === "episode" ? 1 : 0.5 }}>
                                <input type="radio" name="threadType" value="episode" checked={threadType === "episode"} onChange={() => setThreadType("episode")} />
                                📺 Episode
                            </label>
                        </div>
                    )}
                    <textarea
                        placeholder="Share your thoughts..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        maxLength={5000}
                        rows={4}
                        className="discussion-textarea"
                    />
                    {error && <p className="discussion-error">{error}</p>}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button onClick={() => setShowForm(false)} className="discussion-btn-ghost">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={isPending} className="discussion-btn-primary" aria-label="Submit your discussion post">
                            {isPending ? "Posting..." : "Post Thread"}
                        </button>
                    </div>
                </div>
            )}

            {/* Thread List */}
            {threads.length > 0 && (
                <div className="discussion-thread-list">
                    {threads.map((thread) => (
                        <Link
                            key={thread.id}
                            href={`/discussion/${thread.id}`}
                            className="discussion-thread-card"
                        >
                            <div className="discussion-thread-meta">
                                {thread.isPinned && <span className="discussion-badge-pin">📌</span>}
                                {thread.isLocked && <span className="discussion-badge-lock">🔒</span>}
                                {(thread as any).threadType === "episode" && <span style={{ fontSize: "0.7rem" }}>📺</span>}
                                {(thread as any).threadType === "general" && <span style={{ fontSize: "0.7rem" }}>💬</span>}
                            </div>
                            <h3 className="discussion-thread-title">{thread.title}</h3>
                            <div className="discussion-thread-info">
                                <span>{thread.authorName ?? "Unknown"}</span>
                                <span>·</span>
                                <span>{thread.postCount} post{thread.postCount !== 1 ? "s" : ""}</span>
                                <span>·</span>
                                <span>{timeAgo(thread.latestPostAt ?? thread.createdAt)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Load More */}
            {hasMore && (
                <button onClick={loadMore} disabled={isPending} className="discussion-load-more" aria-label="Load more discussion threads">
                    {isPending ? "Loading..." : "Load More Threads"}
                </button>
            )}
        </div>
    );
}

function timeAgo(date: Date | string): string {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}
