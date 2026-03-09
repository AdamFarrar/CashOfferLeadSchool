"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { useRouter } from "next/navigation";
import {
    listTemplatesAction,
    createTemplateAction,
    deleteTemplateAction,
} from "@/app/actions/email-templates";

// =============================================================================
// Admin Email Templates List — Phase 1.6
// =============================================================================

type Template = {
    id: string;
    key: string;
    name: string;
    description: string | null;
    organizationId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export default function EmailTemplatesPage() {
    const { data: session } = useSession();
    const { data: activeOrg } = useActiveOrganization();
    const router = useRouter();
    const userRole = activeOrg?.members?.find(
        (m: { userId: string }) => m.userId === session?.user?.id
    )?.role || "";

    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newKey, setNewKey] = useState("");
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listTemplatesAction();
            setTemplates(data as Template[]);
        } catch { /* */ }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        if (!newKey.trim() || !newName.trim()) return;
        setCreating(true);
        await createTemplateAction({ key: newKey, name: newName, description: newDesc || undefined });
        setNewKey(""); setNewName(""); setNewDesc(""); setShowCreate(false);
        setCreating(false);
        load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this template and all versions?")) return;
        await deleteTemplateAction(id);
        load();
    };

    if (!["owner", "admin"].includes(userRole)) {
        return (
            <div style={{ textAlign: "center", padding: "3rem" }}>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Access Denied</h1>
                <p style={{ color: "var(--text-secondary)" }}>Admin access required.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Email Templates</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        Manage email templates with drag-and-drop editing.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.825rem",
                        fontWeight: 600,
                        background: "var(--brand-orange)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                    }}
                >
                    + New Template
                </button>
            </div>

            {showCreate && (
                <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <input
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="Template key (e.g. welcome_email)"
                            style={{
                                padding: "0.5rem 0.75rem", fontSize: "0.825rem",
                                background: "var(--bg-primary)", color: "var(--text-primary)",
                                border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                            }}
                        />
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Display name"
                            style={{
                                padding: "0.5rem 0.75rem", fontSize: "0.825rem",
                                background: "var(--bg-primary)", color: "var(--text-primary)",
                                border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                            }}
                        />
                        <input
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            placeholder="Description (optional)"
                            style={{
                                padding: "0.5rem 0.75rem", fontSize: "0.825rem",
                                background: "var(--bg-primary)", color: "var(--text-primary)",
                                border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                            }}
                        />
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                onClick={handleCreate}
                                disabled={creating}
                                style={{
                                    padding: "0.5rem 1rem", fontSize: "0.825rem", fontWeight: 600,
                                    background: "var(--brand-orange)", color: "#fff",
                                    border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                                    opacity: creating ? 0.5 : 1,
                                }}
                            >
                                {creating ? "Creating..." : "Create"}
                            </button>
                            <button
                                onClick={() => setShowCreate(false)}
                                style={{
                                    padding: "0.5rem 1rem", fontSize: "0.825rem",
                                    background: "transparent", color: "var(--text-muted)",
                                    border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    Loading templates...
                </div>
            ) : templates.length === 0 ? (
                <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No templates yet. Create one to get started.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            className="glass-card"
                            style={{ padding: "1.25rem", cursor: "pointer" }}
                            onClick={() => router.push(`/admin/email-templates/${t.id}`)}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                        <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{t.name}</h3>
                                        <span style={{
                                            fontSize: "0.65rem", padding: "0.1rem 0.4rem",
                                            borderRadius: "var(--radius-full)",
                                            background: t.organizationId ? "rgba(59, 130, 246, 0.1)" : "rgba(34, 197, 94, 0.1)",
                                            color: t.organizationId ? "rgba(59, 130, 246, 0.9)" : "rgba(34, 197, 94, 0.9)",
                                        }}>
                                            {t.organizationId ? "org" : "system"}
                                        </span>
                                    </div>
                                    <code style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.key}</code>
                                    {t.description && (
                                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{t.description}</p>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/email-templates/${t.id}/editor`); }}
                                        style={{
                                            padding: "0.35rem 0.75rem", fontSize: "0.72rem", fontWeight: 600,
                                            background: "rgba(99, 102, 241, 0.1)", color: "rgba(99, 102, 241, 0.9)",
                                            border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "var(--radius-sm)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Edit ✏️
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                                        style={{
                                            padding: "0.35rem 0.75rem", fontSize: "0.72rem",
                                            background: "transparent", color: "var(--text-muted)",
                                            border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                                Updated {new Date(t.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
