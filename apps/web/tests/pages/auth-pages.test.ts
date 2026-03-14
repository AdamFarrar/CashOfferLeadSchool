import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Auth Page Structure Tests — validate files exist without importing Next.js
// =============================================================================

const webRoot = path.resolve(__dirname, "../../app");

describe("Auth pages exist", () => {
    const authPages = [
        "(auth)/login/page.tsx",
        "(auth)/register/page.tsx",
        "(auth)/verify-email/page.tsx",
        "(auth)/forgot-password/page.tsx",
        "(auth)/reset-password/page.tsx",
        "(auth)/pricing/page.tsx",
        "(auth)/checkout/success/page.tsx",
    ];

    for (const page of authPages) {
        it(`${page} exists`, () => {
            expect(fs.existsSync(path.join(webRoot, page))).toBe(true);
        });
    }
});

describe("Auth page contents", () => {
    it("login page has use client", () => {
        const src = fs.readFileSync(path.join(webRoot, "(auth)/login/page.tsx"), "utf8");
        expect(src).toContain("use client");
    });

    it("register page has use client", () => {
        const src = fs.readFileSync(path.join(webRoot, "(auth)/register/page.tsx"), "utf8");
        expect(src).toContain("use client");
    });
});
