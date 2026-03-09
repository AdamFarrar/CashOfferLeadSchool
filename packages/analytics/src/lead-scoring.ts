// =============================================================================
// D10: Lead Scoring Heuristic
// =============================================================================
// Calculates a conversion-readiness score (0–100) based on observable
// behavioral signals from the funnel. No PII.
// =============================================================================

export interface LeadScoreInput {
    /** Whether the user completed email verification */
    emailVerified: boolean;
    /** Whether the user started qualification */
    qualificationStarted: boolean;
    /** Whether the user submitted qualification */
    qualificationSubmitted: boolean;
    /** Total number of qualification steps completed */
    stepsCompleted: number;
    /** Total time spent on qualification (seconds) */
    qualificationTimeSec: number;
    /** Number of dashboard visits */
    dashboardVisits: number;
    /** Whether feedback was submitted */
    feedbackSubmitted: boolean;
    /** Business type from qualification */
    businessType: string;
    /** Monthly budget from qualification */
    monthlyBudget: string;
    /** Years of experience from qualification */
    yearsExperience: string;
}

export interface LeadScoreResult {
    score: number; // 0–100
    tier: "cold" | "warm" | "hot" | "qualified";
    signals: string[];
}

const BUDGET_SCORES: Record<string, number> = {
    "Under $1,000/mo": 2,
    "$1,000 - $3,000/mo": 5,
    "$3,000 - $5,000/mo": 8,
    "$5,000 - $10,000/mo": 12,
    "$10,000+/mo": 15,
};

const EXPERIENCE_SCORES: Record<string, number> = {
    "Less than 1 year": 2,
    "1-3 years": 5,
    "3-5 years": 8,
    "5-10 years": 12,
    "10+ years": 15,
};

/**
 * Calculate a lead score from observable behavioral and qualification signals.
 *
 * Score breakdown (max 100):
 *   Email verified:          10
 *   Qualification started:    5
 *   Qualification submitted: 20
 *   Steps completed:          5 per step (max 15)
 *   Time engagement:          5 (not too fast, not too slow)
 *   Dashboard visits:         5 (returning user)
 *   Feedback submitted:       5
 *   Budget:                  up to 15
 *   Experience:              up to 15
 *   Business type:            5 (relevant types)
 */
export function calculateLeadScore(input: LeadScoreInput): LeadScoreResult {
    let score = 0;
    const signals: string[] = [];

    // Email verification (10)
    if (input.emailVerified) {
        score += 10;
        signals.push("email_verified");
    }

    // Qualification lifecycle (25)
    if (input.qualificationStarted) {
        score += 5;
        signals.push("qualification_started");
    }
    if (input.qualificationSubmitted) {
        score += 20;
        signals.push("qualification_submitted");
    }

    // Steps completed (up to 15)
    const stepScore = Math.min(input.stepsCompleted * 5, 15);
    if (stepScore > 0) {
        score += stepScore;
        signals.push(`steps_completed:${input.stepsCompleted}`);
    }

    // Time engagement (5) — between 30s and 600s is good
    if (input.qualificationTimeSec >= 30 && input.qualificationTimeSec <= 600) {
        score += 5;
        signals.push("healthy_time_engagement");
    }

    // Returning user (5)
    if (input.dashboardVisits > 1) {
        score += 5;
        signals.push("returning_user");
    }

    // Feedback (5)
    if (input.feedbackSubmitted) {
        score += 5;
        signals.push("feedback_submitted");
    }

    // Budget (up to 15)
    const budgetScore = BUDGET_SCORES[input.monthlyBudget] || 0;
    score += budgetScore;
    if (budgetScore >= 8) signals.push("high_budget");

    // Experience (up to 15)
    const expScore = EXPERIENCE_SCORES[input.yearsExperience] || 0;
    score += expScore;
    if (expScore >= 8) signals.push("experienced_operator");

    // Business type relevance (5)
    const relevantTypes = ["Real Estate Investor", "Wholesaler", "Lead Generation Agency"];
    if (relevantTypes.includes(input.businessType)) {
        score += 5;
        signals.push("relevant_business_type");
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Tier assignment
    let tier: LeadScoreResult["tier"];
    if (score >= 70) tier = "qualified";
    else if (score >= 45) tier = "hot";
    else if (score >= 20) tier = "warm";
    else tier = "cold";

    return { score, tier, signals };
}
