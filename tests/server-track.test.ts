import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Server Track Tests
// =============================================================================
// Tests serverTrack envelope construction and fetch behavior.
// =============================================================================

import { serverTrack } from "../packages/analytics/src/server-track";

const TestContract = {
    name: "test.event",
    version: 1,
    description: "A test event",
    properties: {
        test_prop: "" as string,
    },
} as const;

describe("Server Track", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Clear env vars
        delete process.env.POSTHOG_API_KEY;
        delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    });

    it("no-ops without API key", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch");
        await serverTrack(TestContract, { test_prop: "hello" }, { userId: "user-1" });
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("sends fetch when POSTHOG_API_KEY is set", async () => {
        process.env.POSTHOG_API_KEY = "phk_test_key";
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

        await serverTrack(TestContract, { test_prop: "value" }, { userId: "user-123" });

        expect(fetchSpy).toHaveBeenCalledOnce();
        const [url, opts] = fetchSpy.mock.calls[0];
        expect(url).toContain("/capture/");
        expect(opts?.method).toBe("POST");

        const body = JSON.parse(opts?.body as string);
        expect(body.api_key).toBe("phk_test_key");
        expect(body.event).toBe("test.event");
        expect(body.distinct_id).toBe("user-123");
        expect(body.properties.event_name).toBe("test.event");
        expect(body.properties.event_version).toBe(1);
        expect(body.properties.test_prop).toBe("value");
    });

    it("falls back to NEXT_PUBLIC_POSTHOG_KEY", async () => {
        process.env.NEXT_PUBLIC_POSTHOG_KEY = "phk_public_key";
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

        await serverTrack(TestContract, { test_prop: "v" }, { userId: "u" });

        const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
        expect(body.api_key).toBe("phk_public_key");
    });

    it("includes organization_id and session_id in envelope", async () => {
        process.env.POSTHOG_API_KEY = "phk_test";
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

        await serverTrack(TestContract, { test_prop: "v" }, {
            userId: "u-1",
            organizationId: "org-1",
            sessionId: "sess-1",
        });

        const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
        expect(body.properties.organization_id).toBe("org-1");
        expect(body.properties.session_id).toBe("sess-1");
    });

    it("includes active_experiments when provided", async () => {
        process.env.POSTHOG_API_KEY = "phk_test";
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

        await serverTrack(TestContract, { test_prop: "v" }, {
            userId: "u-1",
            activeExperiments: [{ id: "exp_1", variant: "control" }],
        });

        const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
        expect(body.properties.active_experiments).toEqual([{ id: "exp_1", variant: "control" }]);
    });

    it("does not throw on fetch failure", async () => {
        process.env.POSTHOG_API_KEY = "phk_test";
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

        await expect(
            serverTrack(TestContract, { test_prop: "v" }, { userId: "u-1" })
        ).resolves.not.toThrow();
    });
});
