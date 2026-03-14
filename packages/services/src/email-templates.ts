import { db } from "@cols/database/client";
import {
    emailTemplate, emailTemplateVersion,
} from "@cols/database/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";

// =============================================================================
// Email Template Service — Phase 1.6
// =============================================================================
// CRUD operations for email templates + versioned content.
// All operations are organization-scoped.
// =============================================================================

interface CreateTemplateInput {
    key: string;
    name: string;
    description?: string;
    organizationId: string | null;
    createdBy: string;
}

interface CreateVersionInput {
    templateId: string;
    subject: string;
    htmlBody: string;
    grapesJsData?: unknown;
    createdBy: string;
}

// ── Template CRUD ──

export async function createTemplate(input: CreateTemplateInput) {
    const [result] = await db
        .insert(emailTemplate)
        .values({
            key: input.key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_"),
            name: input.name.trim(),
            description: input.description?.trim() ?? null,
            organizationId: input.organizationId,
            createdBy: input.createdBy,
        })
        .returning();
    return result;
}

export async function updateTemplate(
    templateId: string,
    data: { name?: string; description?: string },
) {
    const [result] = await db
        .update(emailTemplate)
        .set({
            name: data.name?.trim(),
            description: data.description?.trim(),
            updatedAt: new Date(),
        })
        .where(eq(emailTemplate.id, templateId))
        .returning();
    return result;
}

export async function getTemplateByKey(
    key: string,
    organizationId: string | null,
) {
    const orgFilter = organizationId
        ? eq(emailTemplate.organizationId, organizationId)
        : isNull(emailTemplate.organizationId);

    const result = await db
        .select()
        .from(emailTemplate)
        .where(and(eq(emailTemplate.key, key), orgFilter))
        .limit(1);

    return result[0] ?? null;
}

export async function getTemplateById(templateId: string) {
    const result = await db
        .select()
        .from(emailTemplate)
        .where(eq(emailTemplate.id, templateId))
        .limit(1);
    return result[0] ?? null;
}

export async function listTemplates(organizationId: string | null) {
    const orgFilter = organizationId
        ? eq(emailTemplate.organizationId, organizationId)
        : isNull(emailTemplate.organizationId);

    return db
        .select()
        .from(emailTemplate)
        .where(orgFilter)
        .orderBy(desc(emailTemplate.updatedAt));
}

export async function listAllTemplates() {
    return db
        .select()
        .from(emailTemplate)
        .orderBy(desc(emailTemplate.updatedAt));
}

export async function deleteTemplate(templateId: string) {
    await db.delete(emailTemplate).where(eq(emailTemplate.id, templateId));
}

// ── Version CRUD ──

export async function createTemplateVersion(input: CreateVersionInput) {
    // Get next version number
    const [maxVersion] = await db
        .select({ max: sql<number>`COALESCE(MAX(${emailTemplateVersion.version}), 0)` })
        .from(emailTemplateVersion)
        .where(eq(emailTemplateVersion.templateId, input.templateId));

    const nextVersion = (maxVersion?.max ?? 0) + 1;

    const [result] = await db
        .insert(emailTemplateVersion)
        .values({
            templateId: input.templateId,
            version: nextVersion,
            subject: input.subject.trim(),
            htmlBody: input.htmlBody,
            grapesJsData: input.grapesJsData ?? null,
            createdBy: input.createdBy,
        })
        .returning();
    return result;
}

export async function listVersions(templateId: string) {
    return db
        .select()
        .from(emailTemplateVersion)
        .where(eq(emailTemplateVersion.templateId, templateId))
        .orderBy(desc(emailTemplateVersion.version));
}

export async function getVersion(versionId: string) {
    const result = await db
        .select()
        .from(emailTemplateVersion)
        .where(eq(emailTemplateVersion.id, versionId))
        .limit(1);
    return result[0] ?? null;
}

export async function getPublishedVersion(templateId: string) {
    const result = await db
        .select()
        .from(emailTemplateVersion)
        .where(
            and(
                eq(emailTemplateVersion.templateId, templateId),
                eq(emailTemplateVersion.published, true),
            ),
        )
        .limit(1);
    return result[0] ?? null;
}

/**
 * Publish a version. Unpublishes any currently published version first.
 * Uses a transaction to ensure atomicity.
 */
export async function publishTemplateVersion(
    templateId: string,
    versionId: string,
) {
    await db.transaction(async (tx) => {
        // Unpublish current
        await tx
            .update(emailTemplateVersion)
            .set({ published: false, publishedAt: null })
            .where(
                and(
                    eq(emailTemplateVersion.templateId, templateId),
                    eq(emailTemplateVersion.published, true),
                ),
            );
        // Publish target
        await tx
            .update(emailTemplateVersion)
            .set({ published: true, publishedAt: new Date() })
            .where(eq(emailTemplateVersion.id, versionId));
    });
}

/**
 * Rollback to a previous version by publishing it.
 */
export async function rollbackTemplateVersion(
    templateId: string,
    targetVersionId: string,
) {
    return publishTemplateVersion(templateId, targetVersionId);
}
