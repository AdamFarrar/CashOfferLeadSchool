import { describe, it, expect } from "vitest";
import { organization, member, invitation, qualificationForm } from "../src/schema/organizations";
import { aiInsight, aiInsightReference, episodeTranscriptSegment } from "../src/schema/ai";
import { auditLog } from "../src/schema/audit";

// =============================================================================
// Database Schema Contract Tests (Organizations, AI, Audit)
// =============================================================================

describe("organization schema", () => {
    it("has expected columns", () => {
        expect(organization.id).toBeDefined();
        expect(organization.name).toBeDefined();
    });
});

describe("member schema", () => {
    it("has expected columns", () => {
        expect(member.id).toBeDefined();
        expect(member.userId).toBeDefined();
        expect(member.organizationId).toBeDefined();
    });
});

describe("invitation schema", () => {
    it("has expected columns", () => {
        expect(invitation.id).toBeDefined();
    });
});

describe("qualificationForm schema", () => {
    it("has expected columns", () => {
        expect(qualificationForm.id).toBeDefined();
    });
});

describe("aiInsight schema", () => {
    it("has expected columns", () => {
        expect(aiInsight.id).toBeDefined();
    });
});

describe("aiInsightReference schema", () => {
    it("has expected columns", () => {
        expect(aiInsightReference.id).toBeDefined();
    });
});

describe("episodeTranscriptSegment schema", () => {
    it("has expected columns", () => {
        expect(episodeTranscriptSegment.id).toBeDefined();
    });
});

describe("auditLog schema", () => {
    it("has expected columns", () => {
        expect(auditLog.id).toBeDefined();
        expect(auditLog.action).toBeDefined();
        expect(auditLog.userId).toBeDefined();
    });
});
