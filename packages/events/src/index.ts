// =============================================================================
// @cols/events — Barrel Export
// =============================================================================

export {
    DOMAIN_EVENTS,
    type DomainEventKey,
    type EventActor,
    type EventSubject,
    type DomainEvent,
    type EmitOptions,
    type DomainEventListener,
} from "./types";

export { emitDomainEvent } from "./emitter";

export {
    registerListener,
    registerListenerAll,
    getListeners,
    clearAllListeners,
} from "./registry";
