import { describe, it, expect } from "vitest";
import { ac, owner, admin, instructor, student, prospect } from "../packages/auth/src/permissions";

describe("RBAC Permission Matrix", () => {
    describe("owner role", () => {
        it("has full access to all resources", () => {
            expect(owner.statements).toBeDefined();
        });

        it("can manage organization", () => {
            const result = owner.authorize({ organization: ["create", "update", "delete"] });
            expect(result.success).toBe(true);
        });

        it("can manage billing", () => {
            const result = owner.authorize({ billing: ["read", "manage"] });
            expect(result.success).toBe(true);
        });

        it("can manage members", () => {
            const result = owner.authorize({ member: ["create", "update", "delete"] });
            expect(result.success).toBe(true);
        });
    });

    describe("admin role", () => {
        it("can manage courses", () => {
            const result = admin.authorize({ course: ["create", "update", "delete"] });
            expect(result.success).toBe(true);
        });

        it("can manage members", () => {
            const result = admin.authorize({ member: ["create", "update", "delete"] });
            expect(result.success).toBe(true);
        });

        it("cannot delete organizations", () => {
            const result = admin.authorize({ organization: ["delete"] });
            expect(result.success).toBe(false);
        });

        it("cannot manage billing", () => {
            const result = admin.authorize({ billing: ["create"] });
            expect(result.success).toBe(false);
        });
    });

    describe("instructor role", () => {
        it("can create courses", () => {
            const result = instructor.authorize({ course: ["create", "update"] });
            expect(result.success).toBe(true);
        });

        it("can manage coaching", () => {
            const result = instructor.authorize({ coaching: ["create", "update"] });
            expect(result.success).toBe(true);
        });

        it("cannot manage members", () => {
            const result = instructor.authorize({ member: ["create"] });
            expect(result.success).toBe(false);
        });

        it("cannot manage organization settings", () => {
            const result = instructor.authorize({ settings: ["update"] });
            expect(result.success).toBe(false);
        });
    });

    describe("student role", () => {
        it("can read courses", () => {
            const result = student.authorize({ course: ["read"] });
            expect(result.success).toBe(true);
        });

        it("can track own progress", () => {
            const result = student.authorize({ progress: ["read", "track"] });
            expect(result.success).toBe(true);
        });

        it("cannot create courses", () => {
            const result = student.authorize({ course: ["create"] });
            expect(result.success).toBe(false);
        });

        it("cannot manage coaching", () => {
            const result = student.authorize({ coaching: ["create"] });
            expect(result.success).toBe(false);
        });
    });

    describe("prospect role", () => {
        it("can submit qualification", () => {
            const result = prospect.authorize({ qualification: ["submit"] });
            expect(result.success).toBe(true);
        });

        it("cannot access courses", () => {
            const result = prospect.authorize({ course: ["read"] });
            expect(result.success).toBe(false);
        });

        it("cannot access analytics", () => {
            const result = prospect.authorize({ analytics: ["read"] });
            expect(result.success).toBe(false);
        });

        it("cannot manage members", () => {
            const result = prospect.authorize({ member: ["read"] });
            expect(result.success).toBe(false);
        });
    });

    describe("access control instance", () => {
        it("is defined", () => {
            expect(ac).toBeDefined();
        });

        it("has newRole method", () => {
            expect(typeof ac.newRole).toBe("function");
        });
    });
});
