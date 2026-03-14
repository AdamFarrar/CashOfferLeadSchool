// =============================================================================
// Discussion Service — Phase 4 + Security Hardening
// =============================================================================
// Content-anchored discussion system. Every thread requires program_id.
// Read-path rules:
//   - Hidden threads excluded from non-admin reads
//   - Locked threads visible but reject new posts/replies
//   - Soft-deleted posts shown as [deleted] placeholders
//   - All list queries paginated by default
//
// Security hardening additions:
//   - 3 threads per episode per user per day
//   - Thread ordering by engagement (pinned → helpful → posts → recent)
//   - Thread stats caching (no live COUNT on thread list)
// =============================================================================

import { db } from "@cols/database/client";
import {
    contentThread,
    contentPost,
    contentReaction,
    threadStats,
    discussionConductAgreement,
    program,
    user,
} from "@cols/database/schema";
import { eq, and, asc, desc, sql, inArray, count, gte, isNotNull } from "drizzle-orm";

// ── Constants ──

export const DISCUSSION_LIMITS = {
    MAX_POST_BODY: 5000,
    MAX_THREAD_TITLE: 255,
    THREADS_PER_PAGE: 20,
    POSTS_PER_PAGE: 50,
    MAX_THREADS_PER_EPISODE_PER_USER_PER_DAY: 3,
    VALID_REACTIONS: ["like", "helpful", "fire"] as const,
};

type ReactionType = (typeof DISCUSSION_LIMITS.VALID_REACTIONS)[number];

// ── Types ──

export interface ThreadSummary {
    id: string;
    title: string;
    programId: string;
    moduleId: string | null;
    episodeId: string | null;
    createdBy: string;
    authorName: string | null;
    isLocked: boolean;
    isPinned: boolean;
    createdAt: Date;
    postCount: number;
    helpfulCount: number;
    threadType: string;
    latestPostAt: Date | null;
}

export interface ThreadDetailResult {
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
}

export interface PostWithReactions {
    id: string;
    threadId: string;
    userId: string;
    authorName: string | null;
    parentPostId: string | null;
    postPositionSeconds: number | null;
    body: string;
    isDeleted: boolean;
    createdAt: Date;
    editedAt: Date | null;
    reactions: { type: string; count: number }[];
    userReactions: string[]; // reaction types the viewer has applied
}

// ── Stats Helpers ──

async function initThreadStats(threadId: string): Promise<void> {
    await db.insert(threadStats).values({
        threadId,
        postCount: 1, // first post created with thread
        helpfulCount: 0,
        participantCount: 1,
        lastActivityAt: new Date(),
    });
}

async function incrementPostCount(threadId: string, userId: string): Promise<void> {
    // Check if user is a new participant
    const existing = await db
        .select({ id: contentPost.id })
        .from(contentPost)
        .where(and(eq(contentPost.threadId, threadId), eq(contentPost.userId, userId)))
        .limit(1);

    const isNewParticipant = existing.length === 0;

    await db
        .update(threadStats)
        .set({
            postCount: sql`${threadStats.postCount} + 1`,
            lastActivityAt: new Date(),
            ...(isNewParticipant ? { participantCount: sql`${threadStats.participantCount} + 1` } : {}),
        })
        .where(eq(threadStats.threadId, threadId));
}

async function updateHelpfulCount(threadId: string, delta: number): Promise<void> {
    await db
        .update(threadStats)
        .set({ helpfulCount: sql`GREATEST(0, ${threadStats.helpfulCount} + ${delta})` })
        .where(eq(threadStats.threadId, threadId));
}

// ── Conduct Agreement ──

export async function hasAgreedToConduct(userId: string): Promise<boolean> {
    const rows = await db
        .select({ id: discussionConductAgreement.id })
        .from(discussionConductAgreement)
        .where(eq(discussionConductAgreement.userId, userId))
        .limit(1);
    return rows.length > 0;
}

export async function recordConductAgreement(userId: string): Promise<void> {
    await db
        .insert(discussionConductAgreement)
        .values({ userId })
        .onConflictDoNothing();
}

// ── Create Thread ──

