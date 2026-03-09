import { createAccessControl, role } from "better-auth/plugins/access";

// =============================================================================
// RBAC Permission Definitions
// =============================================================================
// Roles: owner > admin > instructor > student > prospect
//
// Permission format: "resource:action"
// Uses BetterAuth's access control system with createAccessControl + role.
// =============================================================================

const statement = {
    organization: ["create", "read", "update", "delete"],
    member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "revoke"],
    course: ["create", "read", "update", "delete", "publish"],
    episode: ["create", "read", "update", "delete"],
    progress: ["read", "track"],
    coaching: ["create", "read", "update", "delete", "manage"],
    qualification: ["submit", "read", "review"],
    analytics: ["read"],
    settings: ["read", "update"],
    audit: ["read"],
    billing: ["read", "manage"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
    organization: ["create", "read", "update", "delete"],
    member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "revoke"],
    course: ["create", "read", "update", "delete", "publish"],
    episode: ["create", "read", "update", "delete"],
    progress: ["read", "track"],
    coaching: ["create", "read", "update", "delete", "manage"],
    qualification: ["submit", "read", "review"],
    analytics: ["read"],
    settings: ["read", "update"],
    audit: ["read"],
    billing: ["read", "manage"],
});

export const admin = ac.newRole({
    organization: ["read", "update"],
    member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "revoke"],
    course: ["create", "read", "update", "delete", "publish"],
    episode: ["create", "read", "update", "delete"],
    progress: ["read", "track"],
    coaching: ["read"],
    qualification: ["read", "review"],
    analytics: ["read"],
    settings: ["read"],
    audit: ["read"],
    billing: ["read"],
});

export const instructor = ac.newRole({
    organization: ["read"],
    member: ["read"],
    course: ["create", "read", "update"],
    episode: ["create", "read", "update"],
    progress: ["read"],
    coaching: ["create", "read", "update", "manage"],
    qualification: ["read"],
    analytics: ["read"],
});

export const student = ac.newRole({
    organization: ["read"],
    course: ["read"],
    episode: ["read"],
    progress: ["read", "track"],
    coaching: ["read"],
    qualification: ["submit", "read"],
});

export const prospect = ac.newRole({
    qualification: ["submit"],
});
