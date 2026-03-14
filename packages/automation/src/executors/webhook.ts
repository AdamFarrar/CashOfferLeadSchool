// =============================================================================
// @cols/automation — Webhook Channel Executor
// =============================================================================
// HTTP POST to configured URL with SSRF protection.
// Defense layers: deny list → redirect blocking → response URL validation.
// =============================================================================

import type { ChannelExecutor, PlannedAction, ExecutorContext, ExecutorResult } from "../types";
import { isUrlBlocked } from "./ssrf";

const WEBHOOK_TIMEOUT_MS = 10_000;

export const webhookExecutor: ChannelExecutor = {
    channel: "webhook",

    async execute(
        action: PlannedAction,
        eventPayload: Record<string, unknown>,
        context: ExecutorContext,
    ): Promise<ExecutorResult> {
        const url = action.actionConfig.url as string;
        if (!url) {
            return { success: false, error: "No webhook URL configured" };
        }

        // Layer 1: Pre-flight URL deny list
        if (isUrlBlocked(url)) {
            console.error(`[WEBHOOK] SSRF blocked: ${url}`);
            return { success: false, error: "Webhook URL blocked by security policy" };
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

            // Layer 2: Disable redirects — blocks 301→internal attacks
            const response = await fetch(url, {
                method: "POST",
                redirect: "manual",
                headers: {
                    "Content-Type": "application/json",
                    "X-Event-Id": context.eventId,
                    "X-Event-Key": context.eventKey,
                    "X-Correlation-Id": context.correlationId,
                },
                body: JSON.stringify({
                    event: context.eventKey,
                    eventId: context.eventId,
                    correlationId: context.correlationId,
                    payload: eventPayload,
                    timestamp: new Date().toISOString(),
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            // Layer 3: Block redirect responses entirely
            if (response.status >= 300 && response.status < 400) {
                const location = response.headers.get("location") || "unknown";
                console.error(`[WEBHOOK] Redirect blocked: ${response.status} → ${location}`);
                return {
                    success: false,
                    error: `Webhook redirect blocked (${response.status}). Direct URLs only.`,
                };
            }

            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                };
            }

            return { success: true };
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                return { success: false, error: `Webhook timed out after ${WEBHOOK_TIMEOUT_MS}ms` };
            }
            return {
                success: false,
                error: err instanceof Error ? err.message : String(err),
            };
        }
    },
};
