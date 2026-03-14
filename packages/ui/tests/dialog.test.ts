import { describe, it, expect } from "vitest";
import type { DialogProps } from "../src/components/Dialog";

// =============================================================================
// Dialog Component Type Tests
// =============================================================================

describe("Dialog props contract", () => {
    it("requires open, onClose, and children", () => {
        const props: DialogProps = {
            open: true,
            onClose: () => {},
            children: null,
        };
        expect(props.open).toBe(true);
        expect(typeof props.onClose).toBe("function");
    });

    it("supports optional className", () => {
        const props: DialogProps = {
            open: false,
            onClose: () => {},
            children: null,
            className: "custom-dialog",
        };
        expect(props.className).toBe("custom-dialog");
    });
});
