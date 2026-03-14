"use server";

import { requireAdmin } from "./guards";
import {
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    listAllAutomationRules,
    getAutomationRule,
    toggleAutomationRule,
} from "@cols/services";
import { isUrlBlocked } from "@cols/automation/ssrf";
import { validateConditionDepth } from "@cols/automation";
import type { ConditionExpression } from "@cols/automation";

// =============================================================================
// Automation Rule Server Actions — Admin Only
// =============================================================================



export async function listAutomationRulesAction() {
    await requireAdmin();
    return listAllAutomationRules();
}

export async function createAutomationRuleAction(data: {
    eventKey: string;
    name: string;
    actionChannel: string;
    actionType: string;
    actionConfig: Record<string, unknown>;
    conditions?: unknown;
    priority?: number;
}) {
    const identity = await requireAdmin();

    // Validate condition depth (prevent recursion abuse)
    if (data.conditions) {
        const depthResult = validateConditionDepth(data.conditions as ConditionExpression);
        if (!depthResult.valid) {
            return { success: false, error: depthResult.error };
        }
    }

    // Validate webhook URLs at creation time — not just execution
    if (data.actionChannel === "webhook") {
        const url = data.actionConfig?.url;
        if (typeof url !== "string" || !url.startsWith("http")) {
            return { success: false, error: "Webhook rules require a valid URL in actionConfig.url" };
        }
        if (isUrlBlocked(url)) {
            return { success: false, error: "Webhook URL blocked by security policy" };
        }
    }

    return createAutomationRule({
        ...data,
        organizationId: null, // System-level rules for now
        createdBy: identity.userId,
    });
}

export async function updateAutomationRuleAction(
    ruleId: string,
    data: {
        name?: string;
        enabled?: boolean;
        conditions?: unknown;
        actionConfig?: Record<string, unknown>;
        priority?: number;
    },
) {
    await requireAdmin();

    // Validate condition depth on update
    if (data.conditions) {
        const depthResult = validateConditionDepth(data.conditions as ConditionExpression);
        if (!depthResult.valid) {
            return { success: false, error: depthResult.error };
        }
    }

    // Re-validate webhook URLs on config update
    if (data.actionConfig) {
        const existing = await getAutomationRule(ruleId);
        if (existing?.actionChannel === "webhook") {
            const url = data.actionConfig?.url;
            if (typeof url === "string" && isUrlBlocked(url)) {
                return { success: false, error: "Webhook URL blocked by security policy" };
            }
        }
    }

    return updateAutomationRule(ruleId, data);
}

export async function deleteAutomationRuleAction(ruleId: string) {
    await requireAdmin();
    return deleteAutomationRule(ruleId);
}

export async function toggleAutomationRuleAction(ruleId: string, enabled: boolean) {
    await requireAdmin();
    return toggleAutomationRule(ruleId, enabled);
}

export async function getAutomationRuleAction(ruleId: string) {
    await requireAdmin();
    return getAutomationRule(ruleId);
}
