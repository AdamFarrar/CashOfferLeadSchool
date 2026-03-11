// =============================================================================
// @cocs/email — Renderer Pipeline
// =============================================================================
// Sanitize → Validate → Inject → Verify
// Sanitization happens BEFORE variable injection to prevent XSS.
// =============================================================================

import { sanitizeHtml } from "./sanitizer";
import { validatePlaceholders, injectPlaceholders } from "./placeholders";

export interface RenderResult {
    html: string;
    subject: string;
}

/**
 * Full render pipeline: sanitize → validate → inject.
 *
 * Note: CSS inlining (juice) was removed because it requires filesystem
 * access to read default-stylesheet.css, which breaks in Next.js standalone
 * Docker builds. All templates use inline styles already.
 * If <style> block support is needed later, add juice back with a proper
 * Dockerfile COPY for its CSS assets.
 */
export async function renderEmail(
    templateHtml: string,
    templateSubject: string,
    data: Record<string, string>,
): Promise<RenderResult> {
    // 1. Sanitize — remove dangerous HTML before touching variables
    const sanitized = sanitizeHtml(templateHtml);

    // 2. Validate — check for missing required placeholders
    const missing = validatePlaceholders(sanitized, data);
    if (missing.length > 0) {
        console.warn(`[EMAIL] Missing required placeholders: ${missing.join(", ")}`);
    }

    // 3. Inject — replace {{key}} with values
    const injected = injectPlaceholders(sanitized, data);

    // 4. Verify — ensure no unresolved placeholders remain
    const unresolved = injected.match(/\{\{\w+\}\}/g);
    if (unresolved) {
        console.warn(`[EMAIL] Unresolved placeholders: ${unresolved.join(", ")}`);
    }

    // Strip any remaining unresolved placeholders — never show {{key}} to users
    const cleaned = injected.replace(/\{\{\w+\}\}/g, "");

    // Subject also gets placeholder injection (no sanitization needed — plain text)
    const renderedSubject = injectPlaceholders(templateSubject, data);

    return {
        html: cleaned,
        subject: renderedSubject,
    };
}
