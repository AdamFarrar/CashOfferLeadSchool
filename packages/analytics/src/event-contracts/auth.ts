// =============================================================================
// Event Contracts — Auth Events
// =============================================================================

export const AuthRegistrationStarted = {
    name: "auth.registration.started",
    version: 1,
    description: "User begins the registration flow",
    properties: {
        method: "" as string, // "email" | "google" etc.
    },
} as const;

export const AuthRegistrationCompleted = {
    name: "auth.registration.completed",
    version: 1,
    description: "User completes registration",
    properties: {
        method: "" as string,
        email_hash: "" as string, // SHA-256, never raw email
    },
} as const;

export const AuthEmailVerificationSent = {
    name: "auth.email_verification.sent",
    version: 1,
    description: "Verification email is sent to user",
    properties: {} as Record<string, never>,
} as const;

export const AuthEmailVerificationCompleted = {
    name: "auth.email_verification.completed",
    version: 1,
    description: "User verifies their email",
    properties: {
        time_to_verify_s: 0 as number, // seconds from sent to verified
    },
} as const;

export const AuthLoginCompleted = {
    name: "auth.login.completed",
    version: 1,
    description: "User successfully logs in",
    properties: {
        method: "" as string,
    },
} as const;
