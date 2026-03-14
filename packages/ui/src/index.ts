// =============================================================================
// @cols/ui — Shared UI Components
// =============================================================================
// Primitive components used across the application.
// All components use design tokens from globals.css via CSS variables.
// No inline styles — Tailwind utilities only.
// =============================================================================

// Utilities
export { cn } from "./utils";

// Primitives
export { Button, type ButtonProps } from "./components/Button";
export { Card, CardHeader, CardContent, CardFooter, type CardProps } from "./components/Card";
export { Badge, type BadgeProps } from "./components/Badge";
export { Separator, type SeparatorProps } from "./components/Separator";
export {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    type AccordionProps,
    type AccordionItemProps,
    type AccordionTriggerProps,
    type AccordionContentProps,
} from "./components/Accordion";
export { Input, type InputProps } from "./components/Input";
export { Label, type LabelProps } from "./components/Label";
export {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    type DialogProps,
} from "./components/Dialog";

