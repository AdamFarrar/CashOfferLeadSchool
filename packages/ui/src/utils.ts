// =============================================================================
// @cols/ui — Class Name Utility
// =============================================================================
// Minimal class merging util. Filters falsy values and joins with space.
// Avoids adding clsx/tailwind-merge as dependencies for this small package.
// =============================================================================

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}
