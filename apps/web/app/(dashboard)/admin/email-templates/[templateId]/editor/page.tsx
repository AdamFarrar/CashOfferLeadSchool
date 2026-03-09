"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { useRouter, useParams } from "next/navigation";
import {
    getTemplateAction,
    saveVersionAction,
    sendTestEmailAction,
} from "@/app/actions/email-templates";
import dynamic from "next/dynamic";

// =============================================================================
// GrapesJS Email Template Editor — Phase 1.6
// =============================================================================
// Dynamic import to avoid SSR issues with GrapesJS.
// Saves editor_json + html_template + subject as new version.
// =============================================================================

type Template = { id: string; key: string; name: string };

export default function EditorPage() {
    const { data: session } = useSession();
    const { data: activeOrg } = useActiveOrganization();
    const router = useRouter();
    const params = useParams();
    const templateId = params.templateId as string;
    const userRole = activeOrg?.members?.find(
        (m: { userId: string }) => m.userId === session?.user?.id
    )?.role || "";

    const [template, setTemplate] = useState<Template | null>(null);
    const [subject, setSubject] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<string | null>(null);
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getTemplateAction(templateId).then((t) => setTemplate(t as Template));
    }, [templateId]);

    // Initialize GrapesJS
    useEffect(() => {
        if (!containerRef.current || editorRef.current) return;

        let mounted = true;

        async function initEditor() {
            const grapesjs = (await import("grapesjs")).default;
            const newsletter = (await import("grapesjs-preset-newsletter")).default;

            if (!mounted || !containerRef.current) return;

            const editor = grapesjs.init({
                container: containerRef.current,
                height: "600px",
                width: "auto",
                fromElement: false,
                storageManager: false,
                plugins: [newsletter],
                pluginsOpts: {
                    [newsletter as any]: {},
                },
            });

            editorRef.current = editor;
        }

        initEditor();

        return () => {
            mounted = false;
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    const handleSave = async () => {
        if (!editorRef.current || !subject.trim()) return;
        setSaving(true);
        setSaved(false);

        const htmlBody = editorRef.current.getHtml() + `<style>${editorRef.current.getCss()}</style>`;
        const grapesJsData = editorRef.current.getProjectData();

        await saveVersionAction({
            templateId,
            subject,
            htmlBody,
            grapesJsData,
        });

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleTestSend = async () => {
        if (!editorRef.current || !testEmail.trim()) return;
        setSending(true);
        setSendResult(null);

        const htmlBody = editorRef.current.getHtml() + `<style>${editorRef.current.getCss()}</style>`;
        const result = await sendTestEmailAction({
            to: testEmail,
            htmlBody,
            subject: subject || "Test Email",
        });

        setSendResult(result.success ? "✅ Sent!" : `❌ ${result.error}`);
        setSending(false);
    };

    if (!["owner", "admin"].includes(userRole)) {
        return <div style={{ textAlign: "center", padding: "3rem" }}><h1>Access Denied</h1></div>;
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                    <button
                        onClick={() => router.push(`/admin/email-templates/${templateId}`)}
                        style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", marginBottom: "0.5rem" }}
                    >
                        ← Back to versions
                    </button>
                    <h1 style={{ fontSize: "1.25rem" }}>
                        Edit: {template?.name || "Loading..."}
                    </h1>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {saved && <span style={{ fontSize: "0.8rem", color: "rgba(34, 197, 94, 0.9)" }}>Saved ✓</span>}
                    <button
                        onClick={handleSave}
                        disabled={saving || !subject.trim()}
                        style={{
                            padding: "0.5rem 1rem", fontSize: "0.825rem", fontWeight: 600,
                            background: "var(--brand-orange)", color: "#fff",
                            border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                            opacity: saving || !subject.trim() ? 0.5 : 1,
                        }}
                    >
                        {saving ? "Saving..." : "Save Version"}
                    </button>
                </div>
            </div>

            {/* Subject Line */}
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.25rem", display: "block" }}>
                    Email Subject
                </label>
                <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Welcome to {{app_name}}"
                    style={{
                        width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.9rem",
                        background: "var(--bg-primary)", color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                    }}
                />
            </div>

            {/* Editor */}
            <div
                ref={containerRef}
                style={{
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    marginBottom: "1rem",
                }}
            />

            {/* Test Send */}
            <div className="glass-card" style={{ padding: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Test:</span>
                <input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    style={{
                        flex: 1, padding: "0.4rem 0.6rem", fontSize: "0.825rem",
                        background: "var(--bg-primary)", color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                    }}
                />
                <button
                    onClick={handleTestSend}
                    disabled={sending || !testEmail.trim()}
                    style={{
                        padding: "0.4rem 0.75rem", fontSize: "0.8rem", fontWeight: 600,
                        background: "rgba(59, 130, 246, 0.1)", color: "rgba(59, 130, 246, 0.9)",
                        border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "var(--radius-sm)",
                        cursor: "pointer", opacity: sending ? 0.5 : 1,
                    }}
                >
                    {sending ? "Sending..." : "Send Test"}
                </button>
                {sendResult && <span style={{ fontSize: "0.8rem" }}>{sendResult}</span>}
            </div>
        </div>
    );
}
