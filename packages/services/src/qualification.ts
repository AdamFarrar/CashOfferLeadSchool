import { db } from "@cocs/database/client";
import { qualificationForm } from "@cocs/database/schema";
import { eq, and } from "drizzle-orm";

// =============================================================================
// Qualification Service — Phase 1
// =============================================================================
// Business logic for operator qualification submission and status checks.
// Handles upsert logic: first submission creates, subsequent updates.
// =============================================================================

interface QualificationData {
    userId: string;
    organizationId: string;
    businessName: string;
    businessType: string;
    yearsExperience?: string;
    monthlyBudget?: string;
    marketArea: string;
    currentLeadSources?: string;
    goals?: string;
    responses?: Record<string, unknown>;
}

export async function submitQualificationForm(data: QualificationData) {
    const now = new Date();

    // Check for existing submission (upsert)
    const existing = await db
        .select({ id: qualificationForm.id })
        .from(qualificationForm)
        .where(
            and(
                eq(qualificationForm.userId, data.userId),
                eq(qualificationForm.organizationId, data.organizationId)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        await db
            .update(qualificationForm)
            .set({
                businessName: data.businessName.trim(),
                businessType: data.businessType.trim(),
                yearsExperience: data.yearsExperience?.trim() || null,
                monthlyBudget: data.monthlyBudget?.trim() || null,
                marketArea: data.marketArea.trim(),
                currentLeadSources: data.currentLeadSources?.trim() || null,
                goals: data.goals?.trim() || null,
                responses: data.responses || {},
                submittedAt: now,
                updatedAt: now,
            })
            .where(eq(qualificationForm.id, existing[0].id));
    } else {
        await db.insert(qualificationForm).values({
            userId: data.userId,
            organizationId: data.organizationId,
            businessName: data.businessName.trim(),
            businessType: data.businessType.trim(),
            yearsExperience: data.yearsExperience?.trim() || null,
            monthlyBudget: data.monthlyBudget?.trim() || null,
            marketArea: data.marketArea.trim(),
            currentLeadSources: data.currentLeadSources?.trim() || null,
            goals: data.goals?.trim() || null,
            responses: data.responses || {},
            submittedAt: now,
        });
    }

    return { success: true };
}

export async function getQualificationByUser(userId: string, organizationId: string) {
    const result = await db
        .select({
            id: qualificationForm.id,
            submittedAt: qualificationForm.submittedAt,
            businessName: qualificationForm.businessName,
        })
        .from(qualificationForm)
        .where(
            and(
                eq(qualificationForm.userId, userId),
                eq(qualificationForm.organizationId, organizationId)
            )
        )
        .limit(1);

    return result[0] || null;
}
