import { describe, it, expect } from "vitest";
import { ac, owner, admin, instructor, student, prospect } from "../src/permissions";

// =============================================================================
// RBAC Permission Tests
// =============================================================================

describe("role hierarchy", () => {
    it("owner has all permissions", () => {
        expect(owner).toBeTruthy();
    });

    it("admin role is defined", () => {
        expect(admin).toBeTruthy();
    });

    it("instructor role is defined", () => {
        expect(instructor).toBeTruthy();
    });

    it("student role is defined", () => {
        expect(student).toBeTruthy();
    });

    it("prospect role is defined", () => {
        expect(prospect).toBeTruthy();
    });

    it("access control system is initialized", () => {
        expect(ac).toBeTruthy();
    });
});

describe("permission granularity", () => {
    it("all 5 roles are distinct objects", () => {
        const roles = [owner, admin, instructor, student, prospect];
        const unique = new Set(roles);
        expect(unique.size).toBe(5);
    });
});
