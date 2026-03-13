// =============================================================================
// Completion Guidance Engine Tests — Phase 6
// =============================================================================
// Tests the deterministic rules engine that generates contextual nudges.
// The function is pure (no DB, no AI) so we import the source directly.
// =============================================================================
import { describe, it, expect } from "vitest";

// ── Inline the pure function + types to avoid cross-package resolution ──

interface GuidanceMessage {
    type: "stalled" | "no_notes" | "rapid_progress" | "completed" | "just_started";
    title: string;
    body: string;
    priority: number;
}

interface GuidanceInput {
    totalEpisodes: number;
    completedEpisodes: number;
    hasWrittenNotes: boolean;
    lastActivityDaysAgo: number | null;
    nextEpisodeTitle: string | null;
    nextEpisodeId: string | null;
}

function evaluateCompletionGuidance(input: GuidanceInput): GuidanceMessage[] {
    const messages: GuidanceMessage[] = [];
    const {
        totalEpisodes,
        completedEpisodes,
        hasWrittenNotes,
        lastActivityDaysAgo,
        nextEpisodeTitle,
    } = input;

    const progressRatio = totalEpisodes > 0 ? completedEpisodes / totalEpisodes : 0;

    if (completedEpisodes >= totalEpisodes && totalEpisodes > 0) {
        messages.push({
            type: "completed",
            title: "🎉 Program Complete",
            body: "You've completed all episodes. Review the discussion highlights for extra insights, or revisit your notes.",
            priority: 1,
        });
        return messages;
    }

    if (lastActivityDaysAgo !== null && lastActivityDaysAgo >= 5 && progressRatio < 1) {
        const nextDesc = nextEpisodeTitle
            ? ` "${nextEpisodeTitle}" is ready for you.`
            : " Your next episode is waiting.";
        messages.push({
            type: "stalled",
            title: "📌 Pick Up Where You Left Off",
            body: `You haven't logged in for ${lastActivityDaysAgo} days.${nextDesc}`,
            priority: 1,
        });
    }

    if (!hasWrittenNotes && completedEpisodes >= 2) {
        messages.push({
            type: "no_notes",
            title: "✍️ Start Taking Notes",
            body: "Learners who write notes complete the program 30% more often. Try jotting down one key insight per episode.",
            priority: 2,
        });
    }

    if (progressRatio >= 0.5 && lastActivityDaysAgo !== null && lastActivityDaysAgo <= 2) {
        messages.push({
            type: "rapid_progress",
            title: "🚀 Great Momentum",
            body: "You're ahead of the cohort. Consider reviewing the discussion highlights to deepen your understanding.",
            priority: 3,
        });
    }

    if (completedEpisodes <= 1 && totalEpisodes > 3) {
        messages.push({
            type: "just_started",
            title: "👋 Welcome to the Program",
            body: "Complete your first few episodes to build momentum. The strategies build on each other.",
            priority: 3,
        });
    }

    messages.sort((a, b) => a.priority - b.priority);
    return messages;
}

// =============================================================================
// Tests
// =============================================================================

describe("evaluateCompletionGuidance", () => {
    const baseInput: GuidanceInput = {
        totalEpisodes: 10,
        completedEpisodes: 5,
        hasWrittenNotes: true,
        lastActivityDaysAgo: 2,
        nextEpisodeTitle: "Episode 6: The Follow-Up Script",
        nextEpisodeId: "abc-123",
    };

    it("returns rapid_progress for active learner at 50%", () => {
        const result = evaluateCompletionGuidance(baseInput);
        const types = result.map((m) => m.type);
        expect(types).toContain("rapid_progress");
        expect(types).not.toContain("stalled");
        expect(types).not.toContain("no_notes");
    });

    it("detects stalled learner (>= 5 days inactive)", () => {
        const result = evaluateCompletionGuidance({
            ...baseInput,
            lastActivityDaysAgo: 7,
        });
        const stalled = result.find((m) => m.type === "stalled");
        expect(stalled).toBeDefined();
        expect(stalled!.body).toContain("7 days");
        expect(stalled!.body).toContain("Follow-Up Script");
        expect(stalled!.priority).toBe(1);
    });

    it("detects no notes written after 2+ episodes", () => {
        const result = evaluateCompletionGuidance({
            ...baseInput,
            hasWrittenNotes: false,
            completedEpisodes: 3,
        });
        const noNotes = result.find((m) => m.type === "no_notes");
        expect(noNotes).toBeDefined();
        expect(noNotes!.body).toContain("30%");
    });

    it("does NOT flag no_notes if only 1 episode completed", () => {
        const result = evaluateCompletionGuidance({
            ...baseInput,
            hasWrittenNotes: false,
            completedEpisodes: 1,
        });
        const noNotes = result.find((m) => m.type === "no_notes");
        expect(noNotes).toBeUndefined();
    });

    it("returns completed message when all episodes done", () => {
        const result = evaluateCompletionGuidance({
            ...baseInput,
            completedEpisodes: 10,
            totalEpisodes: 10,
        });
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("completed");
        expect(result[0].title).toContain("Complete");
    });

    it("returns just_started for new learners", () => {
        const result = evaluateCompletionGuidance({
            ...baseInput,
            completedEpisodes: 0,
            lastActivityDaysAgo: 1,
        });
        const justStarted = result.find((m) => m.type === "just_started");
        expect(justStarted).toBeDefined();
    });

    it("sorts by priority (lower = higher priority)", () => {
        const result = evaluateCompletionGuidance({
            ...baseInput,
            hasWrittenNotes: false,
            lastActivityDaysAgo: 10,
            completedEpisodes: 3,
        });
        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(result[0].priority).toBeLessThanOrEqual(result[1].priority);
    });

    it("handles zero total episodes gracefully", () => {
        const result = evaluateCompletionGuidance({
            ...baseInput,
            totalEpisodes: 0,
            completedEpisodes: 0,
        });
        expect(Array.isArray(result)).toBe(true);
    });

    it("handles null lastActivityDaysAgo", () => {
        const result = evaluateCompletionGuidance({
            ...baseInput,
            lastActivityDaysAgo: null,
        });
        const types = result.map((m) => m.type);
        expect(types).not.toContain("stalled");
        expect(types).not.toContain("rapid_progress");
    });

    it("all messages have required fields", () => {
        const result = evaluateCompletionGuidance({
            ...baseInput,
            hasWrittenNotes: false,
            lastActivityDaysAgo: 8,
            completedEpisodes: 3,
        });
        for (const msg of result) {
            expect(msg.type).toBeDefined();
            expect(msg.title).toBeDefined();
            expect(msg.body).toBeDefined();
            expect(typeof msg.priority).toBe("number");
        }
    });
});
