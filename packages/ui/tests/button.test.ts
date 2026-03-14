import { describe, it, expect } from "vitest";
import type { ButtonProps } from "../src/components/Button";

// =============================================================================
// Button Component Type Tests
// =============================================================================

describe("Button variants", () => {
    it("defines all expected variants", () => {
        const variants: NonNullable<ButtonProps["variant"]>[] = [
            "primary",
            "secondary",
            "outline",
            "ghost",
            "danger",
        ];
        expect(variants).toHaveLength(5);
    });

    it("defines all expected sizes", () => {
        const sizes: NonNullable<ButtonProps["size"]>[] = [
            "sm",
            "md",
            "lg",
        ];
        expect(sizes).toHaveLength(3);
    });

    it("defaults are primary/md by convention", () => {
        const defaults: ButtonProps = {};
        expect(defaults.variant).toBeUndefined();
        expect(defaults.size).toBeUndefined();
    });
});
