import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// API Route Structure Tests
// =============================================================================

const webRoot = path.resolve(__dirname, "../../app");

describe("Health API route", () => {
    it("file exists", () => {
        expect(fs.existsSync(path.join(webRoot, "api/health/route.ts"))).toBe(true);
    });

    it("exports GET function", () => {
        const src = fs.readFileSync(path.join(webRoot, "api/health/route.ts"), "utf8");
        expect(src).toContain("export async function GET");
    });
});

describe("Stripe webhook route", () => {
    it("file exists", () => {
        expect(fs.existsSync(path.join(webRoot, "api/stripe/webhook/route.ts"))).toBe(true);
    });

    it("exports POST function", () => {
        const src = fs.readFileSync(path.join(webRoot, "api/stripe/webhook/route.ts"), "utf8");
        expect(src).toContain("export async function POST");
    });
});
