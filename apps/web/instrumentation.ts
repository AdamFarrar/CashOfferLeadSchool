// =============================================================================
// Next.js Instrumentation — Listener Bootstrap (Phase 1.6)
// =============================================================================
// Registers event bus listeners at server startup.
// This file is called ONCE by Next.js when the server starts.
// =============================================================================

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        // Dynamic imports to avoid loading server modules in edge runtime
        const { registerAutomationListener } = await import("@cocs/automation");
        const {
            registerAnalyticsListener,
            registerInternalEmails,
            registerInternalUserIds,
            registerStakeholderUserIds,
        } = await import("@cocs/analytics");

        registerAutomationListener();
        registerAnalyticsListener();

        // Wire internal user tagging from environment variables
        const internalEmails = (process.env.INTERNAL_EMAILS || "")
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);
        const internalUserIds = (process.env.INTERNAL_USER_IDS || "")
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);
        const stakeholderUserIds = (process.env.STAKEHOLDER_USER_IDS || "")
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);

        if (internalEmails.length > 0) registerInternalEmails(internalEmails);
        if (internalUserIds.length > 0) registerInternalUserIds(internalUserIds);
        if (stakeholderUserIds.length > 0) registerStakeholderUserIds(stakeholderUserIds);

        const taggedCount = internalEmails.length + internalUserIds.length + stakeholderUserIds.length;
        console.info(
            `[BOOTSTRAP] Automation + analytics listeners registered. ` +
            `Internal tagging: ${internalEmails.length} emails, ${internalUserIds.length} user IDs, ${stakeholderUserIds.length} stakeholders.`
        );
    }
}
