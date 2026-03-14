// =============================================================================
// @cols/email — Placeholder Registry
// =============================================================================
// Defines the set of allowed placeholders for email templates.
// Placeholders are injected AFTER sanitization to prevent XSS.
// =============================================================================

export interface PlaceholderDefinition {
    key: string;
    description: string;
    required: boolean;
    defaultValue?: string;
}

/**
 * Global placeholder registry.
 * Every template can use these placeholders with {{key}} syntax.
 */
export const PLACEHOLDER_REGISTRY: PlaceholderDefinition[] = [
    { key: "user_name", description: "Recipient's display name", required: false, defaultValue: "there" },
    { key: "email", description: "Recipient's email address", required: true },
    { key: "verification_url", description: "Email verification link", required: false },
    { key: "reset_url", description: "Password reset link", required: false },
    { key: "support_email", description: "Support email address", required: false, defaultValue: "support@cashofferleadschool.com" },
    { key: "app_name", description: "Application name", required: false, defaultValue: "Cash Offer Lead School" },
    { key: "app_url", description: "Application base URL", required: false, defaultValue: "https://cashofferleadschool.com" },
    { key: "organization_name", description: "User's organization name", required: false },
];

/**
 * Validate that all required placeholders are present in the data.
 * Returns list of missing required placeholders.
 */
export function validatePlaceholders(
    templateHtml: string,
    data: Record<string, string>,
): string[] {
    const missing: string[] = [];
    const usedPlaceholders = templateHtml.match(/\{\{(\w+)\}\}/g)?.map(m => m.slice(2, -2)) ?? [];

    for (const ph of usedPlaceholders) {
        const def = PLACEHOLDER_REGISTRY.find(p => p.key === ph);
        if (def?.required && !data[ph]) {
            missing.push(ph);
        }
    }

    return missing;
}

/**
 * Inject placeholder values into template HTML.
 * Uses {{key}} syntax. Applies defaults for missing optional values.
 */
export function injectPlaceholders(
    html: string,
    data: Record<string, string>,
): string {
    let result = html;

    for (const def of PLACEHOLDER_REGISTRY) {
        const value = data[def.key] ?? def.defaultValue ?? "";
        result = result.replaceAll(`{{${def.key}}}`, value);
    }

    // Also replace any data keys not in the registry (custom template vars)
    for (const [key, value] of Object.entries(data)) {
        result = result.replaceAll(`{{${key}}}`, value);
    }

    return result;
}
