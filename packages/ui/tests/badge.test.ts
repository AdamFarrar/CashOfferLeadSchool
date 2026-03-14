import { describe, it, expect } from "vitest";
import type { BadgeProps } from "../src/components/Badge";

// =============================================================================
// Badge Component Type Tests
// =============================================================================

describe("Badge variants", () => {
    it("defines all expected variants", () => {
        const variants: NonNullable<BadgeProps["variant"]>[] = [
            "default",
            "outline",
            "secondary",
        ];
        expect(variants).toHaveLength(3);
    });
});
