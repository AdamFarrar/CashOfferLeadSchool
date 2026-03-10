import React from "react";
import { cn } from "../utils";

// =============================================================================
// Input Primitive
// =============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = "text", ...props }, ref) => {
        return React.createElement("input", {
            ref,
            type,
            className: cn(
                "w-full px-3 py-2 rounded-lg border border-[var(--color-border)]",
                "bg-[var(--color-bg)] text-[var(--color-text)] text-sm",
                "placeholder:text-[var(--color-text-muted)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-150",
                className,
            ),
            ...props,
        });
    },
);
Input.displayName = "Input";
