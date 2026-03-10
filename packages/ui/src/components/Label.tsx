import React from "react";
import { cn } from "../utils";

// =============================================================================
// Label Primitive
// =============================================================================

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, required, children, ...props }, ref) => {
        return React.createElement(
            "label",
            {
                ref,
                className: cn(
                    "text-sm font-medium text-[var(--color-text)]",
                    "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                    className,
                ),
                ...props,
            },
            children,
            required
                ? React.createElement("span", {
                    className: "text-red-500 ml-0.5",
                    "aria-hidden": "true",
                }, "*")
                : null,
        );
    },
);
Label.displayName = "Label";
