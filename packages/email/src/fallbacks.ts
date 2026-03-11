// =============================================================================
// @cocs/email — Hardcoded Fallback Templates
// =============================================================================
// Used when no database template exists. These ensure critical emails
// (verification, password reset) always send even before admin setup.
// =============================================================================

const FALLBACKS: Record<string, { subject: string; html: string }> = {
    verification: {
        subject: "Verify your email — {{app_name}}",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a1a2e;">Welcome to {{app_name}}</h2>
                <p>Hi {{user_name}},</p>
                <p>Click the link below to verify your email address:</p>
                <p style="margin: 24px 0;">
                    <a href="{{verification_url}}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                        Verify Email
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #999; font-size: 12px;">{{app_name}} — {{support_email}}</p>
            </div>
        `.trim(),
    },

    password_reset: {
        subject: "Reset your password — {{app_name}}",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a1a2e;">Password Reset</h2>
                <p>Hi {{user_name}},</p>
                <p>We received a request to reset your password. Click the link below:</p>
                <p style="margin: 24px 0;">
                    <a href="{{reset_url}}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                        Reset Password
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #999; font-size: 12px;">{{app_name}} — {{support_email}}</p>
            </div>
        `.trim(),
    },

    welcome: {
        subject: "Welcome to {{app_name}}!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a1a2e;">Welcome, {{user_name}}!</h2>
                <p>Thanks for joining {{app_name}}. Your account is all set.</p>
                <p>Head to your dashboard to get started:</p>
                <p style="margin: 24px 0;">
                    <a href="{{app_url}}/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                        Go to Dashboard
                    </a>
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #999; font-size: 12px;">{{app_name}} — {{support_email}}</p>
            </div>
        `.trim(),
    },
};

const DEFAULT_FALLBACK = {
    subject: "Notification from {{app_name}}",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p>You have a new notification from {{app_name}}.</p>
            <p style="color: #999; font-size: 12px;">{{support_email}}</p>
        </div>
    `.trim(),
};

export function getFallbackHtml(templateKey: string): string {
    return FALLBACKS[templateKey]?.html ?? DEFAULT_FALLBACK.html;
}

export function getFallbackSubject(templateKey: string): string {
    return FALLBACKS[templateKey]?.subject ?? DEFAULT_FALLBACK.subject;
}
