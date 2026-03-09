import { describe, it, expect, vi, beforeEach } from "vitest";
import { webhookExecutor } from "../src/executors/webhook";
import type { PlannedAction, ExecutorContext } from "../src/types";

// =============================================================================
// Webhook Executor Unit Tests
// =============================================================================

const makeAction = (url?: string): PlannedAction => ({
    ruleId: "rule-1",
    ruleName: "Test Rule",
    channel: "webhook",
    actionType: "post",
    actionConfig: { url: url ?? "https://webhook.site/test" },
});

const makeContext = (): ExecutorContext => ({
    eventId: "evt-1",
    eventKey: "test_event",
    correlationId: "corr-1",
    causationId: null,
    organizationId: null,
    userId: "user-1",
});

describe("webhookExecutor", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("should return error when no URL configured", async () => {
        const action = makeAction(undefined);
        action.actionConfig = {};
        const result = await webhookExecutor.execute(action, {}, makeContext());
        expect(result.success).toBe(false);
        expect(result.error).toContain("No webhook URL");
    });

    it("should block SSRF attempt to localhost", async () => {
        const result = await webhookExecutor.execute(
            makeAction("http://localhost:3000/api"),
            {},
            makeContext(),
        );
        expect(result.success).toBe(false);
        expect(result.error).toContain("blocked by security policy");
    });

    it("should block SSRF attempt to metadata endpoint", async () => {
        const result = await webhookExecutor.execute(
            makeAction("http://169.254.169.254/latest/meta-data/"),
            {},
            makeContext(),
        );
        expect(result.success).toBe(false);
        expect(result.error).toContain("blocked by security policy");
    });

    it("should block redirect responses", async () => {
        // Mock fetch to return a 301 redirect
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            status: 301,
            ok: false,
            headers: new Headers({ location: "http://127.0.0.1/internal" }),
        }));

        const result = await webhookExecutor.execute(
            makeAction("https://evil.com/redirect"),
            { data: "test" },
            makeContext(),
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain("redirect blocked");
    });

    it("should return failure on non-200 responses", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            status: 500,
            statusText: "Internal Server Error",
            ok: false,
            headers: new Headers(),
        }));

        const result = await webhookExecutor.execute(
            makeAction("https://webhook.site/test"),
            {},
            makeContext(),
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain("500");
    });

    it("should succeed on 200 response", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            status: 200,
            ok: true,
            headers: new Headers(),
        }));

        const result = await webhookExecutor.execute(
            makeAction("https://webhook.site/test"),
            { foo: "bar" },
            makeContext(),
        );

        expect(result.success).toBe(true);
    });

    it("should send correct headers and body", async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            status: 200,
            ok: true,
            headers: new Headers(),
        });
        vi.stubGlobal("fetch", mockFetch);

        const ctx = makeContext();
        await webhookExecutor.execute(
            makeAction("https://example.com/hook"),
            { key: "value" },
            ctx,
        );

        expect(mockFetch).toHaveBeenCalledOnce();
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toBe("https://example.com/hook");
        expect(options.method).toBe("POST");
        expect(options.redirect).toBe("manual");
        expect(options.headers["X-Event-Id"]).toBe("evt-1");
        expect(options.headers["X-Event-Key"]).toBe("test_event");
        expect(options.headers["X-Correlation-Id"]).toBe("corr-1");

        const body = JSON.parse(options.body);
        expect(body.event).toBe("test_event");
        expect(body.payload.key).toBe("value");
    });

    it("should handle timeout (AbortError)", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(
            Object.assign(new Error("aborted"), { name: "AbortError" }),
        ));

        const result = await webhookExecutor.execute(
            makeAction("https://slow.example.com"),
            {},
            makeContext(),
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain("timed out");
    });

    it("should handle network errors gracefully", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(
            new Error("ECONNREFUSED"),
        ));

        const result = await webhookExecutor.execute(
            makeAction("https://unreachable.example.com"),
            {},
            makeContext(),
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain("ECONNREFUSED");
    });
});
