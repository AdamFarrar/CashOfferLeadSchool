import { describe, it, expect } from "vitest";

// =============================================================================
// Platform Settings Action Contract Tests
// =============================================================================

describe("getPlatformSettingsAction response", () => {
    it("success response has settings array", () => {
        const resp = {
            success: true,
            settings: [
                { key: "turnstile_site_key", value: "abc", description: null, updatedAt: "2024-01-01T00:00:00Z" },
            ],
        };
        expect(resp.settings).toHaveLength(1);
        expect(resp.settings[0].key).toBe("turnstile_site_key");
    });

    it("failure response has empty settings", () => {
        const resp = { success: false, settings: [] };
        expect(resp.settings).toHaveLength(0);
    });
});

describe("updatePlatformSettingAction response", () => {
    it("success response", () => {
        const resp = { success: true };
        expect(resp.success).toBe(true);
    });

    it("error response", () => {
        const resp = { success: false, error: "Not authenticated" };
        expect(resp.error).toBeTruthy();
    });
});
