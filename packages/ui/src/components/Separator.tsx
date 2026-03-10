import React from "react";
import { cn } from "../utils";

// =============================================================================
// Separator Primitive
// =============================================================================

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
    ({ className, orientation = "horizontal", ...props }, ref) => {
        return React.createElement("div", {
            ref,
            role: "separator",
            "aria-orientation": orientation,
            className: cn(
                "shrink-0 bg-[var(--color-border)]",
                orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
                className,
            ),
            ...props,
        });
    },
);
Separator.displayName = "Separator";
