// =============================================================================
// @cocs/email — Multi-Tenant Template Resolver
// =============================================================================
// Resolution order: org template → system template → hardcoded fallback
// =============================================================================

import { db } from "@cocs/database/client";
import { emailTemplate, emailTemplateVersion } from "@cocs/database/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getFallbackHtml, getFallbackSubject } from "./fallbacks";

export interface ResolvedTemplate {
    html: string;
    subject: string;
    versionId: string | null;
    source: "org" | "system" | "fallback";
}

/**
 * Resolve a template by key with multi-tenant fallback:
 * 1. Org-specific published template
 * 2. System-level published template
 * 3. Hardcoded fallback
 */
export async function resolveTemplate(
    templateKey: string,
    organizationId: string | null,
): Promise<ResolvedTemplate> {
    // 1. Try org-specific template
    if (organizationId) {
        const orgResult = await findPublishedTemplate(templateKey, organizationId);
        if (orgResult) return { ...orgResult, source: "org" };
    }

    // 2. Try system template
    const systemResult = await findPublishedTemplate(templateKey, null);
    if (systemResult) return { ...systemResult, source: "system" };

    // 3. Hardcoded fallback
    console.warn(`[EMAIL] No template found for "${templateKey}" — using fallback`);
    return {
        html: getFallbackHtml(templateKey),
        subject: getFallbackSubject(templateKey),
        versionId: null,
        source: "fallback",
    };
}

async function findPublishedTemplate(
    key: string,
    organizationId: string | null,
): Promise<{ html: string; subject: string; versionId: string } | null> {
    const orgFilter = organizationId
        ? eq(emailTemplate.organizationId, organizationId)
        : isNull(emailTemplate.organizationId);

    const result = await db
        .select({
            versionId: emailTemplateVersion.id,
            subject: emailTemplateVersion.subject,
            html: emailTemplateVersion.htmlBody,
        })
        .from(emailTemplate)
        .innerJoin(
            emailTemplateVersion,
            eq(emailTemplate.id, emailTemplateVersion.templateId),
        )
        .where(
            and(
                eq(emailTemplate.key, key),
                orgFilter,
                eq(emailTemplateVersion.published, true),
            ),
        )
        .limit(1);

    if (result.length === 0) return null;

    return {
        html: result[0].html,
        subject: result[0].subject,
        versionId: result[0].versionId,
    };
}
