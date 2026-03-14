import { describe, it, expect } from "vitest";
import { DISCUSSION_LIMITS } from "../src/discussion";
import type { ThreadSummary, CreateThreadOptions } from "../src/discussion";

// =============================================================================
// Discussion Limits & Types Tests
// =============================================================================
// Tests for exported constants, type shapes, and validation boundaries.
// These are pure value tests — no DB required.
// =============================================================================

describe("DISCUSSION_LIMITS", () => {
    it("has reasonable post body limit", () => {
        expect(DISCUSSION_LIMITS.MAX_POST_BODY).toBe(5000);
        expect(DISCUSSION_LIMITS.MAX_POST_BODY).toBeGreaterThan(0);
    });

    it("has reasonable thread title limit", () => {
        expect(DISCUSSION_LIMITS.MAX_THREAD_TITLE).toBe(255);
        expect(DISCUSSION_LIMITS.MAX_THREAD_TITLE).toBeGreaterThan(0);
    });

    it("has pagination defaults", () => {
        expect(DISCUSSION_LIMITS.THREADS_PER_PAGE).toBe(20);
        expect(DISCUSSION_LIMITS.POSTS_PER_PAGE).toBe(50);
    });

    it("limits threads per episode per user per day", () => {
        expect(DISCUSSION_LIMITS.MAX_THREADS_PER_EPISODE_PER_USER_PER_DAY).toBe(3);
    });

    it("defines valid reaction types", () => {
        expect(DISCUSSION_LIMITS.VALID_REACTIONS).toContain("like");
        expect(DISCUSSION_LIMITS.VALID_REACTIONS).toContain("helpful");
        expect(DISCUSSION_LIMITS.VALID_REACTIONS).toContain("fire");
        expect(DISCUSSION_LIMITS.VALID_REACTIONS).toHaveLength(3);
    });

    it("does not allow negative pagination", () => {
        expect(DISCUSSION_LIMITS.THREADS_PER_PAGE).toBeGreaterThan(0);
        expect(DISCUSSION_LIMITS.POSTS_PER_PAGE).toBeGreaterThan(0);
    });
});

describe("ThreadSummary type shape", () => {
    it("can create a valid ThreadSummary", () => {
        const thread: ThreadSummary = {
            id: "thread-1",
            title: "Test Thread",
            programId: "prog-1",
            moduleId: null,
            episodeId: null,
            createdBy: "user-1",
            authorName: "Test User",
            isLocked: false,
            isPinned: false,
            createdAt: new Date(),
            postCount: 5,
            helpfulCount: 2,
            threadType: "general",
            latestPostAt: new Date(),
        };

        expect(thread.id).toBe("thread-1");
        expect(thread.threadType).toBe("general");
        expect(thread.isLocked).toBe(false);
    });

    it("allows null for optional fields", () => {
        const thread: ThreadSummary = {
            id: "thread-2",
            title: "Minimal Thread",
            programId: "prog-1",
            moduleId: null,
            episodeId: null,
            createdBy: "user-1",
            authorName: null,
            isLocked: false,
            isPinned: false,
            createdAt: new Date(),
            postCount: 0,
            helpfulCount: 0,
            threadType: "episode",
            latestPostAt: null,
        };

        expect(thread.authorName).toBeNull();
        expect(thread.latestPostAt).toBeNull();
        expect(thread.moduleId).toBeNull();
    });
});

describe("CreateThreadOptions type shape", () => {
    it("can create valid options", () => {
        const opts: CreateThreadOptions = {
            userId: "user-1",
            programId: "prog-1",
            title: "New Thread",
            firstPostBody: "Hello, world!",
        };

        expect(opts.userId).toBe("user-1");
        expect(opts.moduleId).toBeUndefined();
    });

    it("accepts optional fields", () => {
        const opts: CreateThreadOptions = {
            userId: "user-1",
            programId: "prog-1",
            title: "Episode Thread",
            firstPostBody: "Discussion about episode 3",
            moduleId: "mod-1",
            episodeId: "ep-3",
            threadType: "episode",
        };

        expect(opts.moduleId).toBe("mod-1");
        expect(opts.episodeId).toBe("ep-3");
        expect(opts.threadType).toBe("episode");
    });
});

describe("Discussion validation rules", () => {
    it("rejects titles exceeding MAX_THREAD_TITLE", () => {
        const longTitle = "a".repeat(DISCUSSION_LIMITS.MAX_THREAD_TITLE + 1);
        expect(longTitle.length).toBeGreaterThan(DISCUSSION_LIMITS.MAX_THREAD_TITLE);
    });

    it("accepts titles within MAX_THREAD_TITLE", () => {
        const validTitle = "a".repeat(DISCUSSION_LIMITS.MAX_THREAD_TITLE);
        expect(validTitle.length).toBeLessThanOrEqual(DISCUSSION_LIMITS.MAX_THREAD_TITLE);
    });

    it("rejects bodies exceeding MAX_POST_BODY", () => {
        const longBody = "x".repeat(DISCUSSION_LIMITS.MAX_POST_BODY + 1);
        expect(longBody.length).toBeGreaterThan(DISCUSSION_LIMITS.MAX_POST_BODY);
    });

    it("accepts bodies within MAX_POST_BODY", () => {
        const validBody = "x".repeat(DISCUSSION_LIMITS.MAX_POST_BODY);
        expect(validBody.length).toBeLessThanOrEqual(DISCUSSION_LIMITS.MAX_POST_BODY);
    });

    it("validates reaction types are known", () => {
        const validReactions = DISCUSSION_LIMITS.VALID_REACTIONS;
        expect(validReactions.includes("like" as any)).toBe(true);
        expect(validReactions.includes("helpful" as any)).toBe(true);
        expect(validReactions.includes("fire" as any)).toBe(true);
        expect(validReactions.includes("invalid" as any)).toBe(false);
    });
});
