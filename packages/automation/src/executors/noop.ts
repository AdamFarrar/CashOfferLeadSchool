// =============================================================================
// @cocs/automation — Noop Channel Executor (Placeholder)
// =============================================================================

import type { ChannelExecutor, PlannedAction, ExecutorContext, ExecutorResult } from "../types";

export const noopExecutor: ChannelExecutor = {
    channel: "notification",

    async execute(
        action: PlannedAction,
        _eventPayload: Record<string, unknown>,
        context: ExecutorContext,
    ): Promise<ExecutorResult> {
        if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
            console.info(
                `[AUTOMATION] Noop executor | channel=${action.channel} ` +
                `event=${context.eventKey} id=${context.eventId}`
            );
        }
        return { success: true };
    },
};
