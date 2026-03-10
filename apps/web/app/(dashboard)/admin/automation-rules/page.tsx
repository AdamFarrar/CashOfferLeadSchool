"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import {
    listAutomationRulesAction,
    createAutomationRuleAction,
    deleteAutomationRuleAction,
    toggleAutomationRuleAction,
} from "@/app/actions/automation-rules";
import { DOMAIN_EVENTS } from "@cocs/events";

// =============================================================================
// Admin Automation Rules — Phase 1.6
// =============================================================================

type Rule = {
    id: string;
    eventKey: string;
    name: string;
    enabled: boolean;
    priority: number;
    actionChannel: string;
    actionType: string;
    actionConfig: Record<string, unknown>;
    organizationId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

const EVENT_OPTIONS = Object.values(DOMAIN_EVENTS) as string[];
const CHANNEL_OPTIONS = ["email", "webhook", "notification"];

const adminInputCls = "px-3 py-2 text-[0.825rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] w-full";
const adminLabelCls = "text-[0.7rem] font-semibold text-[var(--text-muted)] mb-1 block";
const adminBtnPrimaryCls = "px-4 py-2 text-[0.825rem] font-semibold text-white border-none rounded-[var(--radius-sm)] cursor-pointer";
const adminBtnGhostCls = "px-4 py-2 text-[0.825rem] bg-transparent text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer";

export default function AutomationRulesPage() {
    const { data: session } = useSession();
    const { data: activeOrg } = useActiveOrganization();
    const userRole = activeOrg?.members?.find(
        (m: { userId: string }) => m.userId === session?.user?.id
    )?.role || "";

    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        eventKey: EVENT_OPTIONS[0],
        name: "",
        actionChannel: "email",
        actionType: "send_template",
        templateKey: "",
        webhookUrl: "",
        priority: 100,
    });
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listAutomationRulesAction();
            setRules(data as Rule[]);
        } catch { /* */ }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        setCreating(true);

        const actionConfig: Record<string, unknown> = {};
        if (form.actionChannel === "email") {
            actionConfig.templateKey = form.templateKey;
        } else if (form.actionChannel === "webhook") {
            actionConfig.url = form.webhookUrl;
        }

        await createAutomationRuleAction({
            eventKey: form.eventKey,
            name: form.name,
            actionChannel: form.actionChannel,
            actionType: form.actionType,
            actionConfig,
            priority: form.priority,
        });

        setForm({ eventKey: EVENT_OPTIONS[0], name: "", actionChannel: "email", actionType: "send_template", templateKey: "", webhookUrl: "", priority: 100 });
        setShowCreate(false);
        setCreating(false);
        load();
    };

    const handleToggle = async (ruleId: string, enabled: boolean) => {
        await toggleAutomationRuleAction(ruleId, !enabled);
        load();
    };

    const handleDelete = async (ruleId: string) => {
        if (!confirm("Delete this automation rule?")) return;
        await deleteAutomationRuleAction(ruleId);
        load();
    };

    if (!["owner", "admin"].includes(userRole)) {
        return <div className="text-center p-12"><h1>Access Denied</h1></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl mb-1">Automation Rules</h1>
                    <p className="text-[var(--text-secondary)] text-[0.85rem]">
                        Configure event-driven actions: email, webhook, notifications.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className={adminBtnPrimaryCls}
                    style={{ background: "var(--brand-orange)" }}
                >
                    + New Rule
                </button>
            </div>

            {showCreate && (
                <div className="glass-card p-5 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={adminLabelCls}>Event</label>
                            <select value={form.eventKey} onChange={(e) => setForm({ ...form, eventKey: e.target.value })} className={adminInputCls}>
                                {EVENT_OPTIONS.map((e: string) => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={adminLabelCls}>Name</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rule name" className={adminInputCls} />
                        </div>
                        <div>
                            <label className={adminLabelCls}>Channel</label>
                            <select value={form.actionChannel} onChange={(e) => setForm({ ...form, actionChannel: e.target.value })} className={adminInputCls}>
                                {CHANNEL_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={adminLabelCls}>Priority</label>
                            <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 100 })} className={adminInputCls} />
                        </div>
                        {form.actionChannel === "email" && (
                            <div className="col-span-2">
                                <label className={adminLabelCls}>Template Key</label>
                                <input value={form.templateKey} onChange={(e) => setForm({ ...form, templateKey: e.target.value })} placeholder="e.g. verification" className={adminInputCls} />
                            </div>
                        )}
                        {form.actionChannel === "webhook" && (
                            <div className="col-span-2">
                                <label className={adminLabelCls}>Webhook URL</label>
                                <input value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} placeholder="https://..." className={adminInputCls} />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className={`${adminBtnPrimaryCls} ${creating ? "opacity-50" : ""}`}
                            style={{ background: "var(--brand-orange)" }}
                        >
                            {creating ? "Creating..." : "Create Rule"}
                        </button>
                        <button onClick={() => setShowCreate(false)} className={adminBtnGhostCls}>Cancel</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center p-12 text-[var(--text-muted)]">Loading rules...</div>
            ) : rules.length === 0 ? (
                <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                    No automation rules configured. Seed rules will be created with the migration.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {rules.map((r) => (
                        <div key={r.id} className={`glass-card p-5 ${r.enabled ? "" : "opacity-60"}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-[0.95rem] font-semibold">{r.name}</h3>
                                        {/* Status badge — dynamic color based on enabled state */}
                                        <span
                                            className="text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded-full"
                                            style={{
                                                background: r.enabled ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                                color: r.enabled ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)",
                                            }}
                                        >
                                            {r.enabled ? "active" : "disabled"}
                                        </span>
                                        <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-[var(--border-subtle)] text-[var(--text-muted)]">
                                            {r.actionChannel}
                                        </span>
                                    </div>
                                    <div className="text-[0.8rem] text-[var(--text-secondary)]">
                                        <code>{r.eventKey}</code> → <code>{r.actionType}</code>
                                        {(r.actionConfig as any)?.templateKey && (
                                            <span> · template: <code>{(r.actionConfig as any).templateKey}</code></span>
                                        )}
                                    </div>
                                    <div className="text-[0.7rem] text-[var(--text-muted)] mt-1">
                                        Priority: {r.priority} · {r.organizationId ? "org-specific" : "system"}
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    {/* Toggle button — dynamic colors based on current enabled state */}
                                    <button
                                        onClick={() => handleToggle(r.id, r.enabled)}
                                        className="px-2.5 py-1.5 text-[0.72rem] font-semibold rounded-[var(--radius-sm)] cursor-pointer"
                                        style={{
                                            background: r.enabled ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                                            color: r.enabled ? "rgba(239, 68, 68, 0.9)" : "rgba(34, 197, 94, 0.9)",
                                            border: `1px solid ${r.enabled ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)"}`,
                                        }}
                                    >
                                        {r.enabled ? "Disable" : "Enable"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className="px-2.5 py-1.5 text-[0.72rem] bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[var(--text-muted)] cursor-pointer"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
