// =============================================================================
// @cocs/email — HTML Sanitizer (Singleton DOMPurify)
// =============================================================================
// Module-level DOMPurify instance — instantiated ONCE at import time.
// Eliminates ~50-100ms cold start per render from JSDOM initialization.
// =============================================================================

import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "style",
    "a", "img",
    "table", "thead", "tbody", "tr", "td", "th",
    "div", "span", "section",
    "strong", "em", "b", "i", "u",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
];

const ALLOWED_ATTRS = [
    "href", "src", "alt", "title", "width", "height",
    "style", "class", "align", "valign", "bgcolor",
    "border", "cellpadding", "cellspacing", "colspan", "rowspan",
];

/**
 * Sanitize HTML using a strict allowlist.
 * Removes scripts, event handlers, and dangerous elements.
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: ALLOWED_ATTRS,
        ALLOW_DATA_ATTR: false,
    });
}
