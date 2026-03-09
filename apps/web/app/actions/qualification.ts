"use server";

import {
    submitQualificationForm,
    getQualificationByUser,
} from "@cocs/services";
import { auth } from "@cocs/auth/server";
import { headers } from "next/headers";
import { db } from "@cocs/database/client";
import { member } from "@cocs/database/schema";
import { eq } from "drizzle-orm";

// =============================================================================
// Qualification Server Actions
// =============================================================================

const MAX_TEXT = 500;

async function getServerIdentity() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;

    let orgId = session.session?.activeOrganizationId || "";
    let role = "";

    if (orgId) {
        const activeMember = await auth.api.getActiveMember({ headers: await headers() }).catch(() => null);
        role = activeMember?.role || "";
    } else {
        // No active org — look up the user's first org from DB
        const membership = await db
            .select({ organizationId: member.organizationId, role: member.role })
            .from(member)
            .where(eq(member.userId, session.user.id))
            .limit(1);
        if (membership.length > 0) {
            orgId = membership[0].organizationId;
            role = membership[0].role;
        }
    }

    return {
        userId: session.user.id,
        organizationId: orgId,
        role,
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
