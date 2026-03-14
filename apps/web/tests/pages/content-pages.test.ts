import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Content Page Structure Tests
// =============================================================================

const webRoot = path.resolve(__dirname, "../../app");

describe("Content pages exist", () => {
    const contentPages = [
        "(dashboard)/episodes/page.tsx",
        "(dashboard)/episodes/EpisodeLibrary.tsx",
        "(dashboard)/sessions/page.tsx",
        "(dashboard)/discussion/page.tsx",
        "(dashboard)/programs/page.tsx",
        "page.tsx", // Landing page
    ];

    for (const page of contentPages) {
        it(`${page} exists`, () => {
            expect(fs.existsSync(path.join(webRoot, page))).toBe(true);
        });
    }
});
