-- =============================================================================
-- Migration 0004: Audit Log — Fix cascade deletion  
-- =============================================================================
-- Audit logs must survive organization deletion.
-- Changes organization_id from NOT NULL CASCADE to nullable SET NULL.
-- =============================================================================

-- Make column nullable
ALTER TABLE audit_log ALTER COLUMN organization_id DROP NOT NULL;

-- Replace cascade FK with set null FK
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_organization_id_organization_id_fk;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_organization_id_organization_id_fk
    FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE SET NULL;

-- Also add "test" source to email_send_log for rate-limited test sends
-- (source column is text, not enum, so no ALTER needed)
