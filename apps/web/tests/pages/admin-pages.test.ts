import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Admin Page Structure Tests
// =============================================================================

const webRoot = path.resolve(__dirname, "../../app");

describe("Admin pages exist", () => {
    const adminPages = [
        "(dashboard)/admin/page.tsx",
        "(dashboard)/admin/program/page.tsx",
        "(dashboard)/admin/sessions/page.tsx",
        "(dashboard)/admin/enrollments/page.tsx",
        "(dashboard)/admin/downloads/page.tsx",
        "(dashboard)/admin/bookings/page.tsx",
        "(dashboard)/admin/email-templates/page.tsx",
        "(dashboard)/admin/automation-rules/page.tsx",
        "(dashboard)/admin/feedback/page.tsx",
        "(dashboard)/admin/settings/page.tsx",
        "(dashboard)/admin/intelligence/page.tsx",
    ];

    for (const page of adminPages) {
        it(`${page} exists`, () => {
            expect(fs.existsSync(path.join(webRoot, page))).toBe(true);
        });
    }
});

describe("Admin page consistency", () => {
    it("all admin pages are TSX", () => {
        const adminDir = path.join(webRoot, "(dashboard)/admin");
        const dirs = fs.readdirSync(adminDir, { withFileTypes: true })
            .filter(d => d.isDirectory());
        for (const dir of dirs) {
            const pagePath = path.join(adminDir, dir.name, "page.tsx");
            expect(fs.existsSync(pagePath)).toBe(true);
        }
    });
});
