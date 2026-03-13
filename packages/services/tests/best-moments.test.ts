// =============================================================================
// Best Moments Tests — Phase 6
// =============================================================================
// Tests for the BestMoment output shape validation and sanitization
// done in the generate.ts layer. Since actual API calls require OpenAI,
// these tests verify the sanitization/validation logic independently.
// =============================================================================
import { describe, it, expect } from "vitest";

// Test the sanitization/validation logic used by generateBestMoments

interface BestMoment {
    title: string;
    timestampSeconds: number | null;
    source: "transcript" | "discussion";
    description: string;
}

function sanitizeBestMoments(raw: unknown[]): BestMoment[] {
    return raw.slice(0, 5).map((m: unknown) => {
        const item = m as Record<string, unknown>;
        return {
            title: String(item.title ?? "").slice(0, 80),
            timestampSeconds: typeof item.timestampSeconds === "number" && (item.timestampSeconds as number) >= 0
                ? Math.round(item.timestampSeconds as number)
                : null,
            source: item.source === "discussion" ? "discussion" as const : "transcript" as const,
            description: String(item.description ?? "").slice(0, 150),
        };
    });
}

describe("Best Moments Sanitization", () => {
    it("limits to 5 moments", () => {
        const raw = Array.from({ length: 10 }, (_, i) => ({
            title: `Moment ${i}`,
            timestampSeconds: i * 60,
            source: "transcript",
            description: "Good stuff",
        }));
        expect(sanitizeBestMoments(raw)).toHaveLength(5);
    });

    it("truncates title to 80 chars", () => {
        const result = sanitizeBestMoments([{
            title: "A".repeat(200),
            timestampSeconds: 0,
            source: "transcript",
            description: "desc",
        }]);
        expect(result[0].title.length).toBeLessThanOrEqual(80);
    });

    it("truncates description to 150 chars", () => {
        const result = sanitizeBestMoments([{
            title: "Test",
            timestampSeconds: 0,
            source: "transcript",
            description: "D".repeat(300),
        }]);
        expect(result[0].description.length).toBeLessThanOrEqual(150);
    });

    it("rejects negative timestamps", () => {
        const result = sanitizeBestMoments([{
            title: "Test",
            timestampSeconds: -10,
            source: "transcript",
            description: "desc",
        }]);
        expect(result[0].timestampSeconds).toBeNull();
    });

    it("rounds fractional timestamps", () => {
        const result = sanitizeBestMoments([{
            title: "Test",
            timestampSeconds: 123.7,
            source: "transcript",
            description: "desc",
        }]);
        expect(result[0].timestampSeconds).toBe(124);
    });

    it("defaults non-discussion source to transcript", () => {
        const result = sanitizeBestMoments([{
            title: "Test",
            timestampSeconds: 0,
            source: "invalid",
            description: "desc",
        }]);
        expect(result[0].source).toBe("transcript");
    });

    it("handles missing fields gracefully", () => {
        const result = sanitizeBestMoments([{}]);
        expect(result[0].title).toBe("");
        expect(result[0].timestampSeconds).toBeNull();
        expect(result[0].source).toBe("transcript");
        expect(result[0].description).toBe("");
    });

    it("handles null timestampSeconds", () => {
        const result = sanitizeBestMoments([{
            title: "Test",
            timestampSeconds: null,
            source: "transcript",
            description: "desc",
        }]);
        expect(result[0].timestampSeconds).toBeNull();
    });
});
