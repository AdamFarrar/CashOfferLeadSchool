import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Middleware and Config Structure Tests
// =============================================================================

const webRoot = path.resolve(__dirname, "..");

describe("Middleware exists", () => {
    it("middleware.ts exists", () => {
        expect(fs.existsSync(path.join(webRoot, "middleware.ts"))).toBe(true);
    });

    it("instrumentation.ts exists", () => {
        expect(fs.existsSync(path.join(webRoot, "instrumentation.ts"))).toBe(true);
    });
});

describe("Sentry configs exist", () => {
    it("client config exists", () => {
        expect(fs.existsSync(path.join(webRoot, "sentry.client.config.ts"))).toBe(true);
    });

    it("server config exists", () => {
        expect(fs.existsSync(path.join(webRoot, "sentry.server.config.ts"))).toBe(true);
    });

    it("edge config exists", () => {
        expect(fs.existsSync(path.join(webRoot, "sentry.edge.config.ts"))).toBe(true);
    });
});
