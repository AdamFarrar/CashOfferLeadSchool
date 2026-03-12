"use server";

import {
    submitQualificationForm,
    getQualificationByUser,
    checkRateLimit,
    rateLimitKey,
    RATE_LIMITS,
} from "@cocs/services";
import { getServerIdentity } from "./identity";

// =============================================================================
// Qualification Server Actions
// =============================================================================

const MAX_TEXT = 500;

interface SubmitQualificationInput {
    businessName: string;
    businessType: string;
    yearsExperience: string;
    monthlyBudget: string;
    marketArea: string;
    currentLeadSources: string;
    goals: string;
    responses?: Record<string, unknown>;
}

export async function submitQualification(data: SubmitQualificationInput) {
    // Resolve identity server-side — never trust client
    const identity = await getServerIdentity();
    if (!identity || !identity.organizationId) {
        return { success: false, error: "Authentication required." };
    }

    // Rate limit: 5 per hour per user
    const rl = checkRateLimit(
        rateLimitKey("qualification", identity.userId),
        RATE_LIMITS.qualification,
    );
    if (!rl.allowed) {
        return { success: false, error: "Too many submissions. Please try again later." };
    }

    // Validate required fields
    if (!data.businessName?.trim()) {
        return { success: false, error: "Business name is required." };
    }

    if (!data.businessType?.trim()) {
        return { success: false, error: "Business type is required." };
    }

    if (!data.marketArea?.trim()) {
        return { success: false, error: "Market area is required." };
    }

    // Length limits to prevent abuse
    const textFields = [
        data.businessName,
        data.businessType,
        data.yearsExperience,
        data.monthlyBudget,
        data.marketArea,
        data.currentLeadSources,
        data.goals,
    ];

    for (const field of textFields) {
        if (field && field.length > MAX_TEXT) {
            return { success: false, error: `Fields must be under ${MAX_TEXT} characters.` };
        }
    }

    try {
        return await submitQualificationForm({
            userId: identity.userId,
            organizationId: identity.organizationId,
            businessName: data.businessName,
            businessType: data.businessType,
            yearsExperience: data.yearsExperience,
            monthlyBudget: data.monthlyBudget,
            marketArea: data.marketArea,
            currentLeadSources: data.currentLeadSources,
            goals: data.goals,
            responses: data.responses,
        });
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Qualification submission error:", err);
        }
        return { success: false, error: "Failed to save qualification. Please try again." };
    }
}

export async function getQualificationStatus() {
    const identity = await getServerIdentity();
    if (!identity || !identity.organizationId) return null;

    try {
        return await getQualificationByUser(identity.userId, identity.organizationId);
    } catch {
        return null;
    }
}
