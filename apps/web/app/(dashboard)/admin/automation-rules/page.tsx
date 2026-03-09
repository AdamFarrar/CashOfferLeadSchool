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
        return <div style={{ textAlign: "center", padding: "3rem" }}><h1>Access Denied</h1></div>;
    }

    const inputStyle = {
        padding: "0.5rem 0.75rem", fontSize: "0.825rem",
        background: "var(--bg-primary)", color: "var(--text-primary)",
        border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
        width: "100%",
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Automation Rules</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        Configure event-driven actions: email, webhook, notifications.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    style={{
                        padding: "0.5rem 1rem", fontSize: "0.825rem", fontWeight: 600,
                        background: "var(--brand-orange)", color: "#fff",
                        border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                    }}
                >
                    + New Rule
                </button>
            </div>

            {showCreate && (
                <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>Event</label>
                            <select value={form.eventKey} onChange={(e) => setForm({ ...form, eventKey: e.target.value })} style={inputStyle}>
                                {EVENT_OPTIONS.map((e: string) => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>Name</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rule name" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>Channel</label>
                            <select value={form.actionChannel} onChange={(e) => setForm({ ...form, actionChannel: e.target.value })} style={inputStyle}>
                                {CHANNEL_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>Priority</label>
                            <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 100 })} style={inputStyle} />
                        </div>
                        {form.actionChannel === "email" && (
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>Template Key</label>
                                <input value={form.templateKey} onChange={(e) => setForm({ ...form, templateKey: e.target.value })} placeholder="e.g. verification" style={inputStyle} />
                            </div>
                        )}
                        {form.actionChannel === "webhook" && (
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>Webhook URL</label>
                                <input value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} placeholder="https://..." style={inputStyle} />
                            </div>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                        <button onClick={handleCreate} disabled={creating} style={{
                            padding: "0.5rem 1rem", fontSize: "0.825rem", fontWeight: 600,
                            background: "var(--brand-orange)", color: "#fff",
                            border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                            opacity: creating ? 0.5 : 1,
                        }}>
                            {creating ? "Creating..." : "Create Rule"}
                        </button>
                        <button onClick={() => setShowCreate(false)} style={{
                            padding: "0.5rem 1rem", fontSize: "0.825rem",
                            background: "transparent", color: "var(--text-muted)",
                            border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", cursor: "pointer",
                        }}>Cancel</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading rules...</div>
            ) : rules.length === 0 ? (
                <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No automation rules configured. Seed rules will be created with the migration.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {rules.map((r) => (
                        <div key={r.id} className="glass-card" style={{ padding: "1.25rem", opacity: r.enabled ? 1 : 0.6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                        <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{r.name}</h3>
                                        <span style={{
                                            fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                                            padding: "0.1rem 0.4rem", borderRadius: "var(--radius-full)",
                                            background: r.enabled ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                            color: r.enabled ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)",
                                        }}>
                                            {r.enabled ? "active" : "disabled"}
                                        </span>
                                        <span style={{
                                            fontSize: "0.6rem", padding: "0.1rem 0.4rem",
                                            borderRadius: "var(--radius-full)", background: "var(--border-subtle)", color: "var(--text-muted)",
                                        }}>
                                            {r.actionChannel}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                        <code>{r.eventKey}</code> → <code>{r.actionType}</code>
                                        {(r.actionConfig as any)?.templateKey && (
                                            <span> · template: <code>{(r.actionConfig as any).templateKey}</code></span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                        Priority: {r.priority} · {r.organizationId ? "org-specific" : "system"}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "0.375rem" }}>
                                    <button
                                        onClick={() => handleToggle(r.id, r.enabled)}
                                        style={{
                                            padding: "0.35rem 0.6rem", fontSize: "0.72rem", fontWeight: 600,
                                            background: r.enabled ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                                            color: r.enabled ? "rgba(239, 68, 68, 0.9)" : "rgba(34, 197, 94, 0.9)",
                                            border: `1px solid ${r.enabled ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)"}`,
                                            borderRadius: "var(--radius-sm)", cursor: "pointer",
                                        }}
                                    >
                                        {r.enabled ? "Disable" : "Enable"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        style={{
                                            padding: "0.35rem 0.6rem", fontSize: "0.72rem",
                                            background: "transparent", border: "1px solid var(--border-subtle)",
                                            borderRadius: "var(--radius-sm)", color: "var(--text-muted)", cursor: "pointer",
                                        }}
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
