import { describe, it, expect } from "vitest";
import { REPORT_REGISTRY } from "../src/reporting";
import type { FunnelReport, LeadQualityReport, FeedbackReport, StakeholderReport } from "../src/reporting";

// =============================================================================
// Stakeholder Reporting Contract Tests
// =============================================================================

describe("REPORT_REGISTRY", () => {
    it("has 3 report definitions", () => {
        expect(REPORT_REGISTRY).toHaveLength(3);
    });

    it("includes funnel_overview", () => {
        expect(REPORT_REGISTRY.some(r => r.reportId === "funnel_overview")).toBe(true);
    });

    it("includes lead_quality", () => {
        expect(REPORT_REGISTRY.some(r => r.reportId === "lead_quality")).toBe(true);
    });

    it("includes feedback_summary", () => {
        expect(REPORT_REGISTRY.some(r => r.reportId === "feedback_summary")).toBe(true);
    });

    it("all reports have audience arrays", () => {
        for (const report of REPORT_REGISTRY) {
            expect(report.audience.length).toBeGreaterThan(0);
        }
    });

    it("all reports have frequency", () => {
        for (const report of REPORT_REGISTRY) {
            expect(["daily", "weekly"]).toContain(report.frequency);
        }
    });
});

describe("FunnelReport type", () => {
    it("satisfies the interface", () => {
        const report: FunnelReport = {
            reportId: "funnel_overview",
            title: "Conversion Funnel Overview",
            audience: ["admin", "internal"],
            frequency: "daily",
            sections: {
                funnelConversion: {
                    totalVisitors: 1000,
                    stageConversions: [{ stage: "landing", count: 500, conversionRate: 50 }],
                },
                dropOffs: [{ name: "Landing → Registration", severity: "high", rate: 40 }],
                timing: {
                    avgQualificationTime: 180,
                    avgEmailVerificationTime: 3600,
                    avgStepTime: { "step_1": 30 },
                },
            },
        };
        expect(report.reportId).toBe("funnel_overview");
    });
});

describe("LeadQualityReport type", () => {
    it("satisfies the interface", () => {
        const report: LeadQualityReport = {
            reportId: "lead_quality",
            title: "Lead Quality & Scoring",
            audience: ["admin"],
            frequency: "weekly",
            sections: {
                scoreDistribution: [{ tier: "hot", count: 50, percentage: 25 }],
                topSignals: [{ signal: "email_verified", frequency: 80 }],
                businessTypeBreakdown: [{ type: "Wholesaler", count: 30, avgScore: 65 }],
            },
        };
        expect(report.reportId).toBe("lead_quality");
    });
});

describe("FeedbackReport type", () => {
    it("satisfies the interface", () => {
        const report: FeedbackReport = {
            reportId: "feedback_summary",
            title: "Stakeholder Feedback Summary",
            audience: ["admin", "internal"],
            frequency: "weekly",
            sections: {
                overview: { total: 100, byStatus: { reviewed: 50 }, byGroup: { admin: 20 }, avgRating: 4.2 },
                promptEngagement: { totalPromptsSeen: 200, totalDismissed: 50, totalSubmitted: 80, engagementRate: 40 },
                pendingReview: 15,
            },
        };
        expect(report.reportId).toBe("feedback_summary");
    });
});
