// =============================================================================
// Automation Initialization — Phase 8
// =============================================================================
// Registers the automation listener on first import.
// Guards against double-registration with a module-level flag.
// Import this module in the root layout to activate on app startup.
// =============================================================================

import { registerAutomationListener } from "@cols/automation";

let _registered = false;

export function initAutomation(): void {
    if (_registered) return;
    _registered = true;
    registerAutomationListener();
}

// Auto-register on import
initAutomation();
