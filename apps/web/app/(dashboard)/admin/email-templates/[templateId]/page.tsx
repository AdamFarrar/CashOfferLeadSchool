"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { useRouter, useParams } from "next/navigation";
import {
    getTemplateAction,
    listVersionsAction,
    publishVersionAction,
    rollbackVersionAction,
    previewTemplateAction,
} from "@/app/actions/email-templates";

// =============================================================================
// Template Detail — Version History + Publish/Rollback
// =============================================================================

type Version = {
    id: string;
    version: number;
    subject: string;
    published: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    createdBy: string | null;
    htmlBody: string;
};

type Template = {
    id: string;
    key: string;
    name: string;
    description: string | null;
};

export default function TemplateDetailPage() {
    const { data: session } = useSession();
    const { data: activeOrg } = useActiveOrganization();
    const router = useRouter();
    const params = useParams();
    const templateId = params.templateId as string;
    const userRole = activeOrg?.members?.find(
        (m: { userId: string }) => m.userId === session?.user?.id
    )?.role || "";

    const [template, setTemplate] = useState<Template | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const [t, v] = await Promise.all([
            getTemplateAction(templateId),
            listVersionsAction(templateId),
        ]);
        setTemplate(t as Template);
        setVersions(v as Version[]);
        setLoading(false);
    }, [templateId]);

    useEffect(() => { load(); }, [load]);

    const handlePublish = async (versionId: string) => {
        await publishVersionAction(templateId, versionId);
        load();
    };

    const handleRollback = async (versionId: string) => {
        if (!confirm("Rollback to this version? The current published version will be unpublished.")) return;
        await rollbackVersionAction(templateId, versionId);
        load();
    };

    const handlePreview = async (htmlBody: string, subject: string) => {
        const result = await previewTemplateAction({ htmlBody, subject });
        setPreviewHtml(result.html);
    };

    if (!["owner", "admin"].includes(userRole)) {
        return <div style={{ textAlign: "center", padding: "3rem" }}><h1>Access Denied</h1></div>;
    }

    if (loading) {
        return <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <button
                        onClick={() => router.push("/admin/email-templates")}
                        style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", marginBottom: "0.5rem" }}
                    >
                        ← Back to templates
                    </button>
                    <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{template?.name}</h1>
                    <code style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{template?.key}</code>
                    {template?.description && (
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{template.description}</p>
                    )}
                </div>
                <button
                    onClick={() => router.push(`/admin/email-templates/${templateId}/editor`)}
                    style={{
                        padding: "0.5rem 1rem", fontSize: "0.825rem", fontWeight: 600,
                        background: "var(--brand-orange)", color: "#fff",
                        border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                    }}
                >
                    Open Editor
                </button>
            </div>

            {/* Preview Modal */}
            {previewHtml && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setPreviewHtml(null)}>
                    <div style={{ background: "#fff", borderRadius: "8px", width: "640px", maxHeight: "80vh", overflow: "auto", padding: "1rem" }}
                        onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <strong>Preview</strong>
                            <button onClick={() => setPreviewHtml(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                </div>
            )}

            {/* Versions */}
            <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Version History ({versions.length})</h2>

            {versions.length === 0 ? (
                <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No versions yet. Open the editor to create one.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {versions.map((v) => (
                        <div key={v.id} className="glass-card" style={{ padding: "1.25rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>v{v.version}</span>
                                        {v.published && (
                                            <span style={{
                                                fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                                                padding: "0.1rem 0.4rem", borderRadius: "var(--radius-full)",
                                                background: "rgba(34, 197, 94, 0.15)", color: "rgba(34, 197, 94, 0.9)",
                                            }}>
                                                PUBLISHED
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                        Subject: {v.subject}
                                    </div>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                        Created {new Date(v.createdAt).toLocaleString()}
                                        {v.publishedAt && ` · Published ${new Date(v.publishedAt).toLocaleString()}`}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "0.375rem" }}>
                                    <button
                                        onClick={() => handlePreview(v.htmlBody, v.subject)}
                                        style={{
                                            padding: "0.35rem 0.6rem", fontSize: "0.72rem",
                                            background: "transparent", border: "1px solid var(--border-subtle)",
                                            borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", cursor: "pointer",
                                        }}
                                    >
                                        👁 Preview
                                    </button>
                                    {!v.published && (
                                        <button
                                            onClick={() => handlePublish(v.id)}
                                            style={{
                                                padding: "0.35rem 0.6rem", fontSize: "0.72rem", fontWeight: 600,
                                                background: "rgba(34, 197, 94, 0.1)", color: "rgba(34, 197, 94, 0.9)",
                                                border: "1px solid rgba(34, 197, 94, 0.2)", borderRadius: "var(--radius-sm)", cursor: "pointer",
                                            }}
                                        >
                                            Publish
                                        </button>
                                    )}
                                    {v.published ? null : (
                                        <button
                                            onClick={() => handleRollback(v.id)}
                                            style={{
                                                padding: "0.35rem 0.6rem", fontSize: "0.72rem",
                                                background: "rgba(234, 179, 8, 0.1)", color: "rgba(234, 179, 8, 0.9)",
                                                border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "var(--radius-sm)", cursor: "pointer",
                                            }}
                                        >
                                            Rollback
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
