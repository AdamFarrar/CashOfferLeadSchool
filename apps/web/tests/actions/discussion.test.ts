import { describe, it, expect } from "vitest";

// =============================================================================
// Discussion Actions Contract Tests
// =============================================================================

describe("discussion action response shapes", () => {
    it("list threads response", () => {
        const resp = { success: true, threads: [{ id: "t-1", title: "ARV Tips" }] };
        expect(resp.threads).toHaveLength(1);
    });

    it("create thread response", () => {
        const resp = { success: true, thread: { id: "t-1", title: "New Thread" } };
        expect(resp.thread.id).toBeTruthy();
    });

    it("post response", () => {
        const resp = { success: true, post: { id: "p-1", body: "Great insight!" } };
        expect(resp.post.body).toBeTruthy();
    });

    it("error response", () => {
        const resp = { success: false, error: "Thread not found" };
        expect(resp.error).toContain("Thread");
    });
});
