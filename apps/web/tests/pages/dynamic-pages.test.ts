import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Dynamic Page Structure Tests — Parameter-based routes
// =============================================================================

const webRoot = path.resolve(__dirname, "../../app");

describe("Dynamic pages exist", () => {
    const dynamicPages = [
        "(dashboard)/episodes/[episodeId]/page.tsx",
        "(dashboard)/episodes/[episodeId]/EpisodeView.tsx",
        "(dashboard)/sessions/[sessionId]/page.tsx",
        "(dashboard)/discussion/[threadId]/page.tsx",
        "(dashboard)/programs/[slug]/page.tsx",
        "(dashboard)/programs/[slug]/episodes/[episodeId]/page.tsx",
        "(dashboard)/admin/email-templates/[templateId]/page.tsx",
        "(dashboard)/admin/email-templates/[templateId]/editor/page.tsx",
    ];

    for (const page of dynamicPages) {
        it(`${page} exists`, () => {
            expect(fs.existsSync(path.join(webRoot, page))).toBe(true);
        });
    }
});
