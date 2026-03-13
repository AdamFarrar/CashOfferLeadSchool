// =============================================================================
// Tests: isEpisodeUnlocked() — Post-Audit Fix 3
// =============================================================================
// Covers: exact boundary, pre-unlock, null cohort, edge cases.
// =============================================================================

import { describe, it, expect } from "vitest";
import { isEpisodeUnlocked } from "../src/program";

describe("isEpisodeUnlocked", () => {
    // ── Null cohort date (all unlocked) ──

    it("returns true when cohortStartDate is null", () => {
        expect(isEpisodeUnlocked(0, null)).toBe(true);
        expect(isEpisodeUnlocked(5, null)).toBe(true);
        expect(isEpisodeUnlocked(100, null)).toBe(true);
    });

    // ── Week 0 episodes (always unlocked once cohort starts) ──

    it("unlocks week 0 episodes immediately when cohort starts", () => {
        const now = new Date();
        expect(isEpisodeUnlocked(0, now)).toBe(true);
    });

    it("unlocks week 0 episodes even in far past cohorts", () => {
        const pastDate = new Date("2020-01-01T00:00:00Z");
        expect(isEpisodeUnlocked(0, pastDate)).toBe(true);
    });

    // ── Exact boundary tests ──

    it("locks episode when exactly 1ms before unlock week", () => {
        const now = new Date();
        // Cohort started exactly (unlockWeek * 7 days - 1ms) ago → NOT unlocked
        const almostThere = new Date(now.getTime() - (2 * 7 * 24 * 60 * 60 * 1000) + 1);
        expect(isEpisodeUnlocked(2, almostThere)).toBe(false);
    });

    it("unlocks episode at exact unlock week boundary", () => {
        const now = new Date();
        // Cohort started exactly unlockWeek * 7 days ago
        const exactBoundary = new Date(now.getTime() - (2 * 7 * 24 * 60 * 60 * 1000));
        expect(isEpisodeUnlocked(2, exactBoundary)).toBe(true);
    });

    it("unlocks episode well past the unlock week", () => {
        const cohortStart = new Date("2024-01-01T00:00:00Z");
        // Week 3 should be unlocked if cohort started over a year ago
        expect(isEpisodeUnlocked(3, cohortStart)).toBe(true);
    });

    // ── Pre-unlock state ──

    it("locks future episodes", () => {
        const now = new Date();
        // Cohort started today → week 5 is locked
        expect(isEpisodeUnlocked(5, now)).toBe(false);
    });

    it("locks episodes when cohort start is in the future", () => {
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        expect(isEpisodeUnlocked(0, futureDate)).toBe(false);
        expect(isEpisodeUnlocked(1, futureDate)).toBe(false);
    });

    // ── Edge cases ──

    it("handles unlockWeek of 0 correctly", () => {
        const pastDate = new Date(Date.now() - 1000);
        expect(isEpisodeUnlocked(0, pastDate)).toBe(true);
    });

    it("handles large unlockWeek values", () => {
        const now = new Date();
        expect(isEpisodeUnlocked(52, now)).toBe(false); // 1 year out
        expect(isEpisodeUnlocked(520, now)).toBe(false); // 10 years out
    });

    // ── Determinism ──

    it("returns consistent results for same inputs", () => {
        const cohortStart = new Date("2025-01-01T00:00:00Z");
        const result1 = isEpisodeUnlocked(3, cohortStart);
        const result2 = isEpisodeUnlocked(3, cohortStart);
        expect(result1).toBe(result2);
    });
});
