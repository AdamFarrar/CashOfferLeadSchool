import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Email Delivery Adapter Tests
// =============================================================================

describe("deliverEmail", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllEnvs();
    });

    it("should return error when RESEND_API_KEY not set", async () => {
        vi.stubEnv("RESEND_API_KEY", "");

        const { deliverEmail } = await import("../src/delivery");
        const result = await deliverEmail({
            to: "test@example.com",
            subject: "Test",
            html: "<p>Hello</p>",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("not configured");
    });

    it("should return structured DeliveryResult on API error", async () => {
        vi.stubEnv("RESEND_API_KEY", "re_test_123");

        // Mock Resend as a class with constructor
        vi.doMock("resend", () => {
            return {
                Resend: class MockResend {
                    emails = {
                        send: vi.fn().mockResolvedValue({
                            error: { message: "Invalid API key" },
                            data: null,
                        }),
                    };
                },
            };
        });

        const { deliverEmail } = await import("../src/delivery");
        const result = await deliverEmail({
            to: "test@example.com",
            subject: "Test",
            html: "<p>Hello</p>",
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe("Invalid API key");
    });

    it("should return success with messageId on successful send", async () => {
        vi.stubEnv("RESEND_API_KEY", "re_test_123");

        vi.doMock("resend", () => {
            return {
                Resend: class MockResend {
                    emails = {
                        send: vi.fn().mockResolvedValue({
                            error: null,
                            data: { id: "msg_abc123" },
                        }),
                    };
                },
            };
        });

        const { deliverEmail } = await import("../src/delivery");
        const result = await deliverEmail({
            to: "test@example.com",
            subject: "Test",
            html: "<p>Hello</p>",
        });

        expect(result.success).toBe(true);
        expect(result.messageId).toBe("msg_abc123");
    });

    it("should handle thrown exceptions gracefully", async () => {
        vi.stubEnv("RESEND_API_KEY", "re_test_123");

        vi.doMock("resend", () => {
            return {
                Resend: class MockResend {
                    emails = {
                        send: vi.fn().mockRejectedValue(new Error("Network timeout")),
                    };
                },
            };
        });

        const { deliverEmail } = await import("../src/delivery");
        const result = await deliverEmail({
            to: "test@example.com",
            subject: "Test",
            html: "<p>Hello</p>",
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe("Network timeout");
    });
});
