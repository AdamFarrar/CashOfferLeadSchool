import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Dashboard Page Structure Tests
// =============================================================================

const webRoot = path.resolve(__dirname, "../../app");

describe("Dashboard pages exist", () => {
    const dashboardPages = [
        "(dashboard)/dashboard/page.tsx",
        "(dashboard)/downloads/page.tsx",
        "(dashboard)/notes/page.tsx",
        "(dashboard)/settings/page.tsx",
        "(dashboard)/audit/page.tsx",
        "(dashboard)/qualify/page.tsx",
        "(dashboard)/qualify/confirmation/page.tsx",
    ];

    for (const page of dashboardPages) {
        it(`${page} exists`, () => {
            expect(fs.existsSync(path.join(webRoot, page))).toBe(true);
        });
    }
});

describe("Dashboard page contents", () => {
    it("settings page exists and has content", () => {
        const src = fs.readFileSync(path.join(webRoot, "(dashboard)/settings/page.tsx"), "utf8");
        expect(src.length).toBeGreaterThan(50);
    });
});
