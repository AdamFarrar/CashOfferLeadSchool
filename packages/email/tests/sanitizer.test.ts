import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../src/sanitizer";

// =============================================================================
// Email HTML Sanitizer Tests
// =============================================================================

describe("sanitizeHtml", () => {
    it("strips <script> tags and content", () => {
        const input = '<div>Hello</div><script>alert("xss")</script>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain("<script");
        expect(result).not.toContain("alert");
        expect(result).toContain("<div>Hello</div>");
    });

    it("strips inline event handlers", () => {
        const input = '<img onerror="alert(1)" src="x">';
        const result = sanitizeHtml(input);
        expect(result).not.toContain("onerror");
    });

    it("strips javascript: links", () => {
        const input = '<a href="javascript:alert(1)">Click</a>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain("javascript:");
        expect(result).toContain('href="#"');
    });

    it("strips <iframe> tags", () => {
        const input = '<p>Text</p><iframe src="evil.com"></iframe>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain("<iframe");
        expect(result).toContain("<p>Text</p>");
    });

    it("strips <form> and form elements", () => {
        const input = '<form action="evil"><input type="text"><select><option>A</option></select></form>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain("<form");
        expect(result).not.toContain("<input");
        expect(result).not.toContain("<select");
    });

    it("strips <object> and <embed> tags", () => {
        const input = '<object data="flash.swf"></object><embed src="evil.swf">';
        const result = sanitizeHtml(input);
        expect(result).not.toContain("<object");
        expect(result).not.toContain("<embed");
    });

    it("preserves safe HTML", () => {
        const input = '<h1>Welcome</h1><p>Hello <strong>user</strong></p>';
        expect(sanitizeHtml(input)).toBe(input);
    });

    it("preserves email-safe elements", () => {
        const input = '<table><tr><td>Cell</td></tr></table>';
        expect(sanitizeHtml(input)).toBe(input);
    });

    it("handles empty string", () => {
        expect(sanitizeHtml("")).toBe("");
    });
});
