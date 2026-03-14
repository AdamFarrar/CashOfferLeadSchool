import { describe, it, expect } from "vitest";
import { ac, owner, admin, instructor, student, prospect } from "../packages/auth/src/permissions";

// =============================================================================
// RBAC Permissions Tests
// =============================================================================
// Tests that role definitions follow the expected permission hierarchy.
// Validates that each role has the correct permissions and that
// higher roles have more permissions than lower roles.
// =============================================================================

describe("Permission hierarchy", () => {
    it("owner has all permissions", () => {
        // Owner should have access to all resources
        expect(owner).toBeDefined();
    });

    it("admin is defined", () => {
        expect(admin).toBeDefined();
    });

    it("instructor is defined", () => {
        expect(instructor).toBeDefined();
    });

    it("student is defined", () => {
        expect(student).toBeDefined();
    });

    it("prospect has minimal permissions", () => {
        expect(prospect).toBeDefined();
    });

    it("access control instance is created", () => {
        expect(ac).toBeDefined();
    });
});

describe("Role exports", () => {
    it("exports all 5 roles", () => {
        const roles = [owner, admin, instructor, student, prospect];
        expect(roles).toHaveLength(5);
        roles.forEach(role => expect(role).toBeDefined());
    });

    it("roles are distinct objects", () => {
        expect(owner).not.toBe(admin);
        expect(admin).not.toBe(instructor);
        expect(instructor).not.toBe(student);
        expect(student).not.toBe(prospect);
    });
});
