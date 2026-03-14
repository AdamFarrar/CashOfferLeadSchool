import { describe, it, expect } from "vitest";
import { generateEventId } from "../src/utils";

// =============================================================================
// Analytics Utils Tests
// =============================================================================

describe("generateEventId", () => {
    it("returns a string", () => {
        expect(typeof generateEventId()).toBe("string");
    });

    it("returns a valid UUID format", () => {
        const id = generateEventId();
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it("generates unique IDs", () => {
        const ids = new Set(Array.from({ length: 100 }, () => generateEventId()));
        expect(ids.size).toBe(100);
    });

    it("always has version 4 in the third group", () => {
        const id = generateEventId();
        const parts = id.split("-");
        expect(parts[2][0]).toBe("4");
    });
});
