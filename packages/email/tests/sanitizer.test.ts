import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../src/sanitizer";

// =============================================================================
// HTML Sanitizer Deep Branch Coverage Tests
// =============================================================================

describe("sanitizeHtml", () => {
    // --- Script tag removal ---

    it("strips script tags", () => {
        const html = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
        const result = sanitizeHtml(html);
        expect(result).not.toContain("<script");
        expect(result).toContain("Hello");
        expect(result).toContain("World");
    });

    it("strips script tags with attributes", () => {
        const html = '<script type="text/javascript">malicious()</script>';
        expect(sanitizeHtml(html)).not.toContain("<script");
    });

    // --- Dangerous element removal ---

    it("strips iframe tags", () => {
        const html = '<iframe src="evil.com"></iframe>';
        expect(sanitizeHtml(html)).not.toContain("<iframe");
    });

    it("strips object tags", () => {
        const html = '<object data="evil.swf"></object>';
        expect(sanitizeHtml(html)).not.toContain("<object");
    });

    it("strips embed tags", () => {
        const html = '<embed src="evil.swf"/>';
        expect(sanitizeHtml(html)).not.toContain("<embed");
    });

    it("strips form tags", () => {
        const html = '<form action="evil.com"><input type="text"/></form>';
        const result = sanitizeHtml(html);
        expect(result).not.toContain("<form");
        expect(result).not.toContain("<input");
    });

    it("strips textarea tags", () => {
        const html = '<textarea>content</textarea>';
        expect(sanitizeHtml(html)).not.toContain("<textarea");
    });

    it("strips select tags", () => {
        const html = '<select><option>A</option></select>';
        expect(sanitizeHtml(html)).not.toContain("<select");
    });

    // --- Event handler removal ---

    it("strips onclick handlers", () => {
        const html = '<a href="#" onclick="alert(1)">Click</a>';
        expect(sanitizeHtml(html)).not.toContain("onclick");
    });

    it("strips onload handlers", () => {
        const html = '<img src="x" onload="alert(1)"/>';
        expect(sanitizeHtml(html)).not.toContain("onload");
    });

    it("strips onerror handlers", () => {
        const html = '<img onerror="alert(1)" src="x"/>';
        expect(sanitizeHtml(html)).not.toContain("onerror");
    });

    // --- JavaScript URL removal ---

    it("replaces javascript: URLs with #", () => {
        const html = '<a href="javascript:alert(1)">Click</a>';
        const result = sanitizeHtml(html);
        expect(result).not.toContain("javascript:");
        expect(result).toContain('href="#"');
    });

    // --- Preserves safe HTML ---

    it("preserves paragraph tags", () => {
        const html = "<p>Hello <strong>World</strong></p>";
        expect(sanitizeHtml(html)).toBe(html);
    });

    it("preserves table tags", () => {
        const html = "<table><tr><td>Cell</td></tr></table>";
        expect(sanitizeHtml(html)).toBe(html);
    });

    it("preserves img with src", () => {
        const html = '<img src="logo.png" alt="Logo"/>';
        expect(sanitizeHtml(html)).toBe(html);
    });

    it("handles empty string", () => {
        expect(sanitizeHtml("")).toBe("");
    });

    it("handles plain text", () => {
        expect(sanitizeHtml("Hello World")).toBe("Hello World");
    });
});