export async function createThread(
    userId: string,
    programId: string,
    title: string,
    firstPostBody: string,
    moduleId?: string | null,
    episodeId?: string | null,
    threadType?: string,
): Promise<{ threadId: string; postId: string; flagged: boolean }> {
    // Validate program exists
    const programs = await db
        .select({ id: program.id })
        .from(program)
        .where(eq(program.id, programId))
        .limit(1);
    if (programs.length === 0) throw new Error("Program not found.");

    // Step 5: Enforce 3 threads per episode per user per day
    if (episodeId) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [recentCount] = await db
            .select({ total: count(contentThread.id) })
            .from(contentThread)
            .where(
                and(
                    eq(contentThread.episodeId, episodeId),
                    eq(contentThread.createdBy, userId),
                    gte(contentThread.createdAt, oneDayAgo),
                ),
            );
        if (Number(recentCount.total) >= DISCUSSION_LIMITS.MAX_THREADS_PER_EPISODE_PER_USER_PER_DAY) {
            throw new Error("You can create a maximum of 3 threads per episode per day.");
        }
    }

    // AI content moderation (fail-open)
    let flagReason: string | null = null;
    try {
        const { moderateContent } = await import("@cols/ai");
        const [titleResult, bodyResult] = await Promise.all([
            moderateContent(title, "thread_title"),
            moderateContent(firstPostBody, "post_body"),
        ]);
        if (titleResult.flagged) flagReason = `Title: ${titleResult.reason}`;
        else if (bodyResult.flagged) flagReason = `Body: ${bodyResult.reason}`;
    } catch (err) {
        console.error("[createThread] AI moderation unavailable:", err);
    }

    // Resolve thread type
    const resolvedType = threadType ?? (episodeId ? "episode" : "general");

    // Create thread
    const [thread] = await db
        .insert(contentThread)
        .values({
            programId,
            moduleId: moduleId ?? null,
            episodeId: episodeId ?? null,
            title: title.trim(),
            threadType: resolvedType,
            createdBy: userId,
            isHidden: flagReason !== null, // Auto-hide flagged threads
            flagReason,
        })
        .returning({ id: contentThread.id });

    // Create first post
    const [post] = await db
        .insert(contentPost)
        .values({
            threadId: thread.id,
            userId,
            body: firstPostBody.trim(),
        })
        .returning({ id: contentPost.id });

    // Init stats row
    await initThreadStats(thread.id);

    return { threadId: thread.id, postId: post.id, flagged: flagReason !== null };
}

// ── Get Threads for Episode ──

export async function getThreadsForEpisode(
    episodeId: string,
    page: number = 1,
    isAdmin: boolean = false,
): Promise<{ threads: ThreadSummary[]; total: number }> {
    const limit = DISCUSSION_LIMITS.THREADS_PER_PAGE;
    const offset = (page - 1) * limit;

    const conditions = [eq(contentThread.episodeId, episodeId)];
    if (!isAdmin) {
        conditions.push(eq(contentThread.isHidden, false));
    }

    // Step 10: Engagement-based ordering via thread_stats
    const threads = await db
        .select({
            id: contentThread.id,
            title: contentThread.title,
            programId: contentThread.programId,
            moduleId: contentThread.moduleId,
            episodeId: contentThread.episodeId,
            createdBy: contentThread.createdBy,
            authorName: user.name,
            isLocked: contentThread.isLocked,
            isPinned: contentThread.isPinned,
            threadType: contentThread.threadType,
            createdAt: contentThread.createdAt,
            postCount: threadStats.postCount,
            helpfulCount: threadStats.helpfulCount,
            lastActivityAt: threadStats.lastActivityAt,
        })
        .from(contentThread)
        .leftJoin(user, eq(contentThread.createdBy, user.id))
        .leftJoin(threadStats, eq(contentThread.id, threadStats.threadId))
        .where(and(...conditions))
        .orderBy(
            desc(contentThread.isPinned),
            desc(sql`COALESCE(${threadStats.helpfulCount}, 0)`),
            desc(sql`COALESCE(${threadStats.postCount}, 0)`),
            desc(contentThread.createdAt),
        )
        .limit(limit)
        .offset(offset);

    // Total count
    const [totalResult] = await db
        .select({ total: count(contentThread.id) })
        .from(contentThread)
        .where(and(...conditions));

    return {
        threads: threads.map((t) => ({
            ...t,
            postCount: Number(t.postCount ?? 0),
            helpfulCount: Number(t.helpfulCount ?? 0),
            latestPostAt: t.lastActivityAt ?? null,
        })),
        total: Number(totalResult.total),
    };
}

// ── Get Threads for Program ──

