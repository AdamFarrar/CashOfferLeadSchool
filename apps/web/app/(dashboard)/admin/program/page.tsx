"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, useActiveOrganization } from "@cols/auth/client";
import {
    listAllProgramsAction,
    createProgramAction,
    updateProgramAction,
    listProgramEpisodesAction,
    updateEpisodeAction,
} from "@/app/actions/admin-program";

// =============================================================================
// Admin Program Management — Multi-Program Support
// =============================================================================
// Two views:
// 1. Program List — all programs, create new, edit metadata
// 2. Episode Editor — episodes for a selected program (click to drill in)
// =============================================================================

type ProgramRow = {
    id: string;
    title: string;
    description: string | null;
    slug: string | null;
    status: string;
    previewImageUrl: string | null;
    cohortStartDate: string | null;
    createdAt: string;
};

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

const btnPrimary =
    "px-4 py-1.5 text-[0.8rem] font-semibold text-white border-none rounded-[var(--radius-sm)] cursor-pointer";

const btnSecondary =
    "px-3 py-1.5 text-[0.8rem] bg-transparent border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--brand-orange)] hover:text-[var(--brand-orange)] transition-colors";

export default function AdminProgramPage() {
    const { data: session } = useSession();
    const { data: activeOrg } = useActiveOrganization();
    const userRole =
        activeOrg?.members?.find(
            (m: { userId: string }) => m.userId === session?.user?.id,
        )?.role || "";

    // ── State ──
    const [programs, setPrograms] = useState<ProgramRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [view, setView] = useState<"list" | "episodes">("list");
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    // Create form
    const [showCreate, setShowCreate] = useState(false);
    const [createTitle, setCreateTitle] = useState("");
    const [createSlug, setCreateSlug] = useState("");
    const [createDesc, setCreateDesc] = useState("");
    const [createStatus, setCreateStatus] = useState<"draft" | "active">("draft");
    const [creating, setCreating] = useState(false);

    // Edit form
    const [editingProgram, setEditingProgram] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editSlug, setEditSlug] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [editPreviewUrl, setEditPreviewUrl] = useState("");
    const [saving, setSaving] = useState(false);

    // Episode state
    const [modules, setModules] = useState<Module[]>([]);
    const [episodeProgramTitle, setEpisodeProgramTitle] = useState("");
    const [editingEpisode, setEditingEpisode] = useState<string | null>(null);
    const [epTitle, setEpTitle] = useState("");
    const [epDesc, setEpDesc] = useState("");
    const [epVideo, setEpVideo] = useState("");
    const [epDuration, setEpDuration] = useState("");
    const [epTranscript, setEpTranscript] = useState("");
    const [epSaving, setEpSaving] = useState(false);

    // ── Load programs ──
    const loadPrograms = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listAllProgramsAction();
            setPrograms(data);
        } catch {
            setFeedback({ type: "err", msg: "Failed to load programs." });
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadPrograms();
    }, [loadPrograms]);

    // ── Load episodes for selected program ──
    const loadEpisodes = useCallback(async (programId: string) => {
        setLoading(true);
        try {
            const data = await listProgramEpisodesAction(programId);
            setEpisodeProgramTitle(data.program?.title ?? "Program");
            setModules(data.modules ?? []);
        } catch {
            setFeedback({ type: "err", msg: "Failed to load episodes." });
        }
        setLoading(false);
    }, []);

    // ── Handlers ──
    const handleCreate = async () => {
        if (!createTitle.trim()) return;
        setCreating(true);
        setFeedback(null);
        const result = await createProgramAction({
            title: createTitle,
            slug: createSlug || undefined,
            description: createDesc || undefined,
            status: createStatus,
        });
        setCreating(false);
        if (result.success) {
            setFeedback({ type: "ok", msg: "Program created!" });
            setShowCreate(false);
            setCreateTitle("");
            setCreateSlug("");
            setCreateDesc("");
            setCreateStatus("draft");
            loadPrograms();
        } else {
            setFeedback({ type: "err", msg: result.error ?? "Failed to create." });
        }
    };

    const startEditProgram = (p: ProgramRow) => {
        setEditingProgram(p.id);
        setEditTitle(p.title);
        setEditSlug(p.slug ?? "");
        setEditDesc(p.description ?? "");
        setEditStatus(p.status);
        setEditPreviewUrl(p.previewImageUrl ?? "");
        setFeedback(null);
    };

    const handleSaveProgram = async () => {
        if (!editingProgram) return;
        setSaving(true);
        setFeedback(null);
        const result = await updateProgramAction({
            programId: editingProgram,
            title: editTitle,
            slug: editSlug,
            description: editDesc,
            status: editStatus as "draft" | "active" | "archived",
            previewImageUrl: editPreviewUrl,
        });
        setSaving(false);
        if (result.success) {
            setFeedback({ type: "ok", msg: "Saved!" });
            setEditingProgram(null);
            loadPrograms();
        } else {
            setFeedback({ type: "err", msg: result.error ?? "Failed." });
        }
    };

    const openEpisodes = (programId: string) => {
        setSelectedProgramId(programId);
        setView("episodes");
        setEditingEpisode(null);
        loadEpisodes(programId);
    };

    const backToList = () => {
        setView("list");
        setSelectedProgramId(null);
        setFeedback(null);
    };

    const startEditEpisode = (ep: Episode) => {
        setEditingEpisode(ep.id);
        setEpTitle(ep.title);
        setEpDesc(ep.description ?? "");
        setEpVideo(ep.videoUrl ?? "");
        setEpDuration(ep.durationSeconds?.toString() ?? "");
        setEpTranscript(ep.transcript ?? "");
        setFeedback(null);
    };

    const handleSaveEpisode = async () => {
        if (!editingEpisode) return;
        setEpSaving(true);
        setFeedback(null);
        const result = await updateEpisodeAction({
            episodeId: editingEpisode,
            title: epTitle,
            description: epDesc,
            videoUrl: epVideo,
            durationSeconds: epDuration ? parseInt(epDuration, 10) : null,
            transcript: epTranscript,
        });
        setEpSaving(false);
        if (result.success) {
            setFeedback({ type: "ok", msg: "Episode saved!" });
            setEditingEpisode(null);
            if (selectedProgramId) loadEpisodes(selectedProgramId);
        } else {
            setFeedback({ type: "err", msg: result.error ?? "Failed." });
        }
    };

    // ── Access check ──
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
                Loading...
            </div>
        );
    }

    // ── Feedback banner ──
    const feedbackBanner = feedback && (
        <div
            className={`glass-card p-3 mb-4 text-sm ${
                feedback.type === "ok"
                    ? "border border-green-500/30 text-green-400"
                    : "border border-red-500/30 text-red-400"
            }`}
            style={{ animation: "fadeIn 0.2s ease" }}
        >
            {feedback.msg}
        </div>
    );

    // ═══════════════════════════════════════════════════════════════════
    // VIEW: Episode Editor
    // ═══════════════════════════════════════════════════════════════════
    if (view === "episodes") {
        return (
            <div>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <button onClick={backToList} className={btnSecondary} style={{ marginBottom: "0.5rem" }}>
                            ← All Programs
                        </button>
                        <h1 className="text-2xl mb-1">Episode Management</h1>
                        <p className="text-[0.8rem] text-[var(--text-muted)]">
                            {episodeProgramTitle} · {modules.reduce((acc, m) => acc + m.episodes.length, 0)} episodes
                        </p>
                    </div>
                </div>

                {feedbackBanner}

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
                                    {editingEpisode === ep.id ? (
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <label className="text-xs text-[var(--text-muted)] block mb-1">Title</label>
                                                <input className={inputCls} value={epTitle} onChange={(e) => setEpTitle(e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-[var(--text-muted)] block mb-1">Description</label>
                                                <textarea className={`${inputCls} min-h-[60px] resize-y`} value={epDesc} onChange={(e) => setEpDesc(e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-[var(--text-muted)] block mb-1">Video URL</label>
                                                    <input className={inputCls} value={epVideo} onChange={(e) => setEpVideo(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-[var(--text-muted)] block mb-1">Duration (seconds)</label>
                                                    <input className={inputCls} type="number" value={epDuration} onChange={(e) => setEpDuration(e.target.value)} placeholder="720" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-[var(--text-muted)] block mb-1">Transcript</label>
                                                <textarea className={`${inputCls} min-h-[120px] resize-y`} value={epTranscript} onChange={(e) => setEpTranscript(e.target.value)} placeholder="Full episode transcript..." />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => { setEditingEpisode(null); setFeedback(null); }} className={btnSecondary}>Cancel</button>
                                                <button onClick={handleSaveEpisode} disabled={epSaving} className={btnPrimary} style={{ background: "var(--brand-orange)", opacity: epSaving ? 0.6 : 1 }}>
                                                    {epSaving ? "Saving..." : "Save Changes"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-[0.9rem]">{ep.title}</span>
                                                    <span className="text-[0.65rem] px-1.5 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)]">
                                                        Week {ep.unlockWeek + 1}
                                                    </span>
                                                </div>
                                                <div className="text-[0.75rem] text-[var(--text-muted)] flex flex-wrap gap-3 mt-1">
                                                    <span>🎬 {ep.videoUrl ? truncateUrl(ep.videoUrl) : "No video"}</span>
                                                    <span>⏱ {ep.durationSeconds ? `${Math.ceil(ep.durationSeconds / 60)} min` : "—"}</span>
                                                    <span>📜 {ep.transcript ? `${ep.transcript.length.toLocaleString()} chars` : "No transcript"}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => startEditEpisode(ep)} className={btnSecondary}>✏️ Edit</button>
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

    // ═══════════════════════════════════════════════════════════════════
    // VIEW: Program List
    // ═══════════════════════════════════════════════════════════════════
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl mb-1">Program Management</h1>
                    <p className="text-[0.8rem] text-[var(--text-muted)]">
                        {programs.length} program{programs.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={() => { setShowCreate(!showCreate); setFeedback(null); }}
                    className={btnPrimary}
                    style={{ background: "var(--brand-orange)" }}
                >
                    + New Program
                </button>
            </div>

            {feedbackBanner}

            {/* ── Create Form ── */}
            {showCreate && (
                <div className="glass-card p-5 mb-6" style={{ animation: "fadeIn 0.2s ease" }}>
                    <h2 className="text-base font-semibold mb-4">Create New Program</h2>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="text-xs text-[var(--text-muted)] block mb-1">Title *</label>
                            <input className={inputCls} value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="Season 2: Advanced Strategies" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-[var(--text-muted)] block mb-1">Slug (URL path)</label>
                                <input className={inputCls} value={createSlug} onChange={(e) => setCreateSlug(e.target.value)} placeholder="season-2" />
                            </div>
                            <div>
                                <label className="text-xs text-[var(--text-muted)] block mb-1">Status</label>
                                <select className={inputCls} value={createStatus} onChange={(e) => setCreateStatus(e.target.value as "draft" | "active")}>
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-[var(--text-muted)] block mb-1">Description</label>
                            <textarea className={`${inputCls} min-h-[60px] resize-y`} value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} placeholder="Program description..." />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowCreate(false)} className={btnSecondary}>Cancel</button>
                            <button onClick={handleCreate} disabled={creating || !createTitle.trim()} className={btnPrimary} style={{ background: "var(--brand-orange)", opacity: creating || !createTitle.trim() ? 0.6 : 1 }}>
                                {creating ? "Creating..." : "Create Program"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Program Cards ── */}
            {programs.length === 0 && !showCreate ? (
                <div className="text-center py-12 text-[var(--text-muted)]">
                    <div className="text-3xl mb-3">📚</div>
                    <p>No programs yet. Click &quot;New Program&quot; to create one.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {programs.map((prog) => (
                        <div key={prog.id} className="glass-card p-5">
                            {editingProgram === prog.id ? (
                                /* ── Edit Mode ── */
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-[var(--text-muted)] block mb-1">Title</label>
                                            <input className={inputCls} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-[var(--text-muted)] block mb-1">Slug</label>
                                            <input className={inputCls} value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-[var(--text-muted)] block mb-1">Status</label>
                                            <select className={inputCls} value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                                                <option value="draft">Draft</option>
                                                <option value="active">Active</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-[var(--text-muted)] block mb-1">Preview Image URL</label>
                                            <input className={inputCls} value={editPreviewUrl} onChange={(e) => setEditPreviewUrl(e.target.value)} placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--text-muted)] block mb-1">Description</label>
                                        <textarea className={`${inputCls} min-h-[60px] resize-y`} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => { setEditingProgram(null); setFeedback(null); }} className={btnSecondary}>Cancel</button>
                                        <button onClick={handleSaveProgram} disabled={saving} className={btnPrimary} style={{ background: "var(--brand-orange)", opacity: saving ? 0.6 : 1 }}>
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ── View Mode ── */
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-lg">{prog.title}</span>
                                            <span className={`text-[0.65rem] px-1.5 py-0.5 rounded-full ${
                                                prog.status === "active"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : prog.status === "archived"
                                                    ? "bg-red-500/20 text-red-400"
                                                    : "bg-[var(--surface-raised)] text-[var(--text-muted)]"
                                            }`}>
                                                {prog.status}
                                            </span>
                                        </div>
                                        {prog.description && (
                                            <p className="text-[0.8rem] text-[var(--text-secondary)] mb-2 line-clamp-2">
                                                {prog.description}
                                            </p>
                                        )}
                                        <div className="text-[0.7rem] text-[var(--text-muted)] flex flex-wrap gap-3">
                                            {prog.slug && <span>🔗 /{prog.slug}</span>}
                                            <span>📅 {new Date(prog.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => openEpisodes(prog.id)} className={btnSecondary}>
                                            📚 Episodes
                                        </button>
                                        <button onClick={() => startEditProgram(prog)} className={btnSecondary}>
                                            ✏️ Edit
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function truncateUrl(url: string): string {
    if (url.length <= 40) return url;
    return url.substring(0, 37) + "...";
}
