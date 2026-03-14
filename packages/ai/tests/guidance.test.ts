import { describe, it, expect } from "vitest";
import { evaluateCompletionGuidance } from "../src/guidance";
import type { GuidanceInput, GuidanceMessage } from "../src/guidance";

// =============================================================================
// Completion Guidance Engine Tests
// =============================================================================

function makeInput(overrides: Partial<GuidanceInput> = {}): GuidanceInput {
    return {
        totalEpisodes: 10,
        completedEpisodes: 0,
        hasWrittenNotes: false,
        lastActivityDaysAgo: null,
        nextEpisodeTitle: null,
        nextEpisodeId: null,
        ...overrides,
    };
}

describe("evaluateCompletionGuidance", () => {
    describe("completed program", () => {
        it("returns only completed message when all episodes done", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 10,
                totalEpisodes: 10,
            }));
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe("completed");
        });

        it("includes celebration emoji in title", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 10,
                totalEpisodes: 10,
            }));
            expect(result[0].title).toContain("🎉");
        });
    });

    describe("stalled learner", () => {
        it("flags users inactive for 5+ days", () => {
            const result = evaluateCompletionGuidance(makeInput({
                lastActivityDaysAgo: 5,
                completedEpisodes: 3,
            }));
            expect(result.some(m => m.type === "stalled")).toBe(true);
        });

        it("does not flag users active within 5 days", () => {
            const result = evaluateCompletionGuidance(makeInput({
                lastActivityDaysAgo: 4,
                completedEpisodes: 3,
            }));
            expect(result.some(m => m.type === "stalled")).toBe(false);
        });

        it("includes next episode title in message", () => {
            const result = evaluateCompletionGuidance(makeInput({
                lastActivityDaysAgo: 7,
                completedEpisodes: 3,
                nextEpisodeTitle: "Cash Offer Scripts",
            }));
            const stalled = result.find(m => m.type === "stalled")!;
            expect(stalled.body).toContain("Cash Offer Scripts");
        });

        it("includes days count in message", () => {
            const result = evaluateCompletionGuidance(makeInput({
                lastActivityDaysAgo: 12,
                completedEpisodes: 3,
            }));
            const stalled = result.find(m => m.type === "stalled")!;
            expect(stalled.body).toContain("12 days");
        });
    });

    describe("no notes nudge", () => {
        it("triggers when no notes and 2+ episodes completed", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 2,
                hasWrittenNotes: false,
            }));
            expect(result.some(m => m.type === "no_notes")).toBe(true);
        });

        it("does not trigger if notes have been written", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 5,
                hasWrittenNotes: true,
            }));
            expect(result.some(m => m.type === "no_notes")).toBe(false);
        });

        it("does not trigger for less than 2 episodes", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 1,
                hasWrittenNotes: false,
            }));
            expect(result.some(m => m.type === "no_notes")).toBe(false);
        });
    });

    describe("rapid progress", () => {
        it("triggers when 50%+ complete and active within 2 days", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 5,
                lastActivityDaysAgo: 1,
            }));
            expect(result.some(m => m.type === "rapid_progress")).toBe(true);
        });

        it("does not trigger below 50% completion", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 4,
                lastActivityDaysAgo: 1,
            }));
            expect(result.some(m => m.type === "rapid_progress")).toBe(false);
        });
    });

    describe("just started", () => {
        it("triggers for new users with 0-1 episodes and program > 3", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 0,
                totalEpisodes: 10,
            }));
            expect(result.some(m => m.type === "just_started")).toBe(true);
        });

        it("does not trigger for short programs", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 0,
                totalEpisodes: 3,
            }));
            expect(result.some(m => m.type === "just_started")).toBe(false);
        });
    });

    describe("priority ordering", () => {
        it("returns messages sorted by priority (lowest number first)", () => {
            const result = evaluateCompletionGuidance(makeInput({
                completedEpisodes: 5,
                lastActivityDaysAgo: 7,
                hasWrittenNotes: false,
            }));
            // stalled (p1), no_notes (p2), rapid_progress (p3)
            for (let i = 1; i < result.length; i++) {
                expect(result[i].priority).toBeGreaterThanOrEqual(result[i - 1].priority);
            }
        });
    });
});
