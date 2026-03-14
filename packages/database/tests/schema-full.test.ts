import { describe, it, expect } from "vitest";
import { user } from "../src/schema/auth";
import { automationRule, automationActionLog, automationDelayedAction } from "../src/schema/automation";
import { emailTemplate, emailTemplateVersion, emailSendLog } from "../src/schema/email";
import { feedbackEntry } from "../src/schema/feedback";
import { platformSetting } from "../src/schema/platform";

// =============================================================================
// Database Schema Contract Tests (Auth, Automation, Email, Feedback, Platform)
// =============================================================================

describe("user schema", () => {
    it("has required auth columns", () => {
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.emailVerified).toBeDefined();
    });
});

describe("automationRule schema", () => {
    it("has expected columns", () => {
        expect(automationRule.id).toBeDefined();
        expect(automationRule.name).toBeDefined();
        expect(automationRule.eventKey).toBeDefined();
        expect(automationRule.enabled).toBeDefined();
    });
});

describe("automationActionLog schema", () => {
    it("has expected columns", () => {
        expect(automationActionLog.id).toBeDefined();
        expect(automationActionLog.eventId).toBeDefined();
        expect(automationActionLog.ruleId).toBeDefined();
        expect(automationActionLog.status).toBeDefined();
        expect(automationActionLog.channel).toBeDefined();
    });
});

describe("automationDelayedAction schema", () => {
    it("has expected columns", () => {
        expect(automationDelayedAction.id).toBeDefined();
    });
});

describe("emailTemplate schema", () => {
    it("has expected columns", () => {
        expect(emailTemplate.id).toBeDefined();
        expect(emailTemplate.key).toBeDefined();
        expect(emailTemplate.name).toBeDefined();
    });
});

describe("emailTemplateVersion schema", () => {
    it("has expected columns", () => {
        expect(emailTemplateVersion.id).toBeDefined();
        expect(emailTemplateVersion.templateId).toBeDefined();
        expect(emailTemplateVersion.htmlBody).toBeDefined();
        expect(emailTemplateVersion.subject).toBeDefined();
        expect(emailTemplateVersion.published).toBeDefined();
    });
});

describe("emailSendLog schema", () => {
    it("has expected columns", () => {
        expect(emailSendLog.id).toBeDefined();
        expect(emailSendLog.recipientEmail).toBeDefined();
        expect(emailSendLog.status).toBeDefined();
        expect(emailSendLog.source).toBeDefined();
    });
});

describe("feedbackEntry schema", () => {
    it("has expected columns", () => {
        expect(feedbackEntry.id).toBeDefined();
        expect(feedbackEntry.userId).toBeDefined();
    });
});

describe("platformSetting schema", () => {
    it("has expected columns", () => {
        expect(platformSetting.key).toBeDefined();
        expect(platformSetting.value).toBeDefined();
    });
});
