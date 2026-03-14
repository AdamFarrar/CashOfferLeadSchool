import { describe, it, expect } from "vitest";
import { MODELS, LIMITS } from "../src/client";

// =============================================================================
// AI Client Configuration Tests
// =============================================================================

describe("MODELS", () => {
    it("defines SUMMARY model", () => {
        expect(MODELS.SUMMARY).toBeTruthy();
    });

    it("defines EMBEDDING model", () => {
        expect(MODELS.EMBEDDING).toBeTruthy();
    });
});

describe("LIMITS", () => {
    it("has MAX_TRANSCRIPT_CHARS", () => {
        expect(LIMITS.MAX_TRANSCRIPT_CHARS).toBeGreaterThan(0);
    });

    it("has MAX_DISCUSSION_POSTS", () => {
        expect(LIMITS.MAX_DISCUSSION_POSTS).toBeGreaterThan(0);
    });

    it("transcript limit is reasonable", () => {
        expect(LIMITS.MAX_TRANSCRIPT_CHARS).toBeLessThanOrEqual(200_000);
        expect(LIMITS.MAX_TRANSCRIPT_CHARS).toBeGreaterThanOrEqual(10_000);
    });
});
