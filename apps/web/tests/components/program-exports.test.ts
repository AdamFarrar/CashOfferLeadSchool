import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Program Component Structure Tests
// =============================================================================

const componentDir = path.resolve(__dirname, "../../app/components/program");

describe("Program components exist", () => {
    const components = [
        "BestMoments.tsx",
        "CohortSignals.tsx",
        "CompletionGuidance.tsx",
        "ConductAgreementModal.tsx",
        "DiscussionThread.tsx",
        "DownloadsListClient.tsx",
        "EpisodeChat.tsx",
        "EpisodePlayer.tsx",
        "EpisodeReflection.tsx",
        "EpisodeTakeaways.tsx",
        "NotesListClient.tsx",
        "OperatorHighlights.tsx",
        "ThreadDetail.tsx",
    ];

    for (const comp of components) {
        it(`${comp} exists`, () => {
            expect(fs.existsSync(path.join(componentDir, comp))).toBe(true);
        });
    }
});

describe("Program components are client components", () => {
    it("EpisodeChat uses client directive", () => {
        const src = fs.readFileSync(path.join(componentDir, "EpisodeChat.tsx"), "utf8");
        expect(src).toContain("use client");
    });

    it("EpisodePlayer uses client directive", () => {
        const src = fs.readFileSync(path.join(componentDir, "EpisodePlayer.tsx"), "utf8");
        expect(src).toContain("use client");
    });
});
