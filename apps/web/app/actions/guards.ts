"use server";

// =============================================================================
// Shared Admin Access Guard — Phase 1.6 (M4 Fix)
// =============================================================================
// Single source of truth for admin role checks across all server actions.
// =============================================================================

import { getServerIdentity } from "./identity";

type AdminIdentity = {
    userId: string;
    organizationId: string;
    role: string;
};

/**
 * Get the server identity and assert the user has admin access.
 * Throws if user is not authenticated or not owner/admin.
 */
export async function requireAdmin(): Promise<AdminIdentity> {
    const identity = await getServerIdentity();
    if (!identity || !["owner", "admin"].includes(identity.role)) {
        throw new Error("Unauthorized: admin access required");
    }
    return identity as AdminIdentity;
}
