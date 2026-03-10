// =============================================================================
// @cocs/ui — Shared UI Components
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
export { Input, type InputProps } from "./components/Input";
export { Label, type LabelProps } from "./components/Label";
export {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    type DialogProps,
} from "./components/Dialog";
