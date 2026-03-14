import { describe, it, expect, beforeEach } from "vitest";
import { isFeatureEnabled, setFeatureFlag, clearFeatureFlags } from "../src/flags";

// =============================================================================
// Feature Flags Tests
// =============================================================================

describe("isFeatureEnabled", () => {
    beforeEach(() => {
        clearFeatureFlags();
    });

    it("returns false by default for unknown flags", () => {
        expect(isFeatureEnabled("unknown-flag")).toBe(false);
    });

    it("returns true when flag is set via override", () => {
        setFeatureFlag("test-feature", true);
        expect(isFeatureEnabled("test-feature")).toBe(true);
    });

    it("returns false when flag is explicitly disabled via override", () => {
        setFeatureFlag("test-feature", false);
        expect(isFeatureEnabled("test-feature")).toBe(false);
    });

    it("override takes priority over env var", () => {
        process.env.FEATURE_FLAG_MY_FLAG = "true";
        setFeatureFlag("my-flag", false);
        expect(isFeatureEnabled("my-flag")).toBe(false);
        delete process.env.FEATURE_FLAG_MY_FLAG;
    });

    it("reads from env var when no override", () => {
        process.env.FEATURE_FLAG_DARK_MODE = "true";
        expect(isFeatureEnabled("dark-mode")).toBe(true);
        delete process.env.FEATURE_FLAG_DARK_MODE;
    });

    it("handles env var set to false", () => {
        process.env.FEATURE_FLAG_BETA = "false";
        expect(isFeatureEnabled("beta")).toBe(false);
        delete process.env.FEATURE_FLAG_BETA;
    });

    it("converts flag key to uppercase env var format", () => {
        process.env.FEATURE_FLAG_MULTI_WORD_FLAG = "true";
        expect(isFeatureEnabled("multi-word-flag")).toBe(true);
        delete process.env.FEATURE_FLAG_MULTI_WORD_FLAG;
    });
});

describe("clearFeatureFlags", () => {
    it("clears all overrides", () => {
        setFeatureFlag("a", true);
        setFeatureFlag("b", true);
        clearFeatureFlags();
        expect(isFeatureEnabled("a")).toBe(false);
        expect(isFeatureEnabled("b")).toBe(false);
    });
});
