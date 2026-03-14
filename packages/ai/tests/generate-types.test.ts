import { describe, it, expect } from "vitest";
import type {
    TakeawayResult,
    DigestResult,
    ReflectionResult,
    BestMoment,
    BestMomentResult,
    CohortSignal,
    CohortSignalResult,
    ModerationResult,
} from "../src/generate";

// =============================================================================
// AI Generation Types Contract Tests
// =============================================================================

describe("TakeawayResult", () => {
    it("satisfies the interface", () => {
        const result: TakeawayResult = {
            takeaways: ["Buy at 70% ARV", "Always get the deed"],
            model: "gpt-4o-mini",
            tokenCount: 150,
        };
        expect(result.takeaways).toHaveLength(2);
    });
});

describe("DigestResult", () => {
    it("satisfies the interface", () => {
        const result: DigestResult = {
            summary: "Students focused on...",
            themes: ["ARV calculation", "Negotiation"],
            topQuestions: ["How to handle?"],
            model: "gpt-4o-mini",
            tokenCount: 200,
        };
        expect(result.themes).toHaveLength(2);
    });
});

describe("ReflectionResult", () => {
    it("satisfies the interface", () => {
        const result: ReflectionResult = {
            prompts: ["What will you change?", "How does this apply?", "Next step?"],
            model: "gpt-4o-mini",
            tokenCount: 100,
        };
        expect(result.prompts).toHaveLength(3);
    });
});

describe("BestMoment", () => {
    it("supports transcript source", () => {
        const moment: BestMoment = {
            title: "The ARV Formula",
            timestampSeconds: 120,
            source: "transcript",
            description: "Key formula explained",
        };
        expect(moment.source).toBe("transcript");
    });

    it("supports null timestamp", () => {
        const moment: BestMoment = {
            title: "Top Insight",
            timestampSeconds: null,
            source: "discussion",
            description: "From student discussion",
        };
        expect(moment.timestampSeconds).toBeNull();
    });
});

describe("CohortSignal", () => {
    it("supports all signal types", () => {
        const types: CohortSignal["signalType"][] = ["most_discussed", "common_pattern", "top_takeaway"];
        expect(types).toHaveLength(3);
    });
});

describe("ModerationResult", () => {
    it("represents unflagged content", () => {
        const result: ModerationResult = {
            flagged: false,
            reason: null,
            confidence: 1.0,
        };
        expect(result.flagged).toBe(false);
    });

    it("represents flagged content", () => {
        const result: ModerationResult = {
            flagged: true,
            reason: "Contains spam links",
            confidence: 0.95,
        };
        expect(result.reason).toBeTruthy();
    });
});
