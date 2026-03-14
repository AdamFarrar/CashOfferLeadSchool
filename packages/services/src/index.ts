// =============================================================================
// Services Layer — Business Logic
// =============================================================================
// This package contains all business logic, separated from the UI and database.
// Each service module handles a specific domain concern.
//
// Services are imported by apps/web Server Actions and Route Handlers.
// They receive a database client and auth context, never raw requests.
// =============================================================================

export const VERSION = "0.0.1";

export * from "./feedback";
export * from "./qualification";
export * from "./email-templates";
export * from "./automation-rules";
export * from "./rate-limiter";
export * from "./program";
export * from "./discussion";
export * from "./logger";
export * from "./ai-service";
export * from "./booking";
export * from "./enrollment";
export * from "./live-session";
export * from "./session-host";

