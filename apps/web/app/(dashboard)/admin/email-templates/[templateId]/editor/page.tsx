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
        return <div className="text-center p-12"><h1>Access Denied</h1></div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <button
                        onClick={() => router.push(`/admin/email-templates/${templateId}`)}
                        className="text-[0.8rem] text-[var(--text-muted)] bg-none border-none cursor-pointer mb-2"
                    >
                        ← Back to versions
                    </button>
                    <h1 className="text-xl">
                        Edit: {template?.name || "Loading..."}
                    </h1>
                </div>
                <div className="flex gap-2 items-center">
                    {saved && <span className="text-[0.8rem] text-green-500">Saved ✓</span>}
                    <button
                        onClick={handleSave}
                        disabled={saving || !subject.trim()}
                        className={`px-4 py-2 text-[0.825rem] font-semibold text-white border-none rounded-[var(--radius-sm)] cursor-pointer ${saving || !subject.trim() ? "opacity-50" : ""}`}
                        style={{ background: "var(--brand-orange)" }}
                    >
                        {saving ? "Saving..." : "Save Version"}
                    </button>
                </div>
            </div>

            {/* Subject Line */}
            <div className="mb-4">
                <label className="text-[0.8rem] font-semibold text-[var(--text-secondary)] mb-1 block">
                    Email Subject
                </label>
                <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Welcome to {{app_name}}"
                    className="w-full px-3 py-2 text-[0.9rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)]"
                />
            </div>

            {/* Editor — container needs border styling */}
            <div
                ref={containerRef}
                className="border border-[var(--border-subtle)] rounded-[var(--radius-sm)] overflow-hidden mb-4"
            />

            {/* Test Send */}
            <div className="glass-card p-4 flex gap-2 items-center">
                <span className="text-[0.8rem] font-semibold text-[var(--text-secondary)]">Test:</span>
                <input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="flex-1 px-2.5 py-1.5 text-[0.825rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)]"
                />
                <button
                    onClick={handleTestSend}
                    disabled={sending || !testEmail.trim()}
                    className={`px-3 py-1.5 text-[0.8rem] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-[var(--radius-sm)] cursor-pointer ${sending ? "opacity-50" : ""}`}
                >
                    {sending ? "Sending..." : "Send Test"}
                </button>
                {sendResult && <span className="text-[0.8rem]">{sendResult}</span>}
            </div>
        </div>
    );
}
