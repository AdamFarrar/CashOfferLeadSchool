// =============================================================================
// @cocs/email — Send Log Writer
// =============================================================================
// Records every email send attempt for auditability.
// =============================================================================

import { db } from "@cocs/database/client";
import { emailSendLog } from "@cocs/database/schema";

export interface SendLogEntry {
    eventKey: string;
    templateKey: string;
    templateVersionId: string | null;
    recipientEmail: string;
    subject: string;
    status: "sent" | "failed" | "fallback";
    source: "org" | "system" | "fallback";
    resendMessageId?: string;
    errorMessage?: string;
    organizationId: string | null;
    userId: string;
    correlationId: string;
    automationRuleId?: string;
}

/**
 * Write a send log entry for auditability.
 */
export async function logEmailSend(entry: SendLogEntry): Promise<void> {
    try {
        await db.insert(emailSendLog).values({
            eventKey: entry.eventKey,
            templateKey: entry.templateKey,
            templateVersionId: entry.templateVersionId ?? undefined,
            recipientEmail: entry.recipientEmail,
            subject: entry.subject,
            status: entry.status,
            source: entry.source,
            resendMessageId: entry.resendMessageId ?? null,
            errorMessage: entry.errorMessage ?? null,
            organizationId: entry.organizationId ?? undefined,
            userId: entry.userId,
            correlationId: entry.correlationId,
            automationRuleId: entry.automationRuleId ?? undefined,
        });
    } catch (err) {
        // Log failure must never crash the email pipeline
        console.error("[EMAIL] Failed to write send log:", err);
    }
}
