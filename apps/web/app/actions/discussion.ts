"use server";

// =============================================================================
// Discussion Server Actions
// =============================================================================
// 11 actions: CRUD for threads/posts, reactions, moderation.
// All use getServerIdentity(), validate UUIDs, enforce rate limits.
// Admin actions use requireAdmin().
// =============================================================================

import { getServerIdentity } from "./identity";
import { requireAdmin } from "./guards";
import {
    checkRateLimit,
    rateLimitKey,
    logEvent,
    createThread,
    getThreadsForEpisode,
    getThreadsForProgram,
    getThreadDetail,
    createPost,
    editPost,
    deletePost,
    toggleReaction,
    lockThread,
    hideThread,
    pinThread,
    hasAgreedToConduct,
    recordConductAgreement,
    getAIFlaggedContent,
    resolveContentFlag,
    DISCUSSION_LIMITS,
} from "@cols/services";

// ── Rate Limits ──

const RATE_LIMITS = {
    createThread: { maxRequests: 10, windowMs: 60 * 60 * 1000, name: "create_thread" },
    createPost: { maxRequests: 30, windowMs: 60 * 60 * 1000, name: "create_post" },
    editPost: { maxRequests: 30, windowMs: 60 * 60 * 1000, name: "edit_post" },
    toggleReaction: { maxRequests: 60, windowMs: 60 * 60 * 1000, name: "toggle_reaction" },
} as const;

// ── Validation ──

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUuid(id: string): boolean {
    return UUID_RE.test(id);
}

// ── Create Thread ──

export async function createThreadAction(input: {
    programId: string;
    moduleId?: string;
    episodeId?: string;
    title: string;
    body: string;
    threadType?: string;
}) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Not authenticated." };

    // UUID validation
    if (!isValidUuid(input.programId)) return { success: false, error: "Invalid program ID." };
    if (input.moduleId && !isValidUuid(input.moduleId)) return { success: false, error: "Invalid module ID." };
    if (input.episodeId && !isValidUuid(input.episodeId)) return { success: false, error: "Invalid episode ID." };

    // Title validation
    const title = input.title?.trim();
    if (!title || title.length === 0) return { success: false, error: "Title is required." };
    if (title.length > DISCUSSION_LIMITS.MAX_THREAD_TITLE) {
        return { success: false, error: `Title must be under ${DISCUSSION_LIMITS.MAX_THREAD_TITLE} characters.` };
    }

    // Body validation
    const body = input.body?.trim();
    if (!body || body.length === 0) return { success: false, error: "Post body is required." };
    if (body.length > DISCUSSION_LIMITS.MAX_POST_BODY) {
        return { success: false, error: `Post must be under ${DISCUSSION_LIMITS.MAX_POST_BODY} characters.` };
    }

    // Rate limit
    const rl = checkRateLimit(rateLimitKey("create_thread", identity.userId), RATE_LIMITS.createThread);
    if (!rl.allowed) return { success: false, error: "Too many threads created. Try again later." };

    try {
        const result = await createThread({
            userId: identity.userId,
            programId: input.programId,
            title,
            firstPostBody: body,
            moduleId: input.moduleId,
            episodeId: input.episodeId,
            threadType: input.threadType,
        });

        await logEvent(
            identity.userId,
            identity.organizationId,
            "thread_created",
            "thread",
            result.threadId,
            {
                program_id: input.programId,
                module_id: input.moduleId ?? null,
                episode_id: input.episodeId ?? null,
            },
        );

        return { success: true, threadId: result.threadId, flagged: result.flagged };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to create thread." };
    }
}

// ── Get Episode Threads ──

export async function getEpisodeThreadsAction(episodeId: string, page: number = 1) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, threads: [], total: 0 };
    if (!isValidUuid(episodeId)) return { success: false, threads: [], total: 0 };

    const isAdmin = identity.role === "owner" || identity.role === "admin";
    const result = await getThreadsForEpisode(episodeId, page, isAdmin);
    return { success: true, ...result };
}

// ── Get Program Threads ──

export async function getProgramThreadsAction(programId: string, page: number = 1, threadType?: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, threads: [], total: 0 };
    if (!isValidUuid(programId)) return { success: false, threads: [], total: 0 };

    const isAdmin = identity.role === "owner" || identity.role === "admin";
    const result = await getThreadsForProgram(programId, page, isAdmin, threadType);
    return { success: true, ...result };
}

// ── Get Thread Detail ──

export async function getThreadDetailAction(threadId: string, page: number = 1) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, data: null };
    if (!isValidUuid(threadId)) return { success: false, data: null };

    const isAdmin = identity.role === "owner" || identity.role === "admin";
    const result = await getThreadDetail(threadId, identity.userId, page, isAdmin);
    return { success: true, data: result };
}

// ── Create Post ──

