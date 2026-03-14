import { describe, it, expect } from "vitest";
import { calculateLeadScore } from "../src/lead-scoring";
import type { LeadScoreInput, LeadScoreResult } from "../src/lead-scoring";

// =============================================================================
// Lead Scoring Tests
// =============================================================================

function makeInput(overrides: Partial<LeadScoreInput> = {}): LeadScoreInput {
    return {
        emailVerified: false,
        qualificationStarted: false,
        qualificationSubmitted: false,
        stepsCompleted: 0,
        qualificationTimeSec: 0,
        dashboardVisits: 0,
        feedbackSubmitted: false,
        businessType: "",
        monthlyBudget: "",
        yearsExperience: "",
        ...overrides,
    };
}

describe("calculateLeadScore", () => {
    it("returns score 0 and tier cold for empty input", () => {
        const result = calculateLeadScore(makeInput());
        expect(result.score).toBe(0);
        expect(result.tier).toBe("cold");
        expect(result.signals).toEqual([]);
    });

    it("adds 10 for email verification", () => {
        const result = calculateLeadScore(makeInput({ emailVerified: true }));
        expect(result.score).toBe(10);
        expect(result.signals).toContain("email_verified");
    });

    it("adds 5 for qualification started", () => {
        const result = calculateLeadScore(makeInput({ qualificationStarted: true }));
        expect(result.score).toBe(5);
        expect(result.signals).toContain("qualification_started");
    });

    it("adds 20 for qualification submitted", () => {
        const result = calculateLeadScore(makeInput({ qualificationSubmitted: true }));
        expect(result.score).toBe(20);
        expect(result.signals).toContain("qualification_submitted");
    });

    it("adds up to 15 for steps completed", () => {
        expect(calculateLeadScore(makeInput({ stepsCompleted: 1 })).score).toBe(5);
        expect(calculateLeadScore(makeInput({ stepsCompleted: 2 })).score).toBe(10);
        expect(calculateLeadScore(makeInput({ stepsCompleted: 3 })).score).toBe(15);
        // Caps at 15
        expect(calculateLeadScore(makeInput({ stepsCompleted: 10 })).score).toBe(15);
    });

    it("adds 5 for healthy time engagement (30-600s)", () => {
        expect(calculateLeadScore(makeInput({ qualificationTimeSec: 29 })).score).toBe(0);
        expect(calculateLeadScore(makeInput({ qualificationTimeSec: 30 })).score).toBe(5);
        expect(calculateLeadScore(makeInput({ qualificationTimeSec: 300 })).score).toBe(5);
        expect(calculateLeadScore(makeInput({ qualificationTimeSec: 600 })).score).toBe(5);
        expect(calculateLeadScore(makeInput({ qualificationTimeSec: 601 })).score).toBe(0);
    });

    it("adds 5 for returning users (>1 dashboard visits)", () => {
        expect(calculateLeadScore(makeInput({ dashboardVisits: 0 })).score).toBe(0);
        expect(calculateLeadScore(makeInput({ dashboardVisits: 1 })).score).toBe(0);
        expect(calculateLeadScore(makeInput({ dashboardVisits: 2 })).score).toBe(5);
    });

    it("adds 5 for feedback submission", () => {
        const result = calculateLeadScore(makeInput({ feedbackSubmitted: true }));
        expect(result.score).toBe(5);
        expect(result.signals).toContain("feedback_submitted");
    });

    it("scores budget tiers correctly", () => {
        expect(calculateLeadScore(makeInput({ monthlyBudget: "Under $1,000/mo" })).score).toBe(2);
        expect(calculateLeadScore(makeInput({ monthlyBudget: "$5,000 - $10,000/mo" })).score).toBe(12);
        expect(calculateLeadScore(makeInput({ monthlyBudget: "$10,000+/mo" })).score).toBe(15);
    });

    it("signals high_budget for budgets >= 8 points", () => {
        const result = calculateLeadScore(makeInput({ monthlyBudget: "$3,000 - $5,000/mo" }));
        expect(result.signals).toContain("high_budget");
    });

    it("scores experience tiers correctly", () => {
        expect(calculateLeadScore(makeInput({ yearsExperience: "Less than 1 year" })).score).toBe(2);
        expect(calculateLeadScore(makeInput({ yearsExperience: "5-10 years" })).score).toBe(12);
        expect(calculateLeadScore(makeInput({ yearsExperience: "10+ years" })).score).toBe(15);
    });

    it("signals experienced_operator for experience >= 8 points", () => {
        const result = calculateLeadScore(makeInput({ yearsExperience: "3-5 years" }));
        expect(result.signals).toContain("experienced_operator");
    });

    it("adds 5 for relevant business types", () => {
        const result = calculateLeadScore(makeInput({ businessType: "Real Estate Investor" }));
        expect(result.score).toBe(5);
        expect(result.signals).toContain("relevant_business_type");
    });

    it("recognizes Wholesaler as relevant", () => {
        const result = calculateLeadScore(makeInput({ businessType: "Wholesaler" }));
        expect(result.signals).toContain("relevant_business_type");
    });

    it("does not add business type points for irrelevant types", () => {
        const result = calculateLeadScore(makeInput({ businessType: "Student" }));
        expect(result.score).toBe(0);
    });

    it("caps score at 100", () => {
        const maxInput = makeInput({
            emailVerified: true,          // 10
            qualificationStarted: true,   // 5
            qualificationSubmitted: true,  // 20
            stepsCompleted: 10,            // 15
            qualificationTimeSec: 120,     // 5
            dashboardVisits: 5,            // 5
            feedbackSubmitted: true,       // 5
            monthlyBudget: "$10,000+/mo",  // 15
            yearsExperience: "10+ years",  // 15
            businessType: "Wholesaler",    // 5 = 100
        });
        expect(calculateLeadScore(maxInput).score).toBe(100);
    });

    it("assigns warm tier for 20-44", () => {
        const result = calculateLeadScore(makeInput({
            qualificationSubmitted: true, // 20
        }));
        expect(result.tier).toBe("warm");
    });

    it("assigns hot tier for 45-69", () => {
        const result = calculateLeadScore(makeInput({
            emailVerified: true,           // 10
            qualificationStarted: true,    // 5
            qualificationSubmitted: true,   // 20
            stepsCompleted: 3,              // 15 = 50
        }));
        expect(result.tier).toBe("hot");
    });

    it("assigns qualified tier for 70+", () => {
        const result = calculateLeadScore(makeInput({
            emailVerified: true,            // 10
            qualificationStarted: true,     // 5
            qualificationSubmitted: true,    // 20
            stepsCompleted: 3,               // 15
            qualificationTimeSec: 120,       // 5
            dashboardVisits: 3,              // 5
            feedbackSubmitted: true,         // 5
            monthlyBudget: "$1,000 - $3,000/mo", // 5 = 70
        }));
        expect(result.tier).toBe("qualified");
    });

    it("ignores unknown budget values", () => {
        const result = calculateLeadScore(makeInput({ monthlyBudget: "infinite money" }));
        expect(result.score).toBe(0);
    });

    it("ignores unknown experience values", () => {
        const result = calculateLeadScore(makeInput({ yearsExperience: "100 years" }));
        expect(result.score).toBe(0);
    });
});