export async function getThreadsForProgram(
    programId: string,
    page: number = 1,
    isAdmin: boolean = false,
    threadTypeFilter?: string,
): Promise<{ threads: ThreadSummary[]; total: number }> {
    const limit = DISCUSSION_LIMITS.THREADS_PER_PAGE;
    const offset = (page - 1) * limit;

    const conditions = [eq(contentThread.programId, programId)];
    if (!isAdmin) {
        conditions.push(eq(contentThread.isHidden, false));
    }
    if (threadTypeFilter) {
        conditions.push(eq(contentThread.threadType, threadTypeFilter));
    }

    const threads = await db
        .select({
            id: contentThread.id,
            title: contentThread.title,
            programId: contentThread.programId,
            moduleId: contentThread.moduleId,
            episodeId: contentThread.episodeId,
            createdBy: contentThread.createdBy,
            authorName: user.name,
            isLocked: contentThread.isLocked,
            isPinned: contentThread.isPinned,
            threadType: contentThread.threadType,
            createdAt: contentThread.createdAt,
            postCount: threadStats.postCount,
            helpfulCount: threadStats.helpfulCount,
            lastActivityAt: threadStats.lastActivityAt,
        })
        .from(contentThread)
        .leftJoin(user, eq(contentThread.createdBy, user.id))
        .leftJoin(threadStats, eq(contentThread.id, threadStats.threadId))
        .where(and(...conditions))
        .orderBy(
            desc(contentThread.isPinned),
            desc(sql`COALESCE(${threadStats.helpfulCount}, 0)`),
            desc(sql`COALESCE(${threadStats.postCount}, 0)`),
            desc(contentThread.createdAt),
        )
        .limit(limit)
        .offset(offset);

    const [totalResult] = await db
        .select({ total: count(contentThread.id) })
        .from(contentThread)
        .where(and(...conditions));

    return {
        threads: threads.map((t) => ({
            ...t,
            threadType: t.threadType ?? "general",
            postCount: Number(t.postCount ?? 0),
            helpfulCount: Number(t.helpfulCount ?? 0),
            latestPostAt: t.lastActivityAt ?? null,
        })),
        total: Number(totalResult.total),
    };
}

// ── Get Thread Detail ──

export async function getThreadDetail(
    threadId: string,
    viewerUserId: string,
    page: number = 1,
    isAdmin: boolean = false,
): Promise<ThreadDetailResult | null> {
    const threads = await db
        .select({
            id: contentThread.id,
            title: contentThread.title,
            programId: contentThread.programId,
            moduleId: contentThread.moduleId,
            episodeId: contentThread.episodeId,
            createdBy: contentThread.createdBy,
            authorName: user.name,
            isLocked: contentThread.isLocked,
            isPinned: contentThread.isPinned,
            isHidden: contentThread.isHidden,
            createdAt: contentThread.createdAt,
        })
        .from(contentThread)
        .leftJoin(user, eq(contentThread.createdBy, user.id))
        .where(eq(contentThread.id, threadId))
        .limit(1);

    if (threads.length === 0) return null;
    const thread = threads[0];

    // Hidden threads only visible to admins
    if (thread.isHidden && !isAdmin) return null;

    const limit = DISCUSSION_LIMITS.POSTS_PER_PAGE;
    const offset = (page - 1) * limit;

    const posts = await db
        .select({
            id: contentPost.id,
            threadId: contentPost.threadId,
            userId: contentPost.userId,
            authorName: user.name,
            parentPostId: contentPost.parentPostId,
            postPositionSeconds: contentPost.postPositionSeconds,
            body: contentPost.body,
            isDeleted: contentPost.isDeleted,
            createdAt: contentPost.createdAt,
            editedAt: contentPost.editedAt,
        })
        .from(contentPost)
        .leftJoin(user, eq(contentPost.userId, user.id))
        .where(eq(contentPost.threadId, threadId))
        .orderBy(asc(contentPost.createdAt))
        .limit(limit)
        .offset(offset);

    const [totalResult] = await db
        .select({ total: count(contentPost.id) })
        .from(contentPost)
        .where(eq(contentPost.threadId, threadId));

    const postIds = posts.map((p) => p.id);
    const reactions = postIds.length > 0
        ? await db
            .select({
                postId: contentReaction.postId,
                reactionType: contentReaction.reactionType,
                userId: contentReaction.userId,
            })
            .from(contentReaction)
            .where(inArray(contentReaction.postId, postIds))
        : [];

    const reactionMap = new Map<string, { counts: Map<string, number>; userReactions: string[] }>();
    for (const r of reactions) {
        if (!reactionMap.has(r.postId)) {
            reactionMap.set(r.postId, { counts: new Map(), userReactions: [] });
        }
        const entry = reactionMap.get(r.postId)!;
        entry.counts.set(r.reactionType, (entry.counts.get(r.reactionType) ?? 0) + 1);
        if (r.userId === viewerUserId) {
            entry.userReactions.push(r.reactionType);
        }
    }

    const postsWithReactions: PostWithReactions[] = posts.map((p) => {
        const rData = reactionMap.get(p.id);
        return {
            ...p,
            body: p.isDeleted ? "[This post has been deleted]" : p.body,
            reactions: rData
                ? Array.from(rData.counts.entries()).map(([type, cnt]) => ({ type, count: cnt }))
                : [],
            userReactions: rData?.userReactions ?? [],
        };
    });

    return {
        thread,
        posts: postsWithReactions,
        totalPosts: Number(totalResult.total),
    };
}

