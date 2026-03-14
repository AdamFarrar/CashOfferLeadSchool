// =============================================================================
// @cols/email — Hardcoded Fallback Templates
// =============================================================================
// Used when no database template exists. These ensure critical emails
// (verification, password reset) always send even before admin setup.
//
// Design: Dark premium aesthetic matching the app's MasterClass-inspired
// design system. Brand color #e32652, dark backgrounds, institutional tone.
// =============================================================================

// ── Shared layout wrapper ──
function wrapLayout(body: string, preheader: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>Cash Offer Lead School</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <!-- Preheader text (hidden but shown in email client previews) -->
    <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #0d0d0d;">
        ${preheader}
        ${"&nbsp;&zwnj;".repeat(30)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d0d0d;">
        <tr>
            <td align="center" style="padding: 40px 16px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

                    <!-- Logo / Wordmark -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <span style="font-size: 18px; font-weight: 700; letter-spacing: 0.5px; color: #ffffff;">
                                CASH OFFER LEAD SCHOOL
                            </span>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td style="background-color: #1a1a1a; border: 1px solid #222222; border-radius: 10px; padding: 40px 36px;">
                            ${body}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 32px;">
                            <p style="margin: 0 0 8px; font-size: 12px; color: #9ea0a9; line-height: 1.5;">
                                Cash Offer Lead School &mdash; Professional Education for Real Estate Operators
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #666666; line-height: 1.5;">
                                {{support_email}} &bull; <a href="{{app_url}}" style="color: #9ea0a9; text-decoration: underline;">cashofferleadschool.com</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

// ── CTA Button ──
function ctaButton(href: string, label: string): string {
    return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
    <tr>
        <td align="center" style="background-color: #e32652; border-radius: 6px;">
            <a href="${href}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                ${label}
            </a>
        </td>
    </tr>
</table>
    `.trim();
}

// ── Divider ──
const divider = '<hr style="border: none; border-top: 1px solid #222222; margin: 28px 0;" />';

const FALLBACKS: Record<string, { subject: string; html: string }> = {
    verification: {
        subject: "Verify Your Email Address — {{app_name}}",
        html: wrapLayout(`
            <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #ffffff; line-height: 1.3;">
                Verify Your Email Address
            </h2>
            <p style="margin: 0 0 8px; font-size: 15px; color: #d4d5d9; line-height: 1.6;">
                Hello {{user_name}},
            </p>
            <p style="margin: 0 0 24px; font-size: 15px; color: #d4d5d9; line-height: 1.6;">
                Thank you for registering with {{app_name}}. To complete your enrollment and activate your account, please verify your email address by clicking the button below.
            </p>
            ${ctaButton("{{verification_url}}", "Verify Email Address")}
            ${divider}
            <p style="margin: 0 0 8px; font-size: 13px; color: #9ea0a9; line-height: 1.5;">
                This verification link will expire in 24 hours. If you did not create an account, you may safely disregard this message.
            </p>
            <p style="margin: 0; font-size: 12px; color: #666666; line-height: 1.5; word-break: break-all;">
                If the button above does not work, copy and paste the following URL into your browser:<br />
                <a href="{{verification_url}}" style="color: #9ea0a9; text-decoration: underline;">{{verification_url}}</a>
            </p>
        `, "Please verify your email to complete your enrollment at Cash Offer Lead School."),
    },

    password_reset: {
        subject: "Password Reset Request — {{app_name}}",
        html: wrapLayout(`
            <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #ffffff; line-height: 1.3;">
                Password Reset Request
            </h2>
            <p style="margin: 0 0 8px; font-size: 15px; color: #d4d5d9; line-height: 1.6;">
                Hello {{user_name}},
            </p>
            <p style="margin: 0 0 24px; font-size: 15px; color: #d4d5d9; line-height: 1.6;">
                We received a request to reset the password associated with your {{app_name}} account. If you initiated this request, please click the button below to set a new password.
            </p>
            ${ctaButton("{{reset_url}}", "Reset Password")}
            ${divider}
            <p style="margin: 0 0 8px; font-size: 13px; color: #9ea0a9; line-height: 1.5;">
                This link will expire in 1 hour for security purposes. If you did not request a password reset, no action is required &mdash; your account remains secure.
            </p>
            <p style="margin: 0; font-size: 12px; color: #666666; line-height: 1.5; word-break: break-all;">
                If the button above does not work, copy and paste the following URL into your browser:<br />
                <a href="{{reset_url}}" style="color: #9ea0a9; text-decoration: underline;">{{reset_url}}</a>
            </p>
        `, "A password reset was requested for your Cash Offer Lead School account."),
    },

    welcome: {
        subject: "Welcome to {{app_name}}",
        html: wrapLayout(`
            <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #ffffff; line-height: 1.3;">
                Welcome to {{app_name}}
            </h2>
            <p style="margin: 0 0 8px; font-size: 15px; color: #d4d5d9; line-height: 1.6;">
                Hello {{user_name}},
            </p>
            <p style="margin: 0 0 24px; font-size: 15px; color: #d4d5d9; line-height: 1.6;">
                Your email has been verified and your account is now active. You have been enrolled in the program and can access your dashboard immediately.
            </p>
            ${ctaButton("{{app_url}}/dashboard", "Go to Your Dashboard")}
            ${divider}
            <p style="margin: 0; font-size: 13px; color: #9ea0a9; line-height: 1.5;">
                If you have any questions or need assistance, please don't hesitate to contact our support team at {{support_email}}.
            </p>
        `, "Your account is verified and ready. Access your dashboard to get started."),
    },
};

const DEFAULT_FALLBACK = {
    subject: "Notification from {{app_name}}",
    html: wrapLayout(`
        <p style="margin: 0 0 16px; font-size: 15px; color: #d4d5d9; line-height: 1.6;">
            You have a new notification from {{app_name}}. Please log in to your dashboard for details.
        </p>
        ${ctaButton("{{app_url}}/dashboard", "View Dashboard")}
    `, "You have a new notification from Cash Offer Lead School."),
};

export function getFallbackHtml(templateKey: string): string {
    return FALLBACKS[templateKey]?.html ?? DEFAULT_FALLBACK.html;
}

export function getFallbackSubject(templateKey: string): string {
    return FALLBACKS[templateKey]?.subject ?? DEFAULT_FALLBACK.subject;
}
