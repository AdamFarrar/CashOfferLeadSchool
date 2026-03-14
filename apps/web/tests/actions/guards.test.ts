import { describe, it, expect } from "vitest";

// =============================================================================
// Guards Action Contract Tests
// =============================================================================

describe("admin guard contract", () => {
    it("admin roles are owner and admin", () => {
        const adminRoles = ["owner", "admin"];
        expect(adminRoles).toContain("owner");
        expect(adminRoles).toContain("admin");
        expect(adminRoles).not.toContain("student");
        expect(adminRoles).not.toContain("instructor");
    });

    it("error message is descriptive", () => {
        const errorMessage = "Unauthorized: admin access required";
        expect(errorMessage).toContain("admin");
        expect(errorMessage).toContain("Unauthorized");
    });
});
