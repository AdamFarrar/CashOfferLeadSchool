// =============================================================================
// Shared Analytics Utilities
// =============================================================================

/**
 * Generate a UUID v4 for event_id.
 * Shared between client-side track() and server-side serverTrack().
 */
export function generateEventId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
