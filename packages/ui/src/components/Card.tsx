import React from "react";
import { cn } from "../utils";

// =============================================================================
// Card Primitive
// =============================================================================
// Composable card with header, content, and footer slots.
// =============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => {
        return React.createElement("div", {
            ref,
            className: cn(
                "rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]",
                "shadow-sm transition-shadow hover:shadow-md",
                className,
            ),
            ...props,
        });
    },
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return React.createElement("div", {
            ref,
            className: cn("px-6 py-4 border-b border-[var(--color-border)]", className),
            ...props,
        });
    },
);
CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return React.createElement("div", {
            ref,
            className: cn("px-6 py-4", className),
            ...props,
        });
    },
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return React.createElement("div", {
            ref,
            className: cn(
                "px-6 py-4 border-t border-[var(--color-border)] flex items-center",
                className,
            ),
            ...props,
        });
    },
);
CardFooter.displayName = "CardFooter";
