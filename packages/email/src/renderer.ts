// =============================================================================
// @cocs/email — Renderer Pipeline
// =============================================================================
// Sanitize → Validate → Inject → Verify → Inline CSS
// Sanitization happens BEFORE variable injection to prevent XSS.
// =============================================================================

import { sanitizeHtml } from "./sanitizer";
import { validatePlaceholders, injectPlaceholders } from "./placeholders";

export interface RenderResult {
    html: string;
    subject: string;
}

/**
 * Full render pipeline: sanitize → validate → inject → inline CSS.
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

    // 5. Inline CSS — convert <style> blocks to inline styles for email clients
    //    Dynamic import: juice reads default-stylesheet.css from disk at module
    //    load time. In Next.js standalone/Docker builds, that file doesn't exist.
    //    Dynamic import defers the load so we can catch it.
    //    Fallback templates use inline styles, so skipping juice is safe.
    let inlined: string;
    try {
        const juice = (await import("juice")).default;
        inlined = juice(cleaned, { extraCss: "" });
    } catch (err) {
        console.warn("[EMAIL] juice CSS inlining skipped:", err instanceof Error ? err.message : err);
        inlined = cleaned;
    }

    // Subject also gets placeholder injection (no sanitization needed — plain text)
    const renderedSubject = injectPlaceholders(templateSubject, data);

    return {
        html: inlined,
        subject: renderedSubject,
    };
}
