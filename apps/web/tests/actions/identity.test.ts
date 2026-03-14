import { describe, it, expect } from "vitest";
import type { ServerIdentity } from "../../app/actions/identity";

// =============================================================================
// Identity Types Tests
// =============================================================================

describe("ServerIdentity", () => {
    it("satisfies the interface", () => {
        const identity: ServerIdentity = {
            userId: "user-1",
            organizationId: "org-1",
            role: "admin",
        };
        expect(identity.userId).toBe("user-1");
    });

    it("supports all standard roles", () => {
        const roles = ["owner", "admin", "instructor", "student", "prospect"];
        for (const role of roles) {
            const identity: ServerIdentity = {
                userId: "u-1",
                organizationId: "o-1",
                role,
            };
            expect(identity.role).toBe(role);
        }
    });
});
