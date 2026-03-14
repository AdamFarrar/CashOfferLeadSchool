// =============================================================================
// @cols/automation — Barrel Export
// =============================================================================

export { registerAutomationListener } from "./listener";
export { AUTOMATION_EVENTS } from "./events";
export { evaluateRules, evaluateCondition, validateConditionDepth, MAX_CONDITION_DEPTH } from "./evaluator";
export { planActions } from "./planner";
export { dispatchActions } from "./dispatcher";

export type {
    AutomationRule,
    PlannedAction,
    ChannelExecutor,
    ConditionExpression,
    ExecutorContext,
    ExecutorResult,
} from "./types";
