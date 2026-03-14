import { describe, it, expect } from "vitest";
import type { LiveSessionStatus } from "../src/live-session";

// =============================================================================
// Live Session Service Type Tests
// =============================================================================

describe("LiveSessionStatus type", () => {
    it("includes all valid session statuses", () => {
        const statuses: LiveSessionStatus[] = [
            "scheduled",
            "live",
            "completed",
            "cancelled",
        ];
        expect(statuses).toHaveLength(4);
    });

    it("follows a logical lifecycle", () => {
        const lifecycle: LiveSessionStatus[] = ["scheduled", "live", "completed"];
        expect(lifecycle[0]).toBe("scheduled");
        expect(lifecycle[1]).toBe("live");
        expect(lifecycle[2]).toBe("completed");
    });
});
