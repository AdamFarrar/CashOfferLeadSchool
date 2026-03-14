import { describe, it, expect } from "vitest";
import { enrollment } from "../src/schema/enrollment";
import { user } from "../src/schema/auth";
import { program } from "../src/schema/program";
import { booking } from "../src/schema/booking";

// =============================================================================
// Database Schema Contract Tests
// =============================================================================

describe("enrollment schema", () => {
    it("has expected column names", () => {
        expect(enrollment.id).toBeDefined();
        expect(enrollment.userId).toBeDefined();
        expect(enrollment.status).toBeDefined();
        expect(enrollment.amountCents).toBeDefined();
        expect(enrollment.currency).toBeDefined();
        expect(enrollment.enrolledAt).toBeDefined();
        expect(enrollment.stripeCustomerId).toBeDefined();
    });
});

describe("user schema", () => {
    it("has expected column names", () => {
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.emailVerified).toBeDefined();
        expect(user.createdAt).toBeDefined();
    });
});

describe("program schema", () => {
    it("has expected column names", () => {
        expect(program.id).toBeDefined();
        expect(program.title).toBeDefined();
        expect(program.status).toBeDefined();
    });
});

describe("booking schema", () => {
    it("has expected column names", () => {
        expect(booking.id).toBeDefined();
        expect(booking.userId).toBeDefined();
        expect(booking.status).toBeDefined();
    });
});
