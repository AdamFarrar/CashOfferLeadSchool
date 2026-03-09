import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

// =============================================================================
// BetterAuth Client Hooks
// =============================================================================
// Client-side auth hooks for React components.
// All hooks communicate with the BetterAuth server via /api/auth/* endpoints.
// RBAC checks happen server-side — the client only handles auth state.
// =============================================================================

export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : "",
    plugins: [
        organizationClient(),
    ],
});

export const {
    useSession,
    signIn,
    signUp,
    signOut,
    useActiveOrganization,
    useListOrganizations,
} = authClient;
