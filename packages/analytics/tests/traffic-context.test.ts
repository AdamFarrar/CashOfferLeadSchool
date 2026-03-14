import { describe, it, expect, beforeEach } from "vitest";
import {
    registerInternalEmails,
    registerInternalUserIds,
    registerStakeholderUserIds,
    isInternalEmail,
    isInternalUser,
    isStakeholderUser,
    resolveUserCohort,
    buildTrafficContext,
    _resetTrafficRegistries,
} from "../src/traffic-context";
import type { Environment, TrafficSource, UserCohort, ReleaseChannel, TrafficContext } from "../src/traffic-context";

// =============================================================================
// Traffic Context Tests
// =============================================================================

describe("Traffic Segmentation", () => {
    beforeEach(() => {
        _resetTrafficRegistries();
    });

    describe("registerInternalEmails", () => {
        it("registers and detects internal emails", () => {
            registerInternalEmails(["admin@cols.com"]);
            expect(isInternalEmail("admin@cols.com")).toBe(true);
        });

        it("normalizes email case", () => {
            registerInternalEmails(["Admin@COLS.com"]);
            expect(isInternalEmail("admin@cols.com")).toBe(true);
        });

        it("returns false for unregistered emails", () => {
            expect(isInternalEmail("random@test.com")).toBe(false);
        });
    });

    describe("registerInternalUserIds", () => {
        it("registers and detects internal users", () => {
            registerInternalUserIds(["user-1"]);
            expect(isInternalUser("user-1")).toBe(true);
        });

        it("returns false for unregistered users", () => {
            expect(isInternalUser("user-unknown")).toBe(false);
        });
    });

    describe("registerStakeholderUserIds", () => {
        it("registers and detects stakeholder users", () => {
            registerStakeholderUserIds(["stake-1"]);
            expect(isStakeholderUser("stake-1")).toBe(true);
        });

        it("returns false for unregistered", () => {
            expect(isStakeholderUser("random")).toBe(false);
        });
    });

    describe("resolveUserCohort", () => {
        it("returns real_user when no userId", () => {
            expect(resolveUserCohort()).toBe("real_user");
            expect(resolveUserCohort(undefined)).toBe("real_user");
        });

        it("returns internal for internal users", () => {
            registerInternalUserIds(["u-1"]);
            expect(resolveUserCohort("u-1")).toBe("internal");
        });

        it("returns stakeholder for stakeholder users", () => {
            registerStakeholderUserIds(["s-1"]);
            expect(resolveUserCohort("s-1")).toBe("stakeholder");
        });

        it("prioritizes internal over stakeholder", () => {
            registerInternalUserIds(["u-1"]);
            registerStakeholderUserIds(["u-1"]);
            expect(resolveUserCohort("u-1")).toBe("internal");
        });

        it("returns real_user for unknown users", () => {
            expect(resolveUserCohort("unknown")).toBe("real_user");
        });
    });

    describe("buildTrafficContext", () => {
        it("returns a complete TrafficContext", () => {
            const ctx = buildTrafficContext();
            expect(ctx).toHaveProperty("environment");
            expect(ctx).toHaveProperty("traffic_source");
            expect(ctx).toHaveProperty("user_cohort");
            expect(ctx).toHaveProperty("release_channel");
            expect(ctx).toHaveProperty("is_internal");
            expect(ctx).toHaveProperty("is_test_user");
        });

        it("marks internal users correctly", () => {
            registerInternalUserIds(["admin-1"]);
            const ctx = buildTrafficContext("admin-1");
            expect(ctx.is_internal).toBe(true);
            expect(ctx.is_test_user).toBe(true);
            expect(ctx.user_cohort).toBe("internal");
        });

        it("marks real users as non-internal", () => {
            const ctx = buildTrafficContext("regular-user");
            expect(ctx.is_internal).toBe(false);
            expect(ctx.is_test_user).toBe(false);
        });

        it("accepts traffic source override", () => {
            const ctx = buildTrafficContext(undefined, "admin");
            expect(ctx.traffic_source).toBe("admin");
        });
    });

    describe("_resetTrafficRegistries", () => {
        it("clears all registries", () => {
            registerInternalEmails(["a@b.com"]);
            registerInternalUserIds(["u-1"]);
            registerStakeholderUserIds(["s-1"]);
            _resetTrafficRegistries();
            expect(isInternalEmail("a@b.com")).toBe(false);
            expect(isInternalUser("u-1")).toBe(false);
            expect(isStakeholderUser("s-1")).toBe(false);
        });
    });
});

describe("TrafficContext type constraints", () => {
    it("has valid Environment values", () => {
        const envs: Environment[] = ["local", "staging", "production"];
        expect(envs).toHaveLength(3);
    });

    it("has valid TrafficSource values", () => {
        const sources: TrafficSource[] = ["app", "admin", "qa", "stakeholder_test", "internal_demo"];
        expect(sources).toHaveLength(5);
    });

    it("has valid UserCohort values", () => {
        const cohorts: UserCohort[] = ["internal", "stakeholder", "pilot", "real_user"];
        expect(cohorts).toHaveLength(4);
    });

    it("has valid ReleaseChannel values", () => {
        const channels: ReleaseChannel[] = ["dev", "preview", "prod"];
        expect(channels).toHaveLength(3);
    });
});
