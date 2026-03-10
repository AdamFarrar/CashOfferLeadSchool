"use client";

import React, { useEffect, useCallback } from "react";
import { cn } from "../utils";

// =============================================================================
// Dialog Primitive
// =============================================================================
// Accessible modal dialog with overlay, close on Escape, focus trap basics.
// =============================================================================

export interface DialogProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose],
    );

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return React.createElement(
        "div",
        {
            className: "fixed inset-0 z-50 flex items-center justify-center",
            role: "dialog",
            "aria-modal": "true",
        },
        // Overlay
        React.createElement("div", {
            className: "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            onClick: onClose,
            "aria-hidden": "true",
        }),
        // Content
        React.createElement("div", {
            className: cn(
                "relative z-50 w-full max-w-lg mx-4",
                "rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]",
                "shadow-xl p-6",
                "animate-in fade-in-0 zoom-in-95",
                className,
            ),
        }, children),
    );
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
    return React.createElement("div", {
        className: cn("mb-4", className),
        ...props,
    });
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

export function DialogTitle({ className, ...props }: DialogTitleProps) {
    return React.createElement("h2", {
        className: cn("text-lg font-semibold text-[var(--color-text)]", className),
        ...props,
    });
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DialogFooter({ className, ...props }: DialogFooterProps) {
    return React.createElement("div", {
        className: cn("mt-6 flex justify-end gap-3", className),
        ...props,
    });
}
