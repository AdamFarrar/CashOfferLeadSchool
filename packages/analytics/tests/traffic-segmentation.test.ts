import { describe, it, expect, beforeEach } from "vitest";
import {
    buildTrafficContext,
    registerInternalEmails,
    registerInternalUserIds,
    registerStakeholderUserIds,
    isInternalEmail,
    isInternalUser,
    isStakeholderUser,
    resolveUserCohort,
    detectEnvironment,
    detectReleaseChannel,
    _resetTrafficRegistries,
} from "../src/traffic-context";

// =============================================================================
// Traffic Segmentation Tests
// =============================================================================

describe("Traffic Segmentation", () => {
    beforeEach(() => {
        _resetTrafficRegistries();
    });

    // ── Internal account registry ──

    describe("Internal account registry", () => {
        it("registerInternalEmails marks emails as internal", () => {
            registerInternalEmails(["team@company.com", "dev@company.com"]);
            expect(isInternalEmail("team@company.com")).toBe(true);
            expect(isInternalEmail("DEV@COMPANY.COM")).toBe(true); // case insensitive
            expect(isInternalEmail("stranger@gmail.com")).toBe(false);
        });

        it("registerInternalUserIds marks user IDs", () => {
            registerInternalUserIds(["user-1", "user-2"]);
            expect(isInternalUser("user-1")).toBe(true);
            expect(isInternalUser("user-3")).toBe(false);
        });

        it("registerStakeholderUserIds marks stakeholder IDs", () => {
            registerStakeholderUserIds(["stake-1"]);
            expect(isStakeholderUser("stake-1")).toBe(true);
            expect(isStakeholderUser("user-1")).toBe(false);
        });

        it("_resetTrafficRegistries clears all registries", () => {
            registerInternalEmails(["team@co.com"]);
            registerInternalUserIds(["user-1"]);
            registerStakeholderUserIds(["stake-1"]);

            _resetTrafficRegistries();

            expect(isInternalEmail("team@co.com")).toBe(false);
            expect(isInternalUser("user-1")).toBe(false);
            expect(isStakeholderUser("stake-1")).toBe(false);
        });
    });

    // ── User cohort resolution ──

    describe("resolveUserCohort", () => {
        it("returns real_user for unknown userId", () => {
            expect(resolveUserCohort("unknown-user")).toBe("real_user");
        });

        it("returns real_user for undefined userId", () => {
            expect(resolveUserCohort(undefined)).toBe("real_user");
        });

        it("returns internal for registered internal user", () => {
            registerInternalUserIds(["user-1"]);
            expect(resolveUserCohort("user-1")).toBe("internal");
        });

        it("returns stakeholder for registered stakeholder user", () => {
            registerStakeholderUserIds(["stake-1"]);
            expect(resolveUserCohort("stake-1")).toBe("stakeholder");
        });

        it("internal takes priority over stakeholder", () => {
            registerInternalUserIds(["user-1"]);
            registerStakeholderUserIds(["user-1"]);
            expect(resolveUserCohort("user-1")).toBe("internal");
        });
    });

    // ── Environment detection ──

    describe("detectEnvironment", () => {
        const originalEnv = process.env;

        beforeEach(() => {
            process.env = { ...originalEnv };
            delete process.env.NEXT_PUBLIC_APP_ENV;
            delete process.env.APP_ENV;
            delete process.env.VERCEL_ENV;
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it("defaults to local in test environment", () => {
            expect(detectEnvironment()).toBe("local");
        });

        it("detects staging from APP_ENV", () => {
            process.env.APP_ENV = "staging";
            expect(detectEnvironment()).toBe("staging");
        });

        it("detects production from NEXT_PUBLIC_APP_ENV", () => {
            process.env.NEXT_PUBLIC_APP_ENV = "production";
            expect(detectEnvironment()).toBe("production");
        });

        it("detects production from VERCEL_ENV", () => {
            process.env.VERCEL_ENV = "production";
            expect(detectEnvironment()).toBe("production");
        });

        it("detects staging from VERCEL_ENV preview", () => {
            process.env.VERCEL_ENV = "preview";
            expect(detectEnvironment()).toBe("staging");
        });
    });

    // ── Release channel detection ──

    describe("detectReleaseChannel", () => {
        const originalEnv = process.env;

        beforeEach(() => {
            process.env = { ...originalEnv };
            delete process.env.RELEASE_CHANNEL;
            delete process.env.VERCEL_ENV;
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it("defaults to dev", () => {
            expect(detectReleaseChannel()).toBe("dev");
        });

        it("uses explicit RELEASE_CHANNEL", () => {
            process.env.RELEASE_CHANNEL = "prod";
            expect(detectReleaseChannel()).toBe("prod");
        });

        it("detects prod from VERCEL_ENV production", () => {
            process.env.VERCEL_ENV = "production";
            expect(detectReleaseChannel()).toBe("prod");
        });

        it("detects preview from VERCEL_ENV preview", () => {
            process.env.VERCEL_ENV = "preview";
            expect(detectReleaseChannel()).toBe("preview");
        });
    });

    // ── buildTrafficContext ──

    describe("buildTrafficContext", () => {
        it("builds context for unknown user with sane defaults", () => {
            const ctx = buildTrafficContext();
            expect(ctx.user_cohort).toBe("real_user");
            expect(ctx.is_internal).toBe(false);
            expect(ctx.is_test_user).toBe(false);
            expect(ctx.traffic_source).toBe("app");
            expect(ctx.environment).toBeDefined();
            expect(ctx.release_channel).toBeDefined();
        });

        it("marks internal user correctly", () => {
            registerInternalUserIds(["u-internal"]);
            const ctx = buildTrafficContext("u-internal");
            expect(ctx.user_cohort).toBe("internal");
            expect(ctx.is_internal).toBe(true);
            expect(ctx.is_test_user).toBe(true);
        });

        it("marks stakeholder user correctly", () => {
            registerStakeholderUserIds(["u-stake"]);
            const ctx = buildTrafficContext("u-stake");
            expect(ctx.user_cohort).toBe("stakeholder");
            expect(ctx.is_internal).toBe(false);
            expect(ctx.is_test_user).toBe(true);
        });

        it("does NOT mark real users as test", () => {
            const ctx = buildTrafficContext("u-real-customer");
            expect(ctx.user_cohort).toBe("real_user");
            expect(ctx.is_internal).toBe(false);
            expect(ctx.is_test_user).toBe(false);
        });

        it("accepts traffic source override", () => {
            const ctx = buildTrafficContext("u1", "admin");
            expect(ctx.traffic_source).toBe("admin");
        });

        it("accepts qa traffic source", () => {
            const ctx = buildTrafficContext("u1", "qa");
            expect(ctx.traffic_source).toBe("qa");
        });

        it("has all 6 required fields", () => {
            const ctx = buildTrafficContext();
            const keys = Object.keys(ctx);
            expect(keys).toContain("environment");
            expect(keys).toContain("traffic_source");
            expect(keys).toContain("user_cohort");
            expect(keys).toContain("release_channel");
            expect(keys).toContain("is_internal");
            expect(keys).toContain("is_test_user");
            expect(keys.length).toBe(6);
        });
    });
});
