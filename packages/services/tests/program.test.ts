import { describe, it, expect } from "vitest";
import { isEpisodeUnlocked } from "../src/program";
import type {
    ProgramWithModules,
    ProgramSummary,
    ModuleWithEpisodes,
    EpisodeWithStatus,
    EpisodeDetail,
    DashboardProgress,
} from "../src/program";

// =============================================================================
// Program Service Tests
// =============================================================================
// Tests for isEpisodeUnlocked pure function and type contracts.
// =============================================================================

describe("isEpisodeUnlocked", () => {
    it("unlocks all episodes when cohortStartDate is null", () => {
        expect(isEpisodeUnlocked(0, null)).toBe(true);
        expect(isEpisodeUnlocked(5, null)).toBe(true);
        expect(isEpisodeUnlocked(52, null)).toBe(true);
    });

    it("unlocks week 0 episodes immediately", () => {
        const now = new Date();
        expect(isEpisodeUnlocked(0, now)).toBe(true);
    });

    it("locks future week episodes", () => {
        const now = new Date();
        expect(isEpisodeUnlocked(10, now)).toBe(false);
        expect(isEpisodeUnlocked(52, now)).toBe(false);
    });

    it("unlocks episodes after enough weeks have passed", () => {
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        expect(isEpisodeUnlocked(0, twoWeeksAgo)).toBe(true);
        expect(isEpisodeUnlocked(1, twoWeeksAgo)).toBe(true);
        expect(isEpisodeUnlocked(2, twoWeeksAgo)).toBe(true);
        expect(isEpisodeUnlocked(3, twoWeeksAgo)).toBe(false);
    });

    it("handles exact week boundary", () => {
        const exactlyOneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        expect(isEpisodeUnlocked(1, exactlyOneWeekAgo)).toBe(true);
    });

    it("handles dates in the far past", () => {
        const longAgo = new Date("2020-01-01");
        expect(isEpisodeUnlocked(0, longAgo)).toBe(true);
        expect(isEpisodeUnlocked(100, longAgo)).toBe(true);
    });

    it("handles future cohort start date", () => {
        const futureStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        expect(isEpisodeUnlocked(0, futureStart)).toBe(false);
        expect(isEpisodeUnlocked(1, futureStart)).toBe(false);
    });
});

describe("ProgramWithModules type shape", () => {
    it("can create a valid ProgramWithModules", () => {
        const prog: ProgramWithModules = {
            id: "prog-1",
            title: "Cash Offer Lead School",
            description: "Learn to generate cash offer leads",
            slug: "cols",
            previewImageUrl: null,
            cohortStartDate: new Date(),
            status: "active",
            modules: [],
        };
        expect(prog.status).toBe("active");
        expect(prog.modules).toHaveLength(0);
    });

    it("can include nested modules with episodes", () => {
        const ep: EpisodeWithStatus = {
            id: "ep-1",
            title: "Introduction",
            description: null,
            videoUrl: "https://example.com/video.mp4",
            durationSeconds: 600,
            orderIndex: 0,
            unlockWeek: 0,
            moduleId: "mod-1",
            completed: false,
            locked: false,
        };

        const mod: ModuleWithEpisodes = {
            id: "mod-1",
            title: "Getting Started",
            description: null,
            orderIndex: 0,
            episodes: [ep],
        };

        expect(mod.episodes).toHaveLength(1);
        expect(mod.episodes[0].locked).toBe(false);
    });
});

describe("ProgramSummary type shape", () => {
    it("calculates progress percentage correctly", () => {
        const summary: ProgramSummary = {
            id: "prog-1",
            title: "Test Program",
            description: null,
            slug: "test",
            previewImageUrl: null,
            status: "active",
            totalModules: 3,
            totalEpisodes: 15,
            completedEpisodes: 7,
            progressPercent: Math.round((7 / 15) * 100),
        };
        expect(summary.progressPercent).toBe(47);
    });

    it("handles 0 episodes gracefully", () => {
        const summary: ProgramSummary = {
            id: "prog-2",
            title: "Empty Program",
            description: null,
            slug: null,
            previewImageUrl: null,
            status: "active",
            totalModules: 0,
            totalEpisodes: 0,
            completedEpisodes: 0,
            progressPercent: 0,
        };
        expect(summary.progressPercent).toBe(0);
    });
});

describe("EpisodeDetail type shape", () => {
    it("hides content when locked", () => {
        const detail: EpisodeDetail = {
            id: "ep-1",
            title: "Locked Episode",
            description: null,
            videoUrl: null,
            durationSeconds: 300,
            unlockWeek: 10,
            moduleId: "mod-1",
            moduleTitle: "Module 1",
            moduleOrderIndex: 0,
            programId: "prog-1",
            programSlug: "test",
            completed: false,
            locked: true,
            note: null,
            transcript: null,
            lastPositionSeconds: 0,
            assets: [],
            prevEpisodeId: null,
            nextEpisodeId: "ep-2",
        };
        expect(detail.locked).toBe(true);
        expect(detail.videoUrl).toBeNull();
        expect(detail.note).toBeNull();
        expect(detail.assets).toHaveLength(0);
    });
});

describe("DashboardProgress type shape", () => {
    it("can create a valid dashboard progress", () => {
        const progress: DashboardProgress = {
            programTitle: "COLS",
            programId: "prog-1",
            programSlug: "cols",
            cohortStartDate: new Date(),
            totalEpisodes: 20,
            completedEpisodes: 5,
            progressPercent: 25,
            currentWeek: 3,
            modules: [
                { id: "mod-1", title: "Intro", orderIndex: 0, totalEpisodes: 5, completedEpisodes: 5 },
                { id: "mod-2", title: "Advanced", orderIndex: 1, totalEpisodes: 15, completedEpisodes: 0 },
            ],
            nextEpisode: { id: "ep-6", title: "Next One", moduleTitle: "Advanced" },
            resumeEpisode: null,
            hasNotes: true,
            lastActivityDaysAgo: 2,
        };
        expect(progress.progressPercent).toBe(25);
        expect(progress.modules).toHaveLength(2);
        expect(progress.nextEpisode?.title).toBe("Next One");
    });
});
