import { describe, it, expect } from "vitest";
import { cn } from "../src/utils";

// =============================================================================
// cn() Utility Tests
// =============================================================================

describe("cn() class name merger", () => {
    it("joins multiple class strings", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("filters out undefined values", () => {
        expect(cn("foo", undefined, "bar")).toBe("foo bar");
    });

    it("filters out null values", () => {
        expect(cn("foo", null, "bar")).toBe("foo bar");
    });

    it("filters out false values", () => {
        expect(cn("foo", false, "bar")).toBe("foo bar");
    });

    it("returns empty string for no args", () => {
        expect(cn()).toBe("");
    });

    it("returns empty string for all falsy args", () => {
        expect(cn(undefined, null, false)).toBe("");
    });

    it("passes through single class", () => {
        expect(cn("hello")).toBe("hello");
    });

    it("handles mixed truthy and falsy", () => {
        const isActive = true;
        const isDisabled = false;
        expect(cn(
            "base",
            isActive && "active",
            isDisabled && "disabled",
        )).toBe("base active");
    });
});
