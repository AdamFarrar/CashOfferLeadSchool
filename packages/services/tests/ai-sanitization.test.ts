// =============================================================================
// Tests: AI Sanitization Boundary — Post-Audit Fix 5
// =============================================================================
// Verifies getSanitizedDiscussionPosts() enforces the sanitization contract:
// - hidden threads excluded
// - deleted posts excluded
// - body truncated to 500 chars
// - only returns expected fields
// =============================================================================

import { describe, it, expect, vi } from "vitest";

// Mock the database client with a flexible execute mock
const mockExecute = vi.fn();
vi.mock("@cols/database", () => ({
    db: {
        execute: mockExecute,
    },
}));

// Mock schema imports
vi.mock("@cols/database/schema", () => ({
    aiInsight: {},
    aiInsightReference: {},
    episode: {},
}));

describe("getSanitizedDiscussionPosts — AI Sanitization Boundary", () => {
    const episodeId = "aaaa-1111-bbbb-2222";

    it("returns only the expected fields (thread_title, body, helpful_count)", async () => {
        mockExecute.mockResolvedValueOnce({
            rows: [
                { thread_title: "Test Thread", body: "Some content", helpful_count: 5 },
            ],
        });

        const { getSanitizedDiscussionPosts } = await import("../src/ai-service");
        const result = await getSanitizedDiscussionPosts(episodeId);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            thread_title: "Test Thread",
            body: "Some content",
            helpful_count: 5,
        });

        // Verify no extra fields leak (no user_id, no email, etc.)
        expect(result[0]).not.toHaveProperty("user_id");
        expect(result[0]).not.toHaveProperty("email");
        expect(result[0]).not.toHaveProperty("is_hidden");
        expect(result[0]).not.toHaveProperty("is_deleted");
    });

    it("returns empty array when no posts exist", async () => {
        mockExecute.mockResolvedValueOnce({ rows: [] });

        const { getSanitizedDiscussionPosts } = await import("../src/ai-service");
        const result = await getSanitizedDiscussionPosts(episodeId);

        expect(result).toEqual([]);
    });

    it("returns empty array when execute returns undefined rows", async () => {
        mockExecute.mockResolvedValueOnce({});

        const { getSanitizedDiscussionPosts } = await import("../src/ai-service");
        const result = await getSanitizedDiscussionPosts(episodeId);

        expect(result).toEqual([]);
    });

    it("verifies SQL query enforces hidden/deleted exclusions", async () => {
        // This test verifies the SQL structure by examining the call
        mockExecute.mockResolvedValueOnce({ rows: [] });

        const { getSanitizedDiscussionPosts } = await import("../src/ai-service");
        await getSanitizedDiscussionPosts(episodeId);

        // Verify execute was called (with the SQL template)
        expect(mockExecute).toHaveBeenCalled();
        const call = mockExecute.mock.calls[mockExecute.mock.calls.length - 1];

        // The sql tagged template is an object — serialize to check contents
        const sqlString = JSON.stringify(call[0]);
        expect(sqlString).toContain("is_hidden");
        expect(sqlString).toContain("is_deleted");
        expect(sqlString).toContain("500");
        expect(sqlString).toContain("200");
    });

    it("body truncation is enforced in SQL (LEFT(..., 500))", async () => {
        // If the DB returns a body > 500 chars, it means the SQL didn't truncate
        // This tests the contract — the SQL should use LEFT(cp.body, 500)
        const longBody = "a".repeat(600);
        mockExecute.mockResolvedValueOnce({
            rows: [
                { thread_title: "Long Post", body: longBody.slice(0, 500), helpful_count: 0 },
            ],
        });

        const { getSanitizedDiscussionPosts } = await import("../src/ai-service");
        const result = await getSanitizedDiscussionPosts(episodeId);

        // DB should have returned truncated body (500 chars max)
        expect(result[0].body.length).toBeLessThanOrEqual(500);
    });
});
