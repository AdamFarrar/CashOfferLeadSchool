import { describe, it, expect } from "vitest";
import { Separator } from "../src/components/Separator";
import { Accordion } from "../src/components/Accordion";

// =============================================================================
// UI Component Export Tests (Separator, Accordion)
// =============================================================================

describe("Separator", () => {
    it("is exported as a component", () => {
        expect(Separator).toBeTruthy();
    });
});

describe("Accordion", () => {
    it("is exported as a function component", () => {
        expect(typeof Accordion).toBe("function");
    });
});
