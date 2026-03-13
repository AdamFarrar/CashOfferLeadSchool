// =============================================================================
// Cohort Signals Tests — Phase 6
// =============================================================================
// Tests for the CohortSignal output shape validation and sanitization.
// Verifies signal type validation, field truncation, and episode tagging.
// =============================================================================
import { describe, it, expect } from "vitest";

interface CohortSignal {
    signalType: "most_discussed" | "common_pattern" | "top_takeaway";
    title: string;
    description: string;
    episodeId?: string;
    episodeTitle?: string;
}

const VALID_SIGNAL_TYPES = ["most_discussed", "common_pattern", "top_takeaway"];

function sanitizeCohortSignals(
    raw: unknown[],
    topEpisode?: { episodeId: string; episodeTitle: string },
): CohortSignal[] {
    return raw.slice(0, 3).map((s: unknown) => {
        const item = s as Record<string, unknown>;
        const signalType = VALID_SIGNAL_TYPES.includes(item.signalType as string)
            ? (item.signalType as CohortSignal["signalType"])
            : "common_pattern";

        return {
            signalType,
            title: String(item.title ?? "").slice(0, 60),
            description: String(item.description ?? "").slice(0, 120),
            episodeId: signalType === "most_discussed" && topEpisode ? topEpisode.episodeId : undefined,
            episodeTitle: signalType === "most_discussed" && topEpisode ? topEpisode.episodeTitle : undefined,
        };
    });
}

describe("Cohort Signal Sanitization", () => {
    it("limits to 3 signals", () => {
        const raw = Array.from({ length: 10 }, () => ({
            signalType: "common_pattern",
            title: "Test",
            description: "Desc",
        }));
        expect(sanitizeCohortSignals(raw)).toHaveLength(3);
    });

    it("truncates title to 60 chars", () => {
        const result = sanitizeCohortSignals([{
            signalType: "common_pattern",
            title: "T".repeat(100),
            description: "Desc",
        }]);
        expect(result[0].title.length).toBeLessThanOrEqual(60);
    });

    it("truncates description to 120 chars", () => {
        const result = sanitizeCohortSignals([{
            signalType: "common_pattern",
            title: "Test",
            description: "D".repeat(200),
        }]);
        expect(result[0].description.length).toBeLessThanOrEqual(120);
    });

    it("defaults invalid signalType to common_pattern", () => {
        const result = sanitizeCohortSignals([{
            signalType: "invalid_type",
            title: "Test",
            description: "Desc",
        }]);
        expect(result[0].signalType).toBe("common_pattern");
    });

    it("validates all valid signal types", () => {
        for (const type of VALID_SIGNAL_TYPES) {
            const result = sanitizeCohortSignals([{
                signalType: type,
                title: "Test",
                description: "Desc",
            }]);
            expect(result[0].signalType).toBe(type);
        }
    });

    it("tags most_discussed signals with episode data", () => {
        const result = sanitizeCohortSignals(
            [{ signalType: "most_discussed", title: "Hot ep", description: "Very active" }],
            { episodeId: "uuid-1", episodeTitle: "Episode 3" },
        );
        expect(result[0].episodeId).toBe("uuid-1");
        expect(result[0].episodeTitle).toBe("Episode 3");
    });

    it("does NOT tag non-most_discussed signals with episode data", () => {
        const result = sanitizeCohortSignals(
            [{ signalType: "top_takeaway", title: "Takeaway", description: "Good" }],
            { episodeId: "uuid-1", episodeTitle: "Episode 3" },
        );
        expect(result[0].episodeId).toBeUndefined();
        expect(result[0].episodeTitle).toBeUndefined();
    });

    it("handles missing fields gracefully", () => {
        const result = sanitizeCohortSignals([{}]);
        expect(result[0].signalType).toBe("common_pattern");
        expect(result[0].title).toBe("");
        expect(result[0].description).toBe("");
    });
});
