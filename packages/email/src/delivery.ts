// =============================================================================
// @cocs/email — Resend Delivery Adapter
// =============================================================================

import { Resend } from "resend";

export interface DeliveryOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export interface DeliveryResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

let _resend: Resend | null = null;

function getResend(): Resend | null {
    if (!_resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error("[EMAIL] RESEND_API_KEY not set — cannot deliver emails");
            return null;
        }
        _resend = new Resend(apiKey);
    }
    return _resend;
}

const DEFAULT_FROM = "Cash Offer Lead School <noreply@cashofferleadschool.com>";

/**
 * Deliver an email via Resend.
 */
export async function deliverEmail(options: DeliveryOptions): Promise<DeliveryResult> {
    const resend = getResend();
    if (!resend) {
        return { success: false, error: "Resend not configured" };
    }

    try {
        const result = await resend.emails.send({
            from: options.from ?? DEFAULT_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        if (result.error) {
            return {
                success: false,
                error: result.error.message,
            };
        }

        return {
            success: true,
            messageId: result.data?.id,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : String(err),
        };
    }
}
