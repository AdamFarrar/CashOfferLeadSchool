"use server";

import { requireAdmin } from "./guards";
import {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    listAllTemplates,
    createTemplateVersion,
    listVersions,
    getVersion,
    publishTemplateVersion,
    rollbackTemplateVersion,
    getPublishedVersion,
} from "@cocs/services";
import { renderEmail } from "@cocs/email";
import { deliverEmail } from "@cocs/email";
import { db } from "@cocs/database/client";
import { emailSendLog } from "@cocs/database/schema";
import { sql, gte, eq, and } from "drizzle-orm";

// =============================================================================
// Email Template Server Actions — Admin Only
// =============================================================================

const TEST_EMAIL_RATE_LIMIT = 5;
const TEST_EMAIL_WINDOW_MINUTES = 15;

// ── Template Actions ──

export async function listTemplatesAction() {
    await requireAdmin();
    return listAllTemplates();
}

export async function createTemplateAction(data: {
    key: string;
    name: string;
    description?: string;
}) {
    const identity = await requireAdmin();
    return createTemplate({
        key: data.key,
        name: data.name,
        description: data.description,
        organizationId: null, // System-level templates for now
        createdBy: identity.userId,
    });
}

export async function updateTemplateAction(
    templateId: string,
    data: { name?: string; description?: string },
) {
    await requireAdmin();
    return updateTemplate(templateId, data);
}

export async function deleteTemplateAction(templateId: string) {
    await requireAdmin();
    return deleteTemplate(templateId);
}

export async function getTemplateAction(templateId: string) {
    await requireAdmin();
    return getTemplateById(templateId);
}

// ── Version Actions ──

export async function listVersionsAction(templateId: string) {
    await requireAdmin();
    return listVersions(templateId);
}

export async function saveVersionAction(data: {
    templateId: string;
    subject: string;
    htmlBody: string;
    grapesJsData?: unknown;
}) {
    const identity = await requireAdmin();
    return createTemplateVersion({
        templateId: data.templateId,
        subject: data.subject,
        htmlBody: data.htmlBody,
        grapesJsData: data.grapesJsData,
        createdBy: identity.userId,
    });
}

export async function publishVersionAction(templateId: string, versionId: string) {
    await requireAdmin();
    return publishTemplateVersion(templateId, versionId);
}

export async function rollbackVersionAction(templateId: string, versionId: string) {
    await requireAdmin();
    return rollbackTemplateVersion(templateId, versionId);
}

// ── Preview / Test ──

export async function previewTemplateAction(data: {
    htmlBody: string;
    subject: string;
    testData?: Record<string, string>;
}) {
    await requireAdmin();
    const result = await renderEmail(data.htmlBody, data.subject, data.testData ?? {
        user_name: "Test User",
        email: "test@example.com",
        verification_url: "https://example.com/verify",
        reset_url: "https://example.com/reset",
        app_name: "Cash Offer Lead School",
        support_email: "support@cashofferleadschool.com",
    });
    return result;
}

/**
 * Simple email format validation (RFC-lite).
 */
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function sendTestEmailAction(data: {
    to: string;
    htmlBody: string;
    subject: string;
}) {
    const identity = await requireAdmin();

    // Validate email format
    if (!data.to || !isValidEmail(data.to)) {
        return { success: false, error: "Invalid email address." };
    }

    // DB-backed rate limit — query recent test sends
    const windowStart = new Date(Date.now() - TEST_EMAIL_WINDOW_MINUTES * 60 * 1000);
    const recentSends = await db
        .select({ count: sql<number>`count(*)` })
        .from(emailSendLog)
        .where(
            and(
                eq(emailSendLog.source, "test"),
                gte(emailSendLog.createdAt, windowStart),
            ),
        );

    const sendCount = recentSends[0]?.count ?? 0;
    if (sendCount >= TEST_EMAIL_RATE_LIMIT) {
        return {
            success: false,
            error: `Rate limit exceeded: max ${TEST_EMAIL_RATE_LIMIT} test emails per ${TEST_EMAIL_WINDOW_MINUTES} minutes.`,
        };
    }

    const rendered = await renderEmail(data.htmlBody, data.subject, {
        user_name: "Test User",
        email: data.to,
        app_name: "Cash Offer Lead School",
        support_email: "support@cashofferleadschool.com",
    });

    const result = await deliverEmail({
        to: data.to,
        subject: `[TEST] ${rendered.subject}`,
        html: rendered.html,
    });

    // Log the test send for rate limiting + audit trail
    try {
        await db.insert(emailSendLog).values({
            eventKey: "test_email",
            templateKey: "test",
            recipientEmail: data.to,
            subject: `[TEST] ${rendered.subject}`,
            status: result.success ? "sent" : "failed",
            source: "test",
            resendMessageId: result.messageId ?? null,
            errorMessage: result.error ?? null,
            userId: identity.userId,
            correlationId: `test-${Date.now()}`,
        });
    } catch {
        // Log failure must never block the response
    }

    return result;
}
