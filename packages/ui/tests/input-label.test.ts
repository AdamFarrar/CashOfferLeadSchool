import { describe, it, expect } from "vitest";
import type { LabelProps } from "../src/components/Label";
import type { InputProps } from "../src/components/Input";

// =============================================================================
// Input & Label Type Tests
// =============================================================================

describe("Input props contract", () => {
    it("extends standard input attributes", () => {
        const props: InputProps = {
            type: "email",
            placeholder: "Enter email",
            disabled: true,
            className: "custom",
        };
        expect(props.type).toBe("email");
        expect(props.disabled).toBe(true);
    });
});

describe("Label props contract", () => {
    it("extends standard label attributes", () => {
        const props: LabelProps = {
            htmlFor: "email-input",
            className: "form-label",
        };
        expect(props.htmlFor).toBe("email-input");
    });

    it("supports optional required indicator", () => {
        const props: LabelProps = {
            required: true,
        };
        expect(props.required).toBe(true);
    });
});
