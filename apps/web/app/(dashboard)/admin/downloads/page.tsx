"use client";

// =============================================================================
// Admin Downloads Manager — Phase H (Product Hardening)
// =============================================================================
// Upload, list, and delete downloadable assets.
// Assets are associated with episodes via the existing episode_asset table.
// =============================================================================

import { useState, useEffect, useTransition } from "react";
import {
    listAssetsAction,
    getEpisodesForFormAction,
    createAssetAction,
    deleteAssetAction,
} from "@/app/actions/admin-downloads";
import { EmptyState } from "@/app/components/ui/EmptyState";

type Asset = {
    id: string;
    title: string;
    fileUrl: string;
    fileType: string | null;
    episodeId: string;
    episodeTitle: string | null;
    moduleTitle: string | null;
    createdAt: Date;
};

type EpisodeOption = {
    id: string;
    title: string;
    moduleTitle: string | null;
    orderIndex: number;
    moduleOrderIndex: number | null;
};

export default function AdminDownloadsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [episodes, setEpisodes] = useState<EpisodeOption[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [title, setTitle] = useState("");
    const [episodeId, setEpisodeId] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [fileType, setFileType] = useState("PDF");
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        startTransition(async () => {
            const [assetsResult, episodesResult] = await Promise.all([
                listAssetsAction(),
                getEpisodesForFormAction(),
            ]);
            if (assetsResult.success) setAssets(assetsResult.assets as Asset[]);
            if (episodesResult.success) setEpisodes(episodesResult.episodes as EpisodeOption[]);
        });
    }

    function handleCreate() {
        setError("");
        if (!title.trim()) { setError("Title is required."); return; }
        if (!episodeId) { setError("Select an episode."); return; }
        if (!fileUrl.trim()) { setError("File URL is required."); return; }

        startTransition(async () => {
            const result = await createAssetAction({
                episodeId,
                title: title.trim(),
                fileUrl: fileUrl.trim(),
                fileType: fileType.trim() || "PDF",
            });
            if (result.success) {
                setTitle("");
                setEpisodeId("");
                setFileUrl("");
                setFileType("PDF");
                setShowForm(false);
                loadData();
            } else {
                setError(result.error || "Failed to create asset.");
            }
        });
    }

    function handleDelete(id: string) {
        if (!confirm("Delete this asset?")) return;
        startTransition(async () => {
            await deleteAssetAction(id);
            loadData();
        });
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Downloads Manager</h1>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
                        Upload and manage downloadable assets for episodes.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="program-hero-cta"
                    style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
                >
                    {showForm ? "Cancel" : "+ Add Asset"}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div style={{
                    padding: "1.5rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    marginBottom: "1.5rem",
                }}>
                    <div style={{ display: "grid", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Title *
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Lead Follow-Up Script"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Episode *
                            </label>
                            <select
                                value={episodeId}
                                onChange={(e) => setEpisodeId(e.target.value)}
                                className="select-field"
                            >
                                <option value="">Select episode...</option>
                                {episodes.map((ep) => (
                                    <option key={ep.id} value={ep.id}>
                                        {ep.moduleTitle ? `${ep.moduleTitle} → ` : ""}{ep.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                File URL *
                            </label>
                            <input
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                                placeholder="https://storage.example.com/file.pdf"
                                className="input-field"
                            />
                            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>
                                Upload the file to Supabase Storage and paste the public URL here.
                            </p>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                File Type
                            </label>
                            <select
                                value={fileType}
                                onChange={(e) => setFileType(e.target.value)}
                                className="select-field"
                            >
                                <option value="PDF">PDF</option>
                                <option value="Doc">Document</option>
                                <option value="Sheet">Spreadsheet</option>
                                <option value="Script">Script</option>
                                <option value="Checklist">Checklist</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div style={{ marginTop: "1rem", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "0.8rem" }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                        <button onClick={() => setShowForm(false)} className="btn-ghost" style={{ fontSize: "0.8rem" }}>Cancel</button>
                        <button onClick={handleCreate} disabled={isPending} className="btn-primary" style={{ fontSize: "0.8rem" }}>
                            {isPending ? "Creating..." : "Create Asset"}
                        </button>
                    </div>
                </div>
            )}

            {/* Assets List */}
            {assets.length === 0 ? (
                <EmptyState
                    icon="📥"
                    title="No Assets Uploaded Yet"
                    description="Upload downloadable materials for your episodes — scripts, checklists, SOPs, and templates. Students will see these in their Downloads page and on individual episode pages."
                />
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {assets.map((asset) => (
                        <div
                            key={asset.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.75rem 1rem",
                                background: "var(--bg-secondary)",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border-subtle)",
                            }}
                        >
                            <span style={{ fontSize: "1.25rem" }}>📄</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                    {asset.title}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                    {asset.moduleTitle && `${asset.moduleTitle} → `}{asset.episodeTitle || "Unknown Episode"}
                                    {asset.fileType && ` · ${asset.fileType}`}
                                </div>
                            </div>
                            <a
                                href={asset.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: "0.75rem", color: "var(--brand-orange)", textDecoration: "none", fontWeight: 600 }}
                            >
                                Open ↗
                            </a>
                            <button
                                onClick={() => handleDelete(asset.id)}
                                disabled={isPending}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    padding: "0.25rem",
                                }}
                                aria-label="Delete asset"
                            >
                                🗑
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
