import { describe, it, expect } from "vitest";
import type { CardProps } from "../src/components/Card";

// =============================================================================
// Card Component Type Tests
// =============================================================================

describe("Card component exports", () => {
    it("CardProps extends HTMLDivElement attributes", () => {
        const props: CardProps = {
            className: "custom-class",
            id: "card-1",
        };
        expect(props.className).toBe("custom-class");
        expect(props.id).toBe("card-1");
    });
});
