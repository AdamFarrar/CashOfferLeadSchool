import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Automation Init Structure Tests
// =============================================================================

const libDir = path.resolve(__dirname, "../../app/lib");

describe("automation-init module", () => {
    it("file exists", () => {
        expect(fs.existsSync(path.join(libDir, "automation-init.ts"))).toBe(true);
    });

    it("has content", () => {
        const src = fs.readFileSync(path.join(libDir, "automation-init.ts"), "utf8");
        expect(src.length).toBeGreaterThan(10);
    });
});
