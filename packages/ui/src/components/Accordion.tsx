"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "../utils";

// =============================================================================
// Accordion Primitive
// =============================================================================
// No Radix dependency — pure React with CSS transitions.
// =============================================================================

type AccordionContextType = {
    openItem: string | null;
    toggle: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextType>({
    openItem: null,
    toggle: () => { },
});

// ── Accordion Root ──
export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: "single";
    defaultValue?: string;
}

export function Accordion({ className, defaultValue, children, ...props }: AccordionProps) {
    const [openItem, setOpenItem] = useState<string | null>(defaultValue ?? null);
    const toggle = (value: string) => setOpenItem((prev) => (prev === value ? null : value));

    return (
        <AccordionContext.Provider value={{ openItem, toggle }}>
            <div className={cn("divide-y divide-[var(--color-border)]", className)} {...props}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

// ── Accordion Item ──
export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
    return (
        <div className={cn("", className)} data-value={value} {...props}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<{ itemValue?: string }>, { itemValue: value });
                }
                return child;
            })}
        </div>
    );
}

// ── Accordion Trigger ──
export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    itemValue?: string; // injected by AccordionItem
}

export function AccordionTrigger({ className, children, itemValue, ...props }: AccordionTriggerProps) {
    const { openItem, toggle } = useContext(AccordionContext);
    const isOpen = openItem === itemValue;

    return (
        <button
            type="button"
            onClick={() => itemValue && toggle(itemValue)}
            className={cn(
                "flex w-full items-center justify-between py-4 text-left font-medium transition-colors",
                "hover:text-[var(--color-primary)]",
                className,
            )}
            aria-expanded={isOpen}
            {...props}
        >
            {children}
            <span
                className={cn(
                    "ml-2 text-[var(--color-text-muted)] transition-transform duration-200",
                    isOpen && "rotate-180",
                )}
            >
                ▾
            </span>
        </button>
    );
}

// ── Accordion Content ──
export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
    itemValue?: string; // injected by AccordionItem
}

export function AccordionContent({ className, children, itemValue, ...props }: AccordionContentProps) {
    const { openItem } = useContext(AccordionContext);
    const isOpen = openItem === itemValue;

    if (!isOpen) return null;

    return (
        <div
            className={cn("pb-4 text-[var(--color-text-muted)]", className)}
            {...props}
        >
            {children}
        </div>
    );
}
