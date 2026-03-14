"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, useActiveOrganization } from "@cols/auth/client";
import {
    listProgramEpisodesAction,
    updateEpisodeAction,
} from "@/app/actions/admin-program";

// =============================================================================
// Admin Program Management — Episode Metadata Editor
// =============================================================================

type Episode = {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    durationSeconds: number | null;
    orderIndex: number;
    unlockWeek: number;
    transcript: string | null;
};

type Module = {
    id: string;
    title: string;
    orderIndex: number;
    episodes: Episode[];
};

const inputCls =
    "w-full px-3 py-2 text-[0.825rem] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-orange)] transition-colors";

export default function AdminProgramPage() {
    const { data: session } = useSession();
    const { data: activeOrg } = useActiveOrganization();
    const userRole =
        activeOrg?.members?.find(
            (m: { userId: string }) => m.userId === session?.user?.id,
        )?.role || "";

    const [modules, setModules] = useState<Module[]>([]);
    const [programTitle, setProgramTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editVideoUrl, setEditVideoUrl] = useState("");
    const [editDuration, setEditDuration] = useState("");
    const [editTranscript, setEditTranscript] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const result = await listProgramEpisodesAction();
        setProgramTitle(result.program?.title ?? "No active program");
        setModules(result.modules ?? []);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const startEdit = (ep: Episode) => {
        setEditing(ep.id);
        setEditTitle(ep.title);
        setEditDescription(ep.description ?? "");
        setEditVideoUrl(ep.videoUrl ?? "");
        setEditDuration(ep.durationSeconds?.toString() ?? "");
        setEditTranscript(ep.transcript ?? "");
        setSaveMsg(null);
    };

    const cancelEdit = () => {
        setEditing(null);
        setSaveMsg(null);
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        setSaveMsg(null);

        const result = await updateEpisodeAction({
            episodeId: editing,
            title: editTitle,
            description: editDescription,
            videoUrl: editVideoUrl,
            durationSeconds: editDuration ? parseInt(editDuration, 10) : null,
            transcript: editTranscript,
        });

        setSaving(false);

        if (result.success) {
            setSaveMsg("Saved!");
            setEditing(null);
            load();
        } else {
            setSaveMsg(result.error ?? "Failed to save");
        }
    };

    if (!["owner", "admin"].includes(userRole)) {
        return (
            <div className="text-center p-12">
                <h1>Access Denied</h1>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center p-12 text-[var(--text-muted)]">
                Loading program data...
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl mb-1">Program Management</h1>
                    <p className="text-[0.8rem] text-[var(--text-muted)]">
                        {programTitle} · {modules.reduce((acc, m) => acc + m.episodes.length, 0)} episodes
                    </p>
                </div>
            </div>

            {/* Save Feedback */}
            {saveMsg && (
                <div
                    className={`glass-card p-3 mb-4 text-sm ${
                        saveMsg === "Saved!"
                            ? "border border-green-500/30 text-green-400"
                            : "border border-red-500/30 text-red-400"
                    }`}
                    style={{ animation: "fadeIn 0.2s ease" }}
                >
                    {saveMsg}
                </div>
            )}

            {/* Modules + Episodes */}
            {modules.map((mod) => (
                <div key={mod.id} className="mb-8">
                    <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <span className="text-[color:var(--brand-orange)]">
                            Module {mod.orderIndex + 1}
                        </span>
                        <span className="text-[color:var(--text-muted)]">—</span>
                        <span>{mod.title}</span>
                    </h2>

                    <div className="flex flex-col gap-3">
                        {mod.episodes.map((ep) => (
                            <div key={ep.id} className="glass-card p-5">
                                {editing === ep.id ? (
                                    /* ── Edit Mode ── */
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <label className="text-xs text-[var(--text-muted)] block mb-1">
                                                Title
                                            </label>
                                            <input
                                                className={inputCls}
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-[var(--text-muted)] block mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                className={`${inputCls} min-h-[60px] resize-y`}
                                                value={editDescription}
                                                onChange={(e) =>
                                                    setEditDescription(e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-[var(--text-muted)] block mb-1">
                                                    Video URL
                                                </label>
                                                <input
                                                    className={inputCls}
                                                    value={editVideoUrl}
                                                    onChange={(e) =>
                                                        setEditVideoUrl(e.target.value)
                                                    }
                                                    placeholder="https://youtube.com/watch?v=..."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-[var(--text-muted)] block mb-1">
                                                    Duration (seconds)
                                                </label>
                                                <input
                                                    className={inputCls}
                                                    type="number"
                                                    value={editDuration}
                                                    onChange={(e) =>
                                                        setEditDuration(e.target.value)
                                                    }
                                                    placeholder="720"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-[var(--text-muted)] block mb-1">
                                                Transcript
                                            </label>
                                            <textarea
                                                className={`${inputCls} min-h-[120px] resize-y`}
                                                value={editTranscript}
                                                onChange={(e) =>
                                                    setEditTranscript(e.target.value)
                                                }
                                                placeholder="Full episode transcript..."
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={cancelEdit}
                                                className="px-3 py-1.5 text-[0.8rem] bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="px-4 py-1.5 text-[0.8rem] font-semibold text-white border-none rounded-[var(--radius-sm)] cursor-pointer"
                                                style={{
                                                    background: "var(--brand-orange)",
                                                    opacity: saving ? 0.6 : 1,
                                                }}
                                            >
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── View Mode ── */
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-[0.9rem]">
                                                    {ep.title}
                                                </span>
                                                <span className="text-[0.65rem] px-1.5 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)]">
                                                    Week {ep.unlockWeek + 1}
                                                </span>
                                            </div>
                                            <div className="text-[0.75rem] text-[var(--text-muted)] flex flex-wrap gap-3 mt-1">
                                                <span>
                                                    🎬{" "}
                                                    {ep.videoUrl
                                                        ? truncateUrl(ep.videoUrl)
                                                        : "No video"}
                                                </span>
                                                <span>
                                                    ⏱{" "}
                                                    {ep.durationSeconds
                                                        ? `${Math.ceil(ep.durationSeconds / 60)} min`
                                                        : "—"}
                                                </span>
                                                <span>
                                                    📜{" "}
                                                    {ep.transcript
                                                        ? `${ep.transcript.length.toLocaleString()} chars`
                                                        : "No transcript"}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => startEdit(ep)}
                                            className="shrink-0 px-3 py-1.5 text-[0.75rem] font-semibold bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--brand-orange)] hover:text-[var(--brand-orange)] transition-colors"
                                        >
                                            ✏️ Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function truncateUrl(url: string): string {
    if (url.length <= 40) return url;
    return url.substring(0, 37) + "...";
}
