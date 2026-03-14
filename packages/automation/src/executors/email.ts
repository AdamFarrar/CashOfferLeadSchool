// =============================================================================
// @cols/automation — Email Channel Executor
// =============================================================================
// Invokes the @cols/email pipeline: resolve → render → deliver → log.
// =============================================================================

import type { ChannelExecutor, PlannedAction, ExecutorContext, ExecutorResult } from "../types";
import { resolveTemplate, renderEmail, deliverEmail, logEmailSend } from "@cols/email";

export const emailExecutor: ChannelExecutor = {
    channel: "email",

    async execute(
        action: PlannedAction,
        eventPayload: Record<string, unknown>,
        context: ExecutorContext,
    ): Promise<ExecutorResult> {
        const templateKey = (action.actionConfig.templateKey as string) ?? action.actionType;
        const recipientEmail = eventPayload.email as string;

        if (!recipientEmail) {
            return { success: false, error: "No recipient email in event payload" };
        }

        // 1. Resolve template (org → system → fallback)
        const resolution = await resolveTemplate(templateKey, context.organizationId);

        // 2. Render (sanitize → inject → inline CSS)
        const data: Record<string, string> = {};
        for (const [key, value] of Object.entries(eventPayload)) {
            if (typeof value === "string") {
                data[key] = value;
            }
        }
        data.support_email = data.support_email ?? "support@cashofferleadschool.com";
        data.app_name = data.app_name ?? "Cash Offer Lead School";
        data.user_name = data.user_name ?? data.userName ?? "there";

        const rendered = await renderEmail(resolution.html, resolution.subject, data);

        // 3. Deliver via Resend
        const delivery = await deliverEmail({
            to: recipientEmail,
            subject: rendered.subject,
            html: rendered.html,
        });

        // 4. Log
        await logEmailSend({
            eventKey: context.eventKey,
            templateKey,
            templateVersionId: resolution.versionId,
            recipientEmail,
            subject: rendered.subject,
            status: delivery.success ? "sent" : (resolution.source === "fallback" ? "fallback" : "failed"),
            source: resolution.source,
            resendMessageId: delivery.messageId,
            errorMessage: delivery.error,
            organizationId: context.organizationId,
            userId: context.userId,
            correlationId: context.correlationId,
            automationRuleId: action.ruleId,
        });

        return delivery;
    },
};
