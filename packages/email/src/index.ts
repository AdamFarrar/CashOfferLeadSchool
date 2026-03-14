// =============================================================================
// @cols/email — Barrel Export
// =============================================================================

export { sanitizeHtml } from "./sanitizer";
export { PLACEHOLDER_REGISTRY, validatePlaceholders, injectPlaceholders } from "./placeholders";
export type { PlaceholderDefinition } from "./placeholders";
export { renderEmail } from "./renderer";
export type { RenderResult } from "./renderer";
export { resolveTemplate } from "./resolver";
export type { ResolvedTemplate } from "./resolver";
export { deliverEmail } from "./delivery";
export type { DeliveryOptions, DeliveryResult } from "./delivery";
export { getFallbackHtml, getFallbackSubject } from "./fallbacks";
export { logEmailSend } from "./send-log";
export type { SendLogEntry } from "./send-log";
