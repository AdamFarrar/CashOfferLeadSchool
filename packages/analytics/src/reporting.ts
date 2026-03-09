// =============================================================================
// D11: Stakeholder Reporting Contracts
// =============================================================================
// Typed report definitions for different stakeholders.
// These contracts define what data each report contains and how it's structured.
// PostHog dashboard specs (D12) implement these contracts.
// =============================================================================

export interface FunnelReport {
    /** Report identifier */
    reportId: "funnel_overview";
    /** Report title */
    title: "Conversion Funnel Overview";
    /** Stakeholders who receive this report */
    audience: ("admin" | "internal")[];
    /** Cadence */
    frequency: "daily" | "weekly";
    /** Sections */
    sections: {
        /** Overall funnel conversion from landing to dashboard */
        funnelConversion: {
            /** Total unique visitors */
            totalVisitors: number;
            /** Conversion by stage */
            stageConversions: {
                stage: string;
                count: number;
                conversionRate: number;
            }[];
        };
        /** Critical drop-off points */
        dropOffs: {
            name: string;
            severity: string;
            rate: number;
        }[];
        /** Time metrics */
        timing: {
            avgQualificationTime: number;
            avgEmailVerificationTime: number;
            avgStepTime: Record<string, number>;
        };
    };
}

export interface LeadQualityReport {
    reportId: "lead_quality";
    title: "Lead Quality & Scoring";
    audience: ("admin" | "internal")[];
    frequency: "weekly";
    sections: {
        /** Score distribution */
        scoreDistribution: {
            tier: string;
            count: number;
            percentage: number;
        }[];
        /** Top signals */
        topSignals: {
            signal: string;
            frequency: number;
        }[];
        /** Business type breakdown */
        businessTypeBreakdown: {
            type: string;
            count: number;
            avgScore: number;
        }[];
    };
}

export interface FeedbackReport {
    reportId: "feedback_summary";
    title: "Stakeholder Feedback Summary";
    audience: ("admin" | "internal")[];
    frequency: "weekly";
    sections: {
        /** Overall stats */
        overview: {
            total: number;
            byStatus: Record<string, number>;
            byGroup: Record<string, number>;
            avgRating: number;
        };
        /** Prompt engagement */
        promptEngagement: {
            totalPromptsSeen: number;
            totalDismissed: number;
            totalSubmitted: number;
            engagementRate: number;
        };
        /** Recent unreviewed */
        pendingReview: number;
    };
}

/** Union type of all report contracts */
export type StakeholderReport = FunnelReport | LeadQualityReport | FeedbackReport;

/** Report registry for automated generation */
export const REPORT_REGISTRY = [
    { reportId: "funnel_overview", frequency: "daily", audience: ["admin", "internal"] },
    { reportId: "lead_quality", frequency: "weekly", audience: ["admin", "internal"] },
    { reportId: "feedback_summary", frequency: "weekly", audience: ["admin", "internal"] },
] as const;
