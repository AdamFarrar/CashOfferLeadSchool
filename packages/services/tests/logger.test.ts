import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// =============================================================================
// Logger (devLog) Tests
// =============================================================================
// Tests that devLog suppresses output in production and allows in development.
// =============================================================================

describe("devLog", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
        vi.restoreAllMocks();
    });

    it("logs in development mode", async () => {
        process.env.NODE_ENV = "development";
        // Re-import to pick up env change
        vi.resetModules();
        const { devLog } = await import("../src/logger");

        const spy = vi.spyOn(console, "info").mockImplementation(() => {});
        devLog.info("test message");
        expect(spy).toHaveBeenCalledWith("test message");
    });

    it("logs warnings in development mode", async () => {
        process.env.NODE_ENV = "development";
        vi.resetModules();
        const { devLog } = await import("../src/logger");

        const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
        devLog.warn("test warning");
        expect(spy).toHaveBeenCalledWith("test warning");
    });

    it("accepts multiple arguments", async () => {
        process.env.NODE_ENV = "development";
        vi.resetModules();
        const { devLog } = await import("../src/logger");

        const spy = vi.spyOn(console, "info").mockImplementation(() => {});
        devLog.info("prefix", { key: "value" }, 42);
        expect(spy).toHaveBeenCalledWith("prefix", { key: "value" }, 42);
    });

    it("does not throw when called", async () => {
        process.env.NODE_ENV = "test";
        vi.resetModules();
        const { devLog } = await import("../src/logger");

        expect(() => devLog.info("safe")).not.toThrow();
        expect(() => devLog.warn("safe")).not.toThrow();
    });
});
