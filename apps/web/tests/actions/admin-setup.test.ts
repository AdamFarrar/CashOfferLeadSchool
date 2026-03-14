import { describe, it, expect } from "vitest";

// =============================================================================
// Admin Setup Action Contract Tests
// =============================================================================

describe("admin setup contracts", () => {
    it("setup checklist response", () => {
        const resp = {
            success: true,
            steps: [
                { key: "episodes", label: "Create Episodes", completed: true },
                { key: "emails", label: "Configure Emails", completed: false },
            ],
        };
        expect(resp.steps).toHaveLength(2);
        expect(resp.steps[0].completed).toBe(true);
    });
});
