"use client";

// =============================================================================
// Admin Settings Page — P3-6
// =============================================================================
// Manage platform-wide settings (Turnstile keys, etc.).
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import {
    getPlatformSettingsAction,
    updatePlatformSettingAction,
} from "@/app/actions/platform-settings";

interface Setting {
    key: string;
    value: string;
    description: string | null;
    updatedAt: string;
}

const SETTING_LABELS: Record<string, { icon: string; label: string }> = {
    turnstile_site_key: { icon: "🛡️", label: "Turnstile Site Key" },
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [editKey, setEditKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getPlatformSettingsAction().then((result) => {
            if (result.success) setSettings(result.settings);
            setLoaded(true);
        });
    }, []);

    const handleSave = useCallback(async () => {
        if (!editKey) return;
        setSaving(true);
        const result = await updatePlatformSettingAction(editKey, editValue);
        setSaving(false);
        if (result.success) {
            setSettings((prev) =>
                prev.map((s) =>
                    s.key === editKey
                        ? { ...s, value: editValue, updatedAt: new Date().toISOString() }
                        : s,
                ),
            );
            setEditKey(null);
            setStatus("✅ Setting updated");
            setTimeout(() => setStatus(null), 3000);
        } else {
            setStatus(`❌ ${result.error}`);
        }
    }, [editKey, editValue]);

    return (
        <div style={{ maxWidth: "42rem" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                ⚙️ Platform Settings
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                Manage platform-wide configuration. Changes take effect on the next build/deploy.
            </p>

            {status && (
                <div style={{
                    padding: "0.6rem 0.9rem",
                    marginBottom: "1rem",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${status.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                }}>
                    {status}
                </div>
            )}

            {!loaded ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Loading settings...
                </div>
            ) : settings.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No platform settings configured.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {settings.map((setting) => {
                        const meta = SETTING_LABELS[setting.key] ?? { icon: "⚙️", label: setting.key };
                        const isEditing = editKey === setting.key;

                        return (
                            <div
                                key={setting.key}
                                style={{
                                    padding: "1rem 1.25rem",
                                    border: `1px solid ${isEditing ? "var(--brand-orange)" : "var(--border-subtle)"}`,
                                    borderRadius: "var(--radius-md)",
                                    background: isEditing ? "rgba(227, 38, 82, 0.02)" : "var(--bg-secondary)",
                                    transition: "border-color 0.2s",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <span style={{ fontSize: "1rem" }}>{meta.icon}</span>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{meta.label}</span>
                                    <span style={{
                                        fontSize: "0.6rem",
                                        background: "var(--bg-tertiary)",
                                        padding: "0.1rem 0.4rem",
                                        borderRadius: "var(--radius-sm)",
                                        color: "var(--text-muted)",
                                        fontFamily: "var(--font-mono, monospace)",
                                    }}>
                                        {setting.key}
                                    </span>
                                </div>

                                {setting.description && (
                                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>
                                        {setting.description}
                                    </p>
                                )}

                                {isEditing ? (
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: "0.5rem 0.75rem",
                                                borderRadius: "var(--radius-sm)",
                                                border: "1px solid var(--border-subtle)",
                                                background: "var(--bg-primary)",
                                                color: "var(--text-primary)",
                                                fontSize: "0.8rem",
                                                fontFamily: "var(--font-mono, monospace)",
                                            }}
                                        />
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="episode-action-btn"
                                            style={{ fontSize: "0.72rem" }}
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={() => setEditKey(null)}
                                            style={{
                                                padding: "0.35rem 0.7rem",
                                                fontSize: "0.72rem",
                                                border: "1px solid var(--border-subtle)",
                                                borderRadius: "var(--radius-sm)",
                                                background: "transparent",
                                                color: "var(--text-muted)",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <code style={{
                                            flex: 1,
                                            fontSize: "0.75rem",
                                            color: "var(--text-secondary)",
                                            fontFamily: "var(--font-mono, monospace)",
                                            wordBreak: "break-all",
                                        }}>
                                            {setting.value}
                                        </code>
                                        <button
                                            onClick={() => {
                                                setEditKey(setting.key);
                                                setEditValue(setting.value);
                                            }}
                                            style={{
                                                padding: "0.3rem 0.65rem",
                                                fontSize: "0.7rem",
                                                fontWeight: 600,
                                                border: "1px solid var(--border-subtle)",
                                                borderRadius: "var(--radius-sm)",
                                                background: "transparent",
                                                color: "var(--text-muted)",
                                                cursor: "pointer",
                                                flexShrink: 0,
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}

                                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                                    Last updated: {new Date(setting.updatedAt).toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
