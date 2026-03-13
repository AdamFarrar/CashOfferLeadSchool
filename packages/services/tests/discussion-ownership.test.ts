// =============================================================================
// Tests: Discussion Ownership — Post-Audit Fix 4
// =============================================================================
// Verifies editPost/deletePost ownership checks using the actual service
// with a mocked database chaining pattern.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from "vitest";

// Build a chainable mock: db.select().from().where().limit() → resolves
function buildSelectChain(rows: unknown[]) {
    return {
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(rows),
            }),
        }),
    };
}

function buildUpdateChain() {
    return {
        set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
        }),
    };
}

// Mock the drizzle operators
vi.mock("drizzle-orm", () => ({
    eq: vi.fn((_col: unknown, val: unknown) => `eq_${val}`),
    and: vi.fn((...args: unknown[]) => `and_${args.join("_")}`),
    desc: vi.fn((col: unknown) => `desc_${col}`),
    asc: vi.fn((col: unknown) => `asc_${col}`),
    sql: vi.fn((strings: TemplateStringsArray, ...vals: unknown[]) => `sql_${vals.join("_")}`),
    inArray: vi.fn(),
    count: vi.fn().mockReturnValue("count"),
    isNull: vi.fn(),
    ne: vi.fn(),
    or: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    lt: vi.fn(),
    gt: vi.fn(),
    like: vi.fn(),
    ilike: vi.fn(),
}));

// Mock schema tables with column accessors
vi.mock("@cocs/database/schema", () => {
    const makeCol = (name: string) => name;
    return {
        contentPost: {
            id: makeCol("cp.id"),
            threadId: makeCol("cp.thread_id"),
            userId: makeCol("cp.user_id"),
            body: makeCol("cp.body"),
            isDeleted: makeCol("cp.is_deleted"),
            editedAt: makeCol("cp.edited_at"),
            parentPostId: makeCol("cp.parent_post_id"),
            postPositionSeconds: makeCol("cp.post_position_seconds"),
            createdAt: makeCol("cp.created_at"),
        },
        contentThread: {
            id: makeCol("ct.id"),
            programId: makeCol("ct.program_id"),
            moduleId: makeCol("ct.module_id"),
            episodeId: makeCol("ct.episode_id"),
            title: makeCol("ct.title"),
            createdBy: makeCol("ct.created_by"),
            isLocked: makeCol("ct.is_locked"),
            isPinned: makeCol("ct.is_pinned"),
            isHidden: makeCol("ct.is_hidden"),
            createdAt: makeCol("ct.created_at"),
        },
        contentReaction: {
            id: makeCol("cr.id"),
            postId: makeCol("cr.post_id"),
            userId: makeCol("cr.user_id"),
            reactionType: makeCol("cr.reaction_type"),
        },
        threadStats: {
            threadId: makeCol("ts.thread_id"),
            postCount: makeCol("ts.post_count"),
            helpfulCount: makeCol("ts.helpful_count"),
            participantCount: makeCol("ts.participant_count"),
            lastActivityAt: makeCol("ts.last_activity_at"),
        },
        program: {
            id: makeCol("p.id"),
            cohortStartDate: makeCol("p.cohort_start_date"),
        },
        user: {
            id: makeCol("u.id"),
            name: makeCol("u.name"),
        },
    };
});

// The DB mock — must be declared before the module import
const mockDb = {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
};

vi.mock("@cocs/database/client", () => ({
    db: mockDb,
}));

describe("Discussion Ownership Enforcement", () => {
    const ownerUserId = "aaaa-1111-bbbb-2222";
    const otherUserId = "cccc-3333-dddd-4444";
    const postId = "eeee-5555-ffff-6666";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("editPost — ownership gate", () => {
        it("rejects edit when userId does not match post owner", async () => {
            mockDb.select.mockReturnValue(
                buildSelectChain([{ id: postId, userId: ownerUserId, isDeleted: false }]),
            );

            const { editPost } = await import("../src/discussion");

            await expect(editPost(otherUserId, postId, "hacked content"))
                .rejects.toThrow("Not authorized");
        });

        it("allows edit when userId matches post owner", async () => {
            mockDb.select.mockReturnValue(
                buildSelectChain([{ id: postId, userId: ownerUserId, isDeleted: false }]),
            );
            mockDb.update.mockReturnValue(buildUpdateChain());

            const { editPost } = await import("../src/discussion");

            await expect(editPost(ownerUserId, postId, "updated content"))
                .resolves.not.toThrow();
        });

        it("rejects edit on deleted post", async () => {
            mockDb.select.mockReturnValue(
                buildSelectChain([{ id: postId, userId: ownerUserId, isDeleted: true }]),
            );

            const { editPost } = await import("../src/discussion");

            await expect(editPost(ownerUserId, postId, "edit deleted"))
                .rejects.toThrow("Cannot edit a deleted post");
        });

        it("throws when post not found", async () => {
            mockDb.select.mockReturnValue(buildSelectChain([]));

            const { editPost } = await import("../src/discussion");

            await expect(editPost(ownerUserId, "nonexistent", "anything"))
                .rejects.toThrow("Post not found");
        });
    });

    describe("deletePost — ownership gate", () => {
        it("rejects delete when non-owner and non-admin", async () => {
            mockDb.select.mockReturnValue(
                buildSelectChain([{ id: postId, userId: ownerUserId }]),
            );

            const { deletePost } = await import("../src/discussion");

            await expect(deletePost(otherUserId, postId, false))
                .rejects.toThrow("Not authorized");
        });

        it("allows owner to soft-delete own post", async () => {
            mockDb.select.mockReturnValue(
                buildSelectChain([{ id: postId, userId: ownerUserId }]),
            );
            mockDb.update.mockReturnValue(buildUpdateChain());

            const { deletePost } = await import("../src/discussion");

            await expect(deletePost(ownerUserId, postId, false))
                .resolves.not.toThrow();
        });

        it("allows admin to delete any post", async () => {
            mockDb.select.mockReturnValue(
                buildSelectChain([{ id: postId, userId: ownerUserId }]),
            );
            mockDb.update.mockReturnValue(buildUpdateChain());

            const { deletePost } = await import("../src/discussion");

            await expect(deletePost(otherUserId, postId, true))
                .resolves.not.toThrow();
        });

        it("throws when post not found", async () => {
            mockDb.select.mockReturnValue(buildSelectChain([]));

            const { deletePost } = await import("../src/discussion");

            await expect(deletePost(ownerUserId, "nonexistent", false))
                .rejects.toThrow("Post not found");
        });
    });
});
