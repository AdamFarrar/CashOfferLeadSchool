import React from "react";
import { cn } from "../utils";

// =============================================================================
// Badge Primitive
// =============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "outline" | "secondary";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default:
        "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20",
    outline:
        "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)]",
    secondary:
        "bg-[var(--color-bg-alt)] text-[var(--color-text-muted)] border-[var(--color-border)]",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return React.createElement("span", {
            ref,
            className: cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                variantClasses[variant],
                className,
            ),
            ...props,
        });
    },
);
Badge.displayName = "Badge";
