"use client";

// =============================================================================
// Thread Detail — Phase 4
// =============================================================================
// Full thread view: posts with reactions, reply form, edit/delete controls.
// Flat/lightly indented replies (no nested forum UI).
// Soft-deleted posts shown as [deleted] placeholders.
// =============================================================================

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    createPostAction,
    editPostAction,
    deletePostAction,
    toggleReactionAction,
    getThreadDetailAction,
    lockThreadAction,
    pinThreadAction,
    hideThreadAction,
} from "@/app/actions/discussion";
import type { PostWithReactions } from "@cols/services";

interface Props {
    thread: {
        id: string;
        title: string;
        programId: string;
        moduleId: string | null;
        episodeId: string | null;
        createdBy: string;
        authorName: string | null;
        isLocked: boolean;
        isPinned: boolean;
        isHidden: boolean;
        createdAt: Date;
    };
    posts: PostWithReactions[];
    totalPosts: number;
    currentUserId: string;
    isAdmin: boolean;
}

const REACTION_ICONS: Record<string, string> = { like: "👍", helpful: "💡", fire: "🔥" };

export function ThreadDetail({ thread: initialThread, posts: initialPosts, totalPosts: initialTotal, currentUserId, isAdmin }: Props) {
    const [thread, setThread] = useState(initialThread);
    const [posts, setPosts] = useState(initialPosts);
    const [totalPosts, setTotalPosts] = useState(initialTotal);
    const [page, setPage] = useState(1);
    const [replyBody, setReplyBody] = useState("");
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBody, setEditBody] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    const hasMore = posts.length < totalPosts;

    function refresh() {
        startTransition(async () => {
            const result = await getThreadDetailAction(thread.id, 1);
            if (result.success && result.data) {
                setPosts(result.data.posts);
                setTotalPosts(result.data.totalPosts);
                setPage(1);
            }
        });
    }

    function loadMore() {
        const nextPage = page + 1;
        startTransition(async () => {
            const result = await getThreadDetailAction(thread.id, nextPage);
            if (result.success && result.data) {
                setPosts((prev) => [...prev, ...result.data!.posts]);
                setPage(nextPage);
                setTotalPosts(result.data.totalPosts);
            }
        });
    }

    function handleSubmitReply() {
        setError("");
        if (!replyBody.trim()) return;

        startTransition(async () => {
            const result = await createPostAction({
                threadId: thread.id,
                body: replyBody.trim(),
                parentPostId: replyToId ?? undefined,
            });
            if (result.success) {
                setReplyBody("");
                setReplyToId(null);
                refresh();
            } else {
                setError(result.error || "Failed to post.");
            }
        });
    }

    function handleEdit(postId: string) {
        setError("");
        startTransition(async () => {
            const result = await editPostAction(postId, editBody.trim());
            if (result.success) {
                setEditingId(null);
                setEditBody("");
                refresh();
            } else {
                setError(result.error || "Failed to edit.");
            }
        });
    }

    function handleDelete(postId: string) {
        startTransition(async () => {
            const result = await deletePostAction(postId);
            if (result.success) refresh();
        });
    }

    function handleReaction(postId: string, type: string) {
        startTransition(async () => {
            await toggleReactionAction(postId, type);
            refresh();
        });
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <nav style={{ marginBottom: "1.5rem" }}>
                <Link href="/discussion" className="discussion-breadcrumb-link" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none" }}>
                    ← Back to Discussion
                </Link>
            </nav>

            {/* Thread Header */}
            <div className="thread-header">
                <h1 className="thread-title">{thread.title}</h1>
                <div className="thread-meta">
                    <span>{thread.authorName ?? "Unknown"}</span>
                    <span>·</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    {thread.isPinned && <span>📌 Pinned</span>}
                    {thread.isLocked && <span>🔒 Locked</span>}
                    {thread.isHidden && <span>👁️‍🗨️ Hidden</span>}
                </div>

                {/* Admin Moderation Controls */}
                {isAdmin && (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                        <button
                            onClick={() => {
                                startTransition(async () => {
                                    await lockThreadAction(thread.id, !thread.isLocked);
                                    setThread((t) => ({ ...t, isLocked: !t.isLocked }));
                                });
                            }}
                            disabled={isPending}
                            className="discussion-btn-ghost"
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                        >
                            {thread.isLocked ? "🔓 Unlock" : "🔒 Lock"}
                        </button>
                        <button
                            onClick={() => {
                                startTransition(async () => {
                                    await pinThreadAction(thread.id, !thread.isPinned);
                                    setThread((t) => ({ ...t, isPinned: !t.isPinned }));
                                });
                            }}
                            disabled={isPending}
                            className="discussion-btn-ghost"
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                        >
                            {thread.isPinned ? "📌 Unpin" : "📌 Pin"}
                        </button>
                        <button
                            onClick={() => {
                                startTransition(async () => {
                                    await hideThreadAction(thread.id, !thread.isHidden);
                                    setThread((t) => ({ ...t, isHidden: !t.isHidden }));
                                });
                            }}
                            disabled={isPending}
                            className="discussion-btn-ghost"
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                        >
                            {thread.isHidden ? "👁️ Show" : "🙈 Hide"}
                        </button>
                    </div>
                )}
            </div>

            {/* Posts */}
            <div className="thread-posts">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className={`thread-post ${post.parentPostId ? "thread-post-reply" : ""} ${post.isDeleted ? "thread-post-deleted" : ""}`}
                    >
                        {/* Post header */}
                        <div className="thread-post-header">
                            <span className="thread-post-author">{post.authorName ?? "Unknown"}</span>
                            <span className="thread-post-time">{timeAgo(post.createdAt)}</span>
                            {post.editedAt && !post.isDeleted && (
                                <span className="thread-post-edited">(edited)</span>
                            )}
                            {post.postPositionSeconds !== null && !post.isDeleted && (
                                <span className="thread-post-timestamp">
                                    ⏱ {formatTimestamp(post.postPositionSeconds)}
                                </span>
                            )}
                        </div>

                        {/* Post body */}
                        {editingId === post.id ? (
                            <div className="thread-edit-form">
                                <textarea
                                    value={editBody}
                                    onChange={(e) => setEditBody(e.target.value)}
                                    maxLength={5000}
                                    rows={3}
                                    className="discussion-textarea"
                                />
                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                    <button onClick={() => setEditingId(null)} className="discussion-btn-ghost">Cancel</button>
                                    <button onClick={() => handleEdit(post.id)} disabled={isPending} className="discussion-btn-primary">Save</button>
                                </div>
                            </div>
                        ) : (
                            <p className="thread-post-body">{post.body}</p>
                        )}

                        {/* Actions */}
                        {!post.isDeleted && editingId !== post.id && (
                            <div className="thread-post-actions">
                                {/* Reactions */}
                                <div className="thread-reactions">
                                    {(["like", "helpful", "fire"] as const).map((type) => {
                                        const count = post.reactions.find((r) => r.type === type)?.count ?? 0;
                                        const active = post.userReactions.includes(type);
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => handleReaction(post.id, type)}
                                                className={`thread-reaction-btn ${active ? "thread-reaction-active" : ""}`}
                                            >
                                                {REACTION_ICONS[type]} {count > 0 && count}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Reply / Edit / Delete */}
                                <div className="thread-post-controls">
                                    {!thread.isLocked && (
                                        <button
                                            onClick={() => { setReplyToId(post.id); setReplyBody(""); }}
                                            className="thread-control-btn"
                                        >
                                            Reply
                                        </button>
                                    )}
                                    {post.userId === currentUserId && (
                                        <>
                                            <button
                                                onClick={() => { setEditingId(post.id); setEditBody(post.body); }}
                                                className="thread-control-btn"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="thread-control-btn thread-control-danger"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    {isAdmin && post.userId !== currentUserId && (
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="thread-control-btn thread-control-danger"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Load More */}
            {hasMore && (
                <button onClick={loadMore} disabled={isPending} className="discussion-load-more">
                    {isPending ? "Loading..." : "Load More Posts"}
                </button>
            )}

            {/* Reply Form */}
            {!thread.isLocked && (
                <div className="thread-reply-form">
                    {replyToId && (
                        <div className="thread-reply-indicator">
                            Replying to a post
                            <button onClick={() => setReplyToId(null)} className="thread-control-btn">✕</button>
                        </div>
                    )}
                    <textarea
                        placeholder="Write a reply..."
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        maxLength={5000}
                        rows={3}
                        className="discussion-textarea"
                    />
                    {error && <p className="discussion-error">{error}</p>}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            onClick={handleSubmitReply}
                            disabled={isPending || !replyBody.trim()}
                            className="discussion-btn-primary"
                        >
                            {isPending ? "Posting..." : "Post Reply"}
                        </button>
                    </div>
                </div>
            )}

            {thread.isLocked && (
                <div className="thread-locked-notice">
                    🔒 This thread is locked. No new replies.
                </div>
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

function formatTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}
