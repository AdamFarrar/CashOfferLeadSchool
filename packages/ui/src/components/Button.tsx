import React from "react";
import { cn } from "../utils";

// =============================================================================
// Button Primitive
// =============================================================================
// Composable button with variant and size props.
// Uses design tokens from globals.css via Tailwind classes.
// =============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
        "bg-[var(--color-primary)] text-white hover:opacity-90 " +
        "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
    secondary:
        "bg-[var(--color-secondary)] text-white hover:opacity-90 " +
        "focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2",
    outline:
        "border border-[var(--color-border)] bg-transparent text-[var(--color-text)] " +
        "hover:bg-[var(--color-bg-alt)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
    ghost:
        "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] " +
        "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
    danger:
        "bg-red-600 text-white hover:bg-red-700 " +
        "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
        return React.createElement("button", {
            ref,
            className: cn(
                "inline-flex items-center justify-center font-medium transition-all duration-150",
                "disabled:opacity-50 disabled:pointer-events-none",
                variantClasses[variant],
                sizeClasses[size],
                className,
            ),
            disabled,
            ...props,
        });
    },
);
Button.displayName = "Button";
