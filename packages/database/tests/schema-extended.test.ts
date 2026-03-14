import { describe, it, expect } from "vitest";
import { liveSession } from "../src/schema/live-session";
import { sessionRsvp } from "../src/schema/session-rsvp";
import { sessionHost } from "../src/schema/session-host";
import { contentThread, contentPost, contentReaction } from "../src/schema/discussion";

// =============================================================================
// Additional Schema Contract Tests
// =============================================================================

describe("liveSession schema", () => {
    it("has expected columns", () => {
        expect(liveSession.id).toBeDefined();
        expect(liveSession.title).toBeDefined();
        expect(liveSession.scheduledAt).toBeDefined();
        expect(liveSession.status).toBeDefined();
        expect(liveSession.durationMinutes).toBeDefined();
    });
});

describe("sessionHost schema", () => {
    it("has expected columns", () => {
        expect(sessionHost.id).toBeDefined();
        expect(sessionHost.name).toBeDefined();
        expect(sessionHost.bio).toBeDefined();
    });
});

describe("sessionRsvp schema", () => {
    it("has expected columns", () => {
        expect(sessionRsvp.id).toBeDefined();
        expect(sessionRsvp.sessionId).toBeDefined();
        expect(sessionRsvp.userId).toBeDefined();
    });
});

describe("contentThread schema", () => {
    it("has expected columns", () => {
        expect(contentThread.id).toBeDefined();
        expect(contentThread.title).toBeDefined();
        expect(contentThread.programId).toBeDefined();
    });
});

describe("contentPost schema", () => {
    it("has expected columns", () => {
        expect(contentPost.id).toBeDefined();
        expect(contentPost.body).toBeDefined();
        expect(contentPost.userId).toBeDefined();
    });
});

describe("contentReaction schema", () => {
    it("has expected columns", () => {
        expect(contentReaction.id).toBeDefined();
        expect(contentReaction.postId).toBeDefined();
        expect(contentReaction.userId).toBeDefined();
    });
});
