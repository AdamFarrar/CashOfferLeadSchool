// =============================================================================
// @cocs/email — HTML Sanitizer (Lightweight, No JSDOM)
// =============================================================================
// Strips dangerous elements from email HTML without requiring jsdom.
// For system-controlled templates (verification, welcome, password reset),
// aggressive sanitization is unnecessary. This sanitizer removes scripts,
// event handlers, and dangerous tags while preserving safe email HTML.
//
// Note: isomorphic-dompurify was removed because it imports jsdom which
// reads default-stylesheet.css from disk — incompatible with Next.js
// standalone Docker builds.
// =============================================================================

/**
 * Sanitize HTML for email: strip scripts, event handlers, and dangerous elements.
 * This is a lightweight sanitizer for system-controlled templates.
 */
export function sanitizeHtml(html: string): string {
    let result = html;

    // Remove <script> tags and content
    result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    // Remove <iframe>, <object>, <embed>, <form>, <input>, <textarea>, <select>
    result = result.replace(/<(iframe|object|embed|form|input|textarea|select)\b[^>]*\/?>/gi, "");
    result = result.replace(/<\/(iframe|object|embed|form|input|textarea|select)>/gi, "");

    // Remove event handler attributes (on*)
    result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

    // Remove javascript: URLs
    result = result.replace(/href\s*=\s*["']?\s*javascript\s*:[^"'>\s]*/gi, 'href="#"');

    return result;
}
