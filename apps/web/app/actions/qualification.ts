"use server";

import {
    submitQualificationForm,
    getQualificationByUser,
} from "@cocs/services";
import { auth } from "@cocs/auth/server";
import { headers } from "next/headers";

// =============================================================================
// Qualification Server Actions
// =============================================================================
// Thin server action layer. All DB logic lives in packages/services.
// Identity is always resolved from the authenticated session — never trusted
// from client input.
// =============================================================================

const MAX_TEXT = 500;

async function getServerIdentity() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;

    const activeMember = session.session?.activeOrganizationId
        ? await auth.api.getActiveMember({ headers: await headers() }).catch(() => null)
        : null;

    return {
        userId: session.user.id,
        organizationId: session.session?.activeOrganizationId || "",
        role: activeMember?.role || "",
    };
}

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
        console.error("Qualification submission error:", err);
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
