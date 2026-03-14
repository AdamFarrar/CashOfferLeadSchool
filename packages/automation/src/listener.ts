// =============================================================================
// @cols/automation — Event Bus Listener
// =============================================================================
// Subscribes per-event (NOT wildcard) via the AUTOMATION_EVENTS registry.
// Handles: evaluate rules → plan actions → dispatch.
// Circuit breaker: MAX_ACTIONS_PER_EVENT limits action count.
// =============================================================================

import { registerListener, type DomainEvent } from "@cols/events";
import { AUTOMATION_EVENTS } from "./events";
import { evaluateRules } from "./evaluator";
import { planActions } from "./planner";
import { dispatchActions } from "./dispatcher";

const MAX_ACTIONS_PER_EVENT = 10;

/**
 * Register the automation orchestrator as an event bus listener.
 * Subscribes to each event in AUTOMATION_EVENTS (not wildcard).
 */
export function registerAutomationListener(): void {
    for (const eventKey of AUTOMATION_EVENTS) {
        registerListener(eventKey, handleAutomationEvent);
    }
    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
        console.info(
            `[AUTOMATION] Registered listener for ${AUTOMATION_EVENTS.length} events: ` +
            AUTOMATION_EVENTS.join(", ")
        );
    }
}

async function handleAutomationEvent(event: DomainEvent): Promise<void> {
    try {
        // 1. Evaluate — which rules match this event?
        const matchedRules = await evaluateRules(event);
        if (matchedRules.length === 0) return;

        // 2. Plan — build action list
        const actions = planActions(matchedRules);

        // 3. Circuit breaker — prevent event storms
        if (actions.length > MAX_ACTIONS_PER_EVENT) {
            console.error(
                `[AUTOMATION] Circuit breaker: ${actions.length} actions exceed ` +
                `limit of ${MAX_ACTIONS_PER_EVENT} | event=${event.eventKey} id=${event.eventId}`
            );
            return;
        }

        // 4. Warn on delay/retry — not yet implemented (Phase 2)
        for (const rule of matchedRules) {
            if (rule.delayMs > 0) {
                console.warn(
                    `[AUTOMATION] Rule "${rule.name}" has delayMs=${rule.delayMs} but delayed execution is not implemented. Executing immediately.`
                );
            }
            if (rule.maxRetries > 0) {
                console.warn(
                    `[AUTOMATION] Rule "${rule.name}" has maxRetries=${rule.maxRetries} but retry logic is not implemented. Single attempt only.`
                );
            }
        }

        // 5. Dispatch — execute via channel executors
        await dispatchActions(actions, event);

        if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
            console.info(
                `[AUTOMATION] Completed | event=${event.eventKey} id=${event.eventId} ` +
                `rules=${matchedRules.length} actions=${actions.length}`
            );
        }
    } catch (err) {
        console.error(
            `[AUTOMATION] Orchestrator error | event=${event.eventKey} id=${event.eventId}`,
            err,
        );
    }
}
