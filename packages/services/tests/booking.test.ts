import { describe, it, expect } from "vitest";
import type { BookingStatus } from "../src/booking";

// =============================================================================
// Booking Service Type Tests
// =============================================================================

describe("BookingStatus type", () => {
    it("includes all valid statuses", () => {
        const validStatuses: BookingStatus[] = [
            "requested",
            "confirmed",
            "completed",
            "cancelled",
        ];
        expect(validStatuses).toHaveLength(4);
        expect(validStatuses).toContain("requested");
        expect(validStatuses).toContain("confirmed");
        expect(validStatuses).toContain("completed");
        expect(validStatuses).toContain("cancelled");
    });

    it("follows a logical lifecycle order", () => {
        const lifecycle: BookingStatus[] = ["requested", "confirmed", "completed"];
        expect(lifecycle[0]).toBe("requested");
        expect(lifecycle[lifecycle.length - 1]).toBe("completed");
    });
});