export async function createPostAction(input: {
    threadId: string;
    body: string;
    parentPostId?: string;
    postPositionSeconds?: number;
}) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Not authenticated." };

    if (!isValidUuid(input.threadId)) return { success: false, error: "Invalid thread ID." };
    if (input.parentPostId && !isValidUuid(input.parentPostId)) {
        return { success: false, error: "Invalid parent post ID." };
    }

    const body = input.body?.trim();
    if (!body || body.length === 0) return { success: false, error: "Post body is required." };
    if (body.length > DISCUSSION_LIMITS.MAX_POST_BODY) {
        return { success: false, error: `Post must be under ${DISCUSSION_LIMITS.MAX_POST_BODY} characters.` };
    }

    const rl = checkRateLimit(rateLimitKey("create_post", identity.userId), RATE_LIMITS.createPost);
    if (!rl.allowed) return { success: false, error: "Too many posts. Try again later." };

    try {
        const result = await createPost(
            identity.userId,
            input.threadId,
            body,
            input.parentPostId,
            input.postPositionSeconds,
        );

        await logEvent(
            identity.userId,
            identity.organizationId,
            "post_created",
            "post",
            result.postId,
            { thread_id: input.threadId, parent_post_id: input.parentPostId ?? null },
        );

        return { success: true, postId: result.postId };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to create post." };
    }
}

// ── Edit Post ──

export async function editPostAction(postId: string, body: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Not authenticated." };
    if (!isValidUuid(postId)) return { success: false, error: "Invalid post ID." };

    const trimmed = body?.trim();
    if (!trimmed || trimmed.length === 0) return { success: false, error: "Post body is required." };
    if (trimmed.length > DISCUSSION_LIMITS.MAX_POST_BODY) {
        return { success: false, error: `Post must be under ${DISCUSSION_LIMITS.MAX_POST_BODY} characters.` };
    }

    const rl = checkRateLimit(rateLimitKey("edit_post", identity.userId), RATE_LIMITS.editPost);
    if (!rl.allowed) return { success: false, error: "Too many edits. Try again later." };

    try {
        await editPost(identity.userId, postId, trimmed);
        await logEvent(identity.userId, identity.organizationId, "post_edited", "post", postId, {});
        return { success: true };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to edit post." };
    }
}

// ── Delete Post ──

export async function deletePostAction(postId: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Not authenticated." };
    if (!isValidUuid(postId)) return { success: false, error: "Invalid post ID." };

    const isAdmin = identity.role === "owner" || identity.role === "admin";

    try {
        await deletePost(identity.userId, postId, isAdmin);
        await logEvent(identity.userId, identity.organizationId, "post_deleted", "post", postId, {});
        return { success: true };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to delete post." };
    }
}

// ── Toggle Reaction ──

export async function toggleReactionAction(postId: string, reactionType: string) {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Not authenticated." };
    if (!isValidUuid(postId)) return { success: false, error: "Invalid post ID." };

    if (!DISCUSSION_LIMITS.VALID_REACTIONS.includes(reactionType as "like" | "helpful" | "fire")) {
        return { success: false, error: "Invalid reaction type." };
    }

    const rl = checkRateLimit(rateLimitKey("toggle_reaction", identity.userId), RATE_LIMITS.toggleReaction);
    if (!rl.allowed) return { success: false, error: "Too many reactions. Try again later." };

    try {
        const result = await toggleReaction(identity.userId, postId, reactionType);
        await logEvent(
            identity.userId,
            identity.organizationId,
            "reaction_toggled",
            "post",
            postId,
            { reaction_type: reactionType, added: result.added },
        );
        return { success: true, added: result.added };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to toggle reaction." };
    }
}

// ── Admin: Lock Thread ──

export async function lockThreadAction(threadId: string, locked: boolean) {
    const identity = await requireAdmin();
    if (!isValidUuid(threadId)) return { success: false, error: "Invalid thread ID." };

    await lockThread(threadId, locked);
    await logEvent(identity.userId, identity.organizationId, "thread_locked", "thread", threadId, { locked });
    return { success: true };
}

// ── Admin: Hide Thread ──

export async function hideThreadAction(threadId: string, hidden: boolean) {
    const identity = await requireAdmin();
    if (!isValidUuid(threadId)) return { success: false, error: "Invalid thread ID." };

    await hideThread(threadId, hidden);
    await logEvent(identity.userId, identity.organizationId, "thread_hidden", "thread", threadId, { hidden });
    return { success: true };
}

// ── Admin: Pin Thread ──

export async function pinThreadAction(threadId: string, pinned: boolean) {
    const identity = await requireAdmin();
    if (!isValidUuid(threadId)) return { success: false, error: "Invalid thread ID." };

    await pinThread(threadId, pinned);
    await logEvent(identity.userId, identity.organizationId, "thread_pinned", "thread", threadId, { pinned });
    return { success: true };
}

// ── Conduct Agreement ──

export async function checkConductAction() {
    const identity = await getServerIdentity();
    if (!identity) return { agreed: false };
    const agreed = await hasAgreedToConduct(identity.userId);
    return { agreed };
}

export async function agreeToConductAction() {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Not authenticated." };
    await recordConductAgreement(identity.userId);
    await logEvent(identity.userId, identity.organizationId, "conduct_agreed", "user", identity.userId, {});
    return { success: true };
}

// ── Admin: Flagged Content Queue ──

export async function getFlaggedContentAction() {
    await requireAdmin();
    const items = await getAIFlaggedContent();
    return { success: true, items };
}

export async function resolveFlagAction(id: string, type: "thread" | "post", accepted: boolean) {
    const identity = await requireAdmin();
    if (!isValidUuid(id)) return { success: false, error: "Invalid ID." };
    await resolveContentFlag(id, type, accepted);
    await logEvent(identity.userId, identity.organizationId, "flag_resolved", type, id, { accepted });
    return { success: true };
}
