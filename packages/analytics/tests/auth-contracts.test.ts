import { describe, it, expect } from "vitest";
import {
    AuthRegistrationStarted,
    AuthRegistrationCompleted,
    AuthEmailVerificationSent,
    AuthEmailVerificationCompleted,
    AuthLoginCompleted,
} from "../src/event-contracts/auth";

// =============================================================================
// Auth Event Contract Tests
// =============================================================================

describe("AuthRegistrationStarted", () => {
    it("has correct event name", () => {
        expect(AuthRegistrationStarted.name).toBe("auth.registration.started");
    });

    it("has version 1", () => {
        expect(AuthRegistrationStarted.version).toBe(1);
    });

    it("has method property", () => {
        expect("method" in AuthRegistrationStarted.properties).toBe(true);
    });
});

describe("AuthRegistrationCompleted", () => {
    it("has correct event name", () => {
        expect(AuthRegistrationCompleted.name).toBe("auth.registration.completed");
    });

    it("has email_hash property (never raw email)", () => {
        expect("email_hash" in AuthRegistrationCompleted.properties).toBe(true);
    });
});

describe("AuthEmailVerificationSent", () => {
    it("has correct event name", () => {
        expect(AuthEmailVerificationSent.name).toBe("auth.email_verification.sent");
    });
});

describe("AuthEmailVerificationCompleted", () => {
    it("has correct event name", () => {
        expect(AuthEmailVerificationCompleted.name).toBe("auth.email_verification.completed");
    });

    it("has time_to_verify_s property", () => {
        expect("time_to_verify_s" in AuthEmailVerificationCompleted.properties).toBe(true);
    });
});

describe("AuthLoginCompleted", () => {
    it("has correct event name", () => {
        expect(AuthLoginCompleted.name).toBe("auth.login.completed");
    });
});

describe("naming conventions", () => {
    it("all auth events use auth.* prefix", () => {
        const contracts = [
            AuthRegistrationStarted,
            AuthRegistrationCompleted,
            AuthEmailVerificationSent,
            AuthEmailVerificationCompleted,
            AuthLoginCompleted,
        ];
        for (const c of contracts) {
            expect(c.name).toMatch(/^auth\./);
        }
    });

    it("all versions are number 1", () => {
        const contracts = [
            AuthRegistrationStarted,
            AuthRegistrationCompleted,
            AuthEmailVerificationSent,
            AuthEmailVerificationCompleted,
            AuthLoginCompleted,
        ];
        for (const c of contracts) {
            expect(c.version).toBe(1);
        }
    });
});
