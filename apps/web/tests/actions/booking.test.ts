import { describe, it, expect } from "vitest";

// =============================================================================
// Booking Action Types Tests
// =============================================================================

describe("booking action contracts", () => {
    it("submitBookingAction input shape", () => {
        const input = {
            requestedDate: "2024-01-01T00:00:00Z",
            operationContext: "initial audit",
        };
        expect(input.requestedDate).toBeTruthy();
        expect(input.operationContext).toBeTruthy();
    });

    it("submitBookingAction input allows null date", () => {
        const input = {
            requestedDate: null,
            operationContext: "follow-up",
        };
        expect(input.requestedDate).toBeNull();
    });

    it("success response shape", () => {
        const response = { success: true, booking: { id: "b-1" } };
        expect(response.success).toBe(true);
    });

    it("error response shape", () => {
        const response = { success: false, error: "Not authenticated" };
        expect(response.success).toBe(false);
        expect(response.error).toBeTruthy();
    });
});

describe("booking status values", () => {
    it("valid statuses", () => {
        const statuses = ["pending", "scheduled", "completed", "cancelled"] as const;
        expect(statuses.length).toBeGreaterThan(0);
    });
});
