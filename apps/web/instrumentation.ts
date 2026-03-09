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
        const { registerAnalyticsListener } = await import("@cocs/analytics");

        registerAutomationListener();
        registerAnalyticsListener();

        console.info("[BOOTSTRAP] Automation + analytics listeners registered");
    }
}
