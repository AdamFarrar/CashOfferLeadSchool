-- =============================================================================
-- Phase 1.6 Migration: Email Templates + Automation System
-- =============================================================================
-- Tables: email_template, email_template_version, email_send_log,
--         automation_rule, automation_action_log, automation_delayed_action
-- =============================================================================

-- Enums
CREATE TYPE email_send_status AS ENUM ('sent', 'failed', 'fallback');
CREATE TYPE automation_action_status AS ENUM ('planned', 'completed', 'failed');

-- ── email_template ──
CREATE TABLE email_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_email_template_system_key
    ON email_template (key)
    WHERE organization_id IS NULL;

CREATE UNIQUE INDEX uq_email_template_org_key
    ON email_template (organization_id, key)
    WHERE organization_id IS NOT NULL;

CREATE INDEX idx_email_template_key
    ON email_template (key, organization_id);

-- ── email_template_version ──
CREATE TABLE email_template_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES email_template(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    grapesjs_data JSONB,
    published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_email_version_published
    ON email_template_version (template_id)
    WHERE published = true;

CREATE UNIQUE INDEX uq_email_version_number
    ON email_template_version (template_id, version);

-- ── email_send_log ──
CREATE TABLE email_send_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_key TEXT NOT NULL,
    template_key TEXT NOT NULL,
    template_version_id UUID,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status email_send_status NOT NULL,
    source TEXT NOT NULL,
    resend_message_id TEXT,
    error_message TEXT,
    organization_id UUID,
    user_id TEXT,
    correlation_id TEXT,
    automation_rule_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_send_log_event
    ON email_send_log (event_key, created_at);

CREATE INDEX idx_email_send_log_org
    ON email_send_log (organization_id, created_at);

CREATE INDEX idx_email_send_log_correlation
    ON email_send_log (correlation_id);

-- ── automation_rule ──
CREATE TABLE automation_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_key TEXT NOT NULL,
    organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 100,
    conditions JSONB,
    action_channel TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_config JSONB NOT NULL,
    delay_ms INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 0,
    retry_delay_ms INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_automation_rule_system
    ON automation_rule (event_key, action_channel, action_type)
    WHERE organization_id IS NULL;

CREATE INDEX idx_automation_rule_lookup
    ON automation_rule (event_key, organization_id, enabled);

-- ── automation_action_log ──
CREATE TABLE automation_action_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    event_key TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    causation_id TEXT,
    rule_id UUID NOT NULL REFERENCES automation_rule(id),
    rule_name TEXT,
    channel TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_config JSONB,
    status automation_action_status NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    error_message TEXT,
    executor_message_id TEXT,
    organization_id UUID,
    user_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_automation_action_event_rule
    ON automation_action_log (event_id, rule_id);

CREATE INDEX idx_automation_action_correlation
    ON automation_action_log (correlation_id);

CREATE INDEX idx_automation_action_status
    ON automation_action_log (status, created_at);

-- ── automation_delayed_action ──
CREATE TABLE automation_delayed_action (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_log_id UUID NOT NULL REFERENCES automation_action_log(id),
    execute_at TIMESTAMPTZ NOT NULL,
    executed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- RLS: deny-all for anon, application uses postgres role
-- =============================================================================
ALTER TABLE email_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_delayed_action ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Seed: Default System Automation Rules
-- =============================================================================
INSERT INTO automation_rule (event_key, name, action_channel, action_type, action_config, enabled, priority)
VALUES
    ('verification_email_requested', 'Send verification email', 'email', 'send_template', '{"templateKey":"verification"}', true, 10),
    ('password_requested', 'Send password reset email', 'email', 'send_template', '{"templateKey":"password_reset"}', true, 10),
    ('qualification_submitted', 'Send welcome email', 'email', 'send_template', '{"templateKey":"welcome"}', true, 10);

-- =============================================================================
-- Seed: Default System Email Templates + Published Fallback Versions
-- =============================================================================
WITH verification_template AS (
    INSERT INTO email_template (key, name, description)
    VALUES ('verification', 'Email Verification', 'Sent when a user registers and needs to verify their email')
    RETURNING id
)
INSERT INTO email_template_version (template_id, version, subject, html_body, published, published_at)
SELECT id, 1, 'Verify your email — {{app_name}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #1a1a2e;">Welcome to {{app_name}}</h2><p>Hi {{user_name}},</p><p>Click the link below to verify your email address:</p><p style="margin: 24px 0;"><a href="{{verification_url}}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Verify Email</a></p><p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p><hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" /><p style="color: #999; font-size: 12px;">{{app_name}} — {{support_email}}</p></div>',
    true, now()
FROM verification_template;

WITH reset_template AS (
    INSERT INTO email_template (key, name, description)
    VALUES ('password_reset', 'Password Reset', 'Sent when a user requests a password reset')
    RETURNING id
)
INSERT INTO email_template_version (template_id, version, subject, html_body, published, published_at)
SELECT id, 1, 'Reset your password — {{app_name}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #1a1a2e;">Password Reset</h2><p>Hi {{user_name}},</p><p>We received a request to reset your password. Click the link below:</p><p style="margin: 24px 0;"><a href="{{reset_url}}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Reset Password</a></p><p style="color: #666; font-size: 14px;">If you didn''t request this, you can safely ignore this email.</p><hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" /><p style="color: #999; font-size: 12px;">{{app_name}} — {{support_email}}</p></div>',
    true, now()
FROM reset_template;

WITH welcome_template AS (
    INSERT INTO email_template (key, name, description)
    VALUES ('welcome', 'Welcome Email', 'Sent after qualification form submission')
    RETURNING id
)
INSERT INTO email_template_version (template_id, version, subject, html_body, published, published_at)
SELECT id, 1, 'Welcome to {{app_name}}!',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #1a1a2e;">Welcome, {{user_name}}!</h2><p>Thank you for completing your qualification. You''re now set up and ready to go.</p><hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" /><p style="color: #999; font-size: 12px;">{{app_name}} — {{support_email}}</p></div>',
    true, now()
FROM welcome_template;
