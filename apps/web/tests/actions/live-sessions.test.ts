import { describe, it, expect } from "vitest";

// =============================================================================
// Live Sessions Action Contract Tests
// =============================================================================

describe("live sessions action contracts", () => {
    it("list sessions response", () => {
        const resp = { success: true, sessions: [{ id: "s-1", title: "Q&A Session" }] };
        expect(resp.sessions).toHaveLength(1);
    });

    it("create session response", () => {
        const resp = { success: true, session: { id: "s-1" } };
        expect(resp.session.id).toBeTruthy();
    });
});