// ── Create Post ──

export async function createPost(
    userId: string,
    threadId: string,
    body: string,
    parentPostId?: string | null,
    postPositionSeconds?: number | null,
): Promise<{ postId: string; flagged: boolean }> {
    const threads = await db
        .select({ id: contentThread.id, isLocked: contentThread.isLocked })
        .from(contentThread)
        .where(eq(contentThread.id, threadId))
        .limit(1);

    if (threads.length === 0) throw new Error("Thread not found.");
    if (threads[0].isLocked) throw new Error("Thread is locked — no new posts.");

    // AI content moderation (fail-open)
    let flagReason: string | null = null;
    try {
        const { moderateContent } = await import("@cols/ai");
        const result = await moderateContent(body, "post_body");
        if (result.flagged) flagReason = result.reason;
    } catch (err) {
        console.error("[createPost] AI moderation unavailable:", err);
    }

    const [post] = await db
        .insert(contentPost)
        .values({
            threadId,
            userId,
            parentPostId: parentPostId ?? null,
            postPositionSeconds: postPositionSeconds ?? null,
            body: body.trim(),
            isDeleted: flagReason !== null, // Auto-hide flagged posts
            flagReason,
        })
        .returning({ id: contentPost.id });

    // Update stats
    await incrementPostCount(threadId, userId);

    return { postId: post.id, flagged: flagReason !== null };
}

// ── Edit Post ──

export async function editPost(
    userId: string,
    postId: string,
    body: string,
): Promise<void> {
    const posts = await db
        .select({ id: contentPost.id, userId: contentPost.userId, isDeleted: contentPost.isDeleted })
        .from(contentPost)
        .where(eq(contentPost.id, postId))
        .limit(1);

    if (posts.length === 0) throw new Error("Post not found.");
    if (posts[0].userId !== userId) throw new Error("Not authorized to edit this post.");
    if (posts[0].isDeleted) throw new Error("Cannot edit a deleted post.");

    await db
        .update(contentPost)
        .set({ body: body.trim(), editedAt: new Date() })
        .where(eq(contentPost.id, postId));
}

// ── Delete Post (soft) ──

export async function deletePost(
    userId: string,
    postId: string,
    isAdmin: boolean = false,
): Promise<void> {
    const posts = await db
        .select({ id: contentPost.id, userId: contentPost.userId })
        .from(contentPost)
        .where(eq(contentPost.id, postId))
        .limit(1);

    if (posts.length === 0) throw new Error("Post not found.");
    if (posts[0].userId !== userId && !isAdmin) throw new Error("Not authorized to delete this post.");

    await db
        .update(contentPost)
        .set({ isDeleted: true })
        .where(eq(contentPost.id, postId));
}

// ── Toggle Reaction ──

