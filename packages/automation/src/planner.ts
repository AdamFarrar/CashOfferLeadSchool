// =============================================================================
// @cols/automation — Action Planner
// =============================================================================
// Converts matched rules into planned actions.
// No idempotency logic here — DB handles it in the dispatcher.
// =============================================================================

import type { AutomationRule, PlannedAction } from "./types";

/**
 * Build a list of planned actions from matched rules.
 * Simple 1:1 mapping: one rule → one action.
 */
export function planActions(rules: AutomationRule[]): PlannedAction[] {
    return rules.map(rule => ({
        ruleId: rule.id,
        ruleName: rule.name,
        channel: rule.actionChannel,
        actionType: rule.actionType,
        actionConfig: rule.actionConfig,
    }));
}
