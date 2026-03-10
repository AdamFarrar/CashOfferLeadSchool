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
        return <div className="text-center p-12"><h1>Access Denied</h1></div>;
    }

    if (loading) {
        return <div className="text-center p-12 text-[var(--text-muted)]">Loading...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <button
                        onClick={() => router.push("/admin/email-templates")}
                        className="text-[0.8rem] text-[var(--text-muted)] bg-none border-none cursor-pointer mb-2"
                    >
                        ← Back to templates
                    </button>
                    <h1 className="text-2xl mb-1">{template?.name}</h1>
                    <code className="text-xs text-[var(--text-muted)]">{template?.key}</code>
                    {template?.description && (
                        <p className="text-[0.8rem] text-[var(--text-secondary)] mt-1">{template.description}</p>
                    )}
                </div>
                <button
                    onClick={() => router.push(`/admin/email-templates/${templateId}/editor`)}
                    className="px-4 py-2 text-[0.825rem] font-semibold text-white border-none rounded-[var(--radius-sm)] cursor-pointer"
                    style={{ background: "var(--brand-orange)" }}
                >
                    Open Editor
                </button>
            </div>

            {/* Preview Modal — uses inline styles for fixed overlay positioning (whitelisted) */}
            {previewHtml && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.7)" }}
                    onClick={() => setPreviewHtml(null)}
                >
                    <div
                        className="bg-white rounded-lg w-[640px] max-h-[80vh] overflow-auto p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between mb-4">
                            <strong>Preview</strong>
                            <button onClick={() => setPreviewHtml(null)} className="bg-none border-none cursor-pointer text-xl">✕</button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                </div>
            )}

            {/* Versions */}
            <h2 className="text-base mb-4">Version History ({versions.length})</h2>

            {versions.length === 0 ? (
                <div className="glass-card p-8 text-center text-[var(--text-muted)]">
                    No versions yet. Open the editor to create one.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {versions.map((v) => (
                        <div key={v.id} className="glass-card p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-[0.9rem]">v{v.version}</span>
                                        {v.published && (
                                            <span className="text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-500">
                                                PUBLISHED
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[0.8rem] text-[var(--text-secondary)]">
                                        Subject: {v.subject}
                                    </div>
                                    <div className="text-[0.7rem] text-[var(--text-muted)] mt-1">
                                        Created {new Date(v.createdAt).toLocaleString()}
                                        {v.publishedAt && ` · Published ${new Date(v.publishedAt).toLocaleString()}`}
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => handlePreview(v.htmlBody, v.subject)}
                                        className="px-2.5 py-1.5 text-[0.72rem] bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] cursor-pointer"
                                    >
                                        👁 Preview
                                    </button>
                                    {!v.published && (
                                        <button
                                            onClick={() => handlePublish(v.id)}
                                            className="px-2.5 py-1.5 text-[0.72rem] font-semibold bg-green-500/10 text-green-500 border border-green-500/20 rounded-[var(--radius-sm)] cursor-pointer"
                                        >
                                            Publish
                                        </button>
                                    )}
                                    {v.published ? null : (
                                        <button
                                            onClick={() => handleRollback(v.id)}
                                            className="px-2.5 py-1.5 text-[0.72rem] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-[var(--radius-sm)] cursor-pointer"
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