export async function toggleReaction(
    userId: string,
    postId: string,
    reactionType: string,
): Promise<{ added: boolean }> {
    if (!DISCUSSION_LIMITS.VALID_REACTIONS.includes(reactionType as ReactionType)) {
        throw new Error("Invalid reaction type.");
    }

    const existing = await db
        .select({ id: contentReaction.id })
        .from(contentReaction)
        .where(
            and(
                eq(contentReaction.postId, postId),
                eq(contentReaction.userId, userId),
                eq(contentReaction.reactionType, reactionType),
            ),
        )
        .limit(1);

    // Find thread for stats update
    const postRows = await db
        .select({ threadId: contentPost.threadId })
        .from(contentPost)
        .where(eq(contentPost.id, postId))
        .limit(1);
    const postThreadId = postRows.length > 0 ? postRows[0].threadId : null;

    if (existing.length > 0) {
        await db
            .delete(contentReaction)
            .where(eq(contentReaction.id, existing[0].id));
        // Decrement helpful count if applicable
        if (reactionType === "helpful" && postThreadId) {
            await updateHelpfulCount(postThreadId, -1);
        }
        return { added: false };
    } else {
        await db
            .insert(contentReaction)
            .values({ postId, userId, reactionType });
        // Increment helpful count if applicable
        if (reactionType === "helpful" && postThreadId) {
            await updateHelpfulCount(postThreadId, 1);
        }
        return { added: true };
    }
}

// ── Moderation: Lock Thread ──

export async function lockThread(threadId: string, locked: boolean): Promise<void> {
    await db
        .update(contentThread)
        .set({ isLocked: locked })
        .where(eq(contentThread.id, threadId));
}

// ── Moderation: Hide Thread ──

export async function hideThread(threadId: string, hidden: boolean): Promise<void> {
    await db
        .update(contentThread)
        .set({ isHidden: hidden })
        .where(eq(contentThread.id, threadId));
}

// ── Moderation: Pin Thread ──

export async function pinThread(threadId: string, pinned: boolean): Promise<void> {
    await db
        .update(contentThread)
        .set({ isPinned: pinned })
        .where(eq(contentThread.id, threadId));
}

// ── Thread Counts for Episode Cards ──

export async function getThreadCountsForEpisodes(
    episodeIds: string[],
): Promise<Map<string, number>> {
    if (episodeIds.length === 0) return new Map();

    const results = await db
        .select({
            episodeId: contentThread.episodeId,
            threadCount: count(contentThread.id),
        })
        .from(contentThread)
        .where(
            and(
                inArray(contentThread.episodeId, episodeIds),
                eq(contentThread.isHidden, false),
            ),
        )
        .groupBy(contentThread.episodeId);

    return new Map(
        results.map((r) => [r.episodeId!, Number(r.threadCount)]),
    );
}

// ── AI Flagged Content (Admin Queue) ──

export interface FlaggedItem {
    id: string;
    type: "thread" | "post";
    title: string | null;
    body: string | null;
    flagReason: string;
    authorName: string | null;
    createdAt: Date;
}

export async function getAIFlaggedContent(): Promise<FlaggedItem[]> {
    const flaggedThreads = await db
        .select({
            id: contentThread.id,
            title: contentThread.title,
            flagReason: contentThread.flagReason,
            authorName: user.name,
            createdAt: contentThread.createdAt,
        })
        .from(contentThread)
        .leftJoin(user, eq(contentThread.createdBy, user.id))
        .where(isNotNull(contentThread.flagReason))
        .orderBy(desc(contentThread.createdAt))
        .limit(50);

    const flaggedPosts = await db
        .select({
            id: contentPost.id,
            body: contentPost.body,
            flagReason: contentPost.flagReason,
            authorName: user.name,
            createdAt: contentPost.createdAt,
        })
        .from(contentPost)
        .leftJoin(user, eq(contentPost.userId, user.id))
        .where(isNotNull(contentPost.flagReason))
        .orderBy(desc(contentPost.createdAt))
        .limit(50);

    const items: FlaggedItem[] = [
        ...flaggedThreads.map((t) => ({
            id: t.id,
            type: "thread" as const,
            title: t.title,
            body: null,
            flagReason: t.flagReason!,
            authorName: t.authorName,
            createdAt: t.createdAt,
        })),
        ...flaggedPosts.map((p) => ({
            id: p.id,
            type: "post" as const,
            title: null,
            body: p.body,
            flagReason: p.flagReason!,
            authorName: p.authorName,
            createdAt: p.createdAt,
        })),
    ];

    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return items;
}

export async function resolveContentFlag(
    id: string,
    type: "thread" | "post",
    accepted: boolean,
): Promise<void> {
    if (type === "thread") {
        await db
            .update(contentThread)
            .set({
                flagReason: null,
                isHidden: !accepted, // If rejected, keep hidden; if accepted, unhide
            })
            .where(eq(contentThread.id, id));
    } else {
        await db
            .update(contentPost)
            .set({
                flagReason: null,
                isDeleted: !accepted,
            })
            .where(eq(contentPost.id, id));
    }
}
