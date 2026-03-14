"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, useActiveOrganization } from "@cols/auth/client";
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

const adminInputCls = "px-3 py-2 text-[0.825rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)]";

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
            <div className="text-center p-12">
                <h1 className="text-2xl mb-2">Access Denied</h1>
                <p className="text-[var(--text-secondary)]">Admin access required.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl mb-1">Email Templates</h1>
                    <p className="text-[var(--text-secondary)] text-[0.85rem]">
                        Manage email templates with drag-and-drop editing.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-4 py-2 text-[0.825rem] font-semibold text-white border-none rounded-[var(--radius-sm)] cursor-pointer"
                    style={{ background: "var(--brand-orange)" }}
                >
                    + New Template
                </button>
            </div>

            {showCreate && (
                <div className="glass-card p-5 mb-6">
                    <div className="flex flex-col gap-3">
                        <input
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="Template key (e.g. welcome_email)"
                            className={adminInputCls}
                        />
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Display name"
                            className={adminInputCls}
                        />
                        <input
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            placeholder="Description (optional)"
                            className={adminInputCls}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreate}
                                disabled={creating}
                                className={`px-4 py-2 text-[0.825rem] font-semibold text-white border-none rounded-[var(--radius-sm)] cursor-pointer ${creating ? "opacity-50" : ""}`}
                                style={{ background: "var(--brand-orange)" }}
                            >
                                {creating ? "Creating..." : "Create"}
                            </button>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 text-[0.825rem] bg-transparent text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center p-12 text-[var(--text-muted)]">
                    Loading templates...
                </div>
            ) : templates.length === 0 ? (
                <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                    No templates yet. Create one to get started.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            className="glass-card p-5 cursor-pointer"
                            onClick={() => router.push(`/admin/email-templates/${t.id}`)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-[0.95rem] font-semibold">{t.name}</h3>
                                        {/* Dynamic org vs system badge */}
                                        <span
                                            className="text-[0.65rem] px-1.5 py-0.5 rounded-full"
                                            style={{
                                                background: t.organizationId ? "rgba(59, 130, 246, 0.1)" : "rgba(34, 197, 94, 0.1)",
                                                color: t.organizationId ? "rgba(59, 130, 246, 0.9)" : "rgba(34, 197, 94, 0.9)",
                                            }}
                                        >
                                            {t.organizationId ? "org" : "system"}
                                        </span>
                                    </div>
                                    <code className="text-xs text-[var(--text-muted)]">{t.key}</code>
                                    {t.description && (
                                        <p className="text-[0.8rem] text-[var(--text-secondary)] mt-1">{t.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-1.5 items-center">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/email-templates/${t.id}/editor`); }}
                                        className="px-3 py-1.5 text-[0.72rem] font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-[var(--radius-sm)] cursor-pointer"
                                    >
                                        Edit ✏️
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                                        className="px-3 py-1.5 text-[0.72rem] bg-transparent text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                            <div className="text-[0.7rem] text-[var(--text-muted)] mt-2">
                                Updated {new Date(t.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
