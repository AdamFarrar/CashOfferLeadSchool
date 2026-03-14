import { describe, it, expect } from "vitest";
import type { SendLogEntry } from "../src/send-log";
import type { ResolvedTemplate } from "../src/resolver";

// =============================================================================
// Email Types Contract Tests
// =============================================================================

describe("SendLogEntry", () => {
    it("satisfies the full interface", () => {
        const entry: SendLogEntry = {
            eventKey: "user_registered",
            templateKey: "verification",
            templateVersionId: "v-1",
            recipientEmail: "test@test.com",
            subject: "Verify Email",
            status: "sent",
            source: "system",
            userId: "u-1",
            correlationId: "corr-1",
            organizationId: null,
        };
        expect(entry.status).toBe("sent");
    });

    it("supports all status values", () => {
        const statuses: SendLogEntry["status"][] = ["sent", "failed", "fallback"];
        expect(statuses).toHaveLength(3);
    });

    it("supports all source values", () => {
        const sources: SendLogEntry["source"][] = ["org", "system", "fallback"];
        expect(sources).toHaveLength(3);
    });

    it("supports optional fields", () => {
        const entry: SendLogEntry = {
            eventKey: "user_registered",
            templateKey: "verification",
            templateVersionId: null,
            recipientEmail: "test@test.com",
            subject: "Verify",
            status: "failed",
            source: "fallback",
            userId: "u-1",
            correlationId: "corr-1",
            organizationId: null,
            errorMessage: "SMTP connection refused",
            resendMessageId: "msg-123",
            automationRuleId: "rule-1",
        };
        expect(entry.errorMessage).toBe("SMTP connection refused");
    });
});

describe("ResolvedTemplate", () => {
    it("supports org source", () => {
        const t: ResolvedTemplate = {
            html: "<p>Hi</p>",
            subject: "Hello",
            versionId: "v-1",
            source: "org",
        };
        expect(t.source).toBe("org");
    });

    it("supports system source", () => {
        const t: ResolvedTemplate = {
            html: "<p>Hi</p>",
            subject: "Hello",
            versionId: "v-1",
            source: "system",
        };
        expect(t.source).toBe("system");
    });

    it("supports fallback with null version", () => {
        const t: ResolvedTemplate = {
            html: "<p>Default</p>",
            subject: "Notification",
            versionId: null,
            source: "fallback",
        };
        expect(t.versionId).toBeNull();
    });
});
