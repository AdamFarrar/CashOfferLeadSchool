"use client";

// =============================================================================
// Admin Intelligence Panel — Phase 5 + Phase 6
// =============================================================================
// Admin-only panel for:
// - Generating takeaways, reflections, best moments per episode
// - Generating cohort signals
// - Creating operator highlights
// - Bulk generating insights for all episodes
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@cocs/auth/client";
import {
    generateTakeawaysAction,
    generateBestMomentsAction,
    generateCohortSignalsAction,
    generateReflectionAction,
    createOperatorHighlightAction,
    getEpisodeListForAdmin,
    bulkGenerateInsightsAction,
} from "@/app/actions/ai";
import { getDashboardProgress } from "@/app/actions/program";

interface EpisodeOption {
    id: string;
    title: string;
    moduleTitle: string;
    hasTranscript: boolean;
}

export default function AdminIntelligencePage() {
    const { data: session } = useSession();
    const [programId, setProgramId] = useState<string | null>(null);
    const [episodes, setEpisodes] = useState<EpisodeOption[]>([]);
    const [selectedEpisode, setSelectedEpisode] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [bulkProgress, setBulkProgress] = useState<string | null>(null);

    // Highlight creation state
    const [hlTitle, setHlTitle] = useState("");
    const [hlBody, setHlBody] = useState("");
    const [hlTimestamp, setHlTimestamp] = useState("");

    useEffect(() => {
        getDashboardProgress().then((data) => {
            if (data) setProgramId(data.programId);
        });
        getEpisodeListForAdmin().then((result) => {
            if (result.success) setEpisodes(result.episodes);
        });
    }, []);

    const handleGenerateTakeaways = useCallback(async () => {
        if (!selectedEpisode) return setStatus("Select an episode first.");
        setLoading(true);
        setStatus("Generating takeaways...");
        const result = await generateTakeawaysAction(selectedEpisode);
        setLoading(false);
        if (result.success) {
            const data = result.data as { takeaways?: string[] };
            setStatus(`✅ Takeaways generated (${data?.takeaways?.length ?? 0} items)${result.cached ? " (cached)" : ""}`);
        } else {
            setStatus(`❌ ${result.error}`);
        }
    }, [selectedEpisode]);

    const handleGenerateReflection = useCallback(async () => {
        if (!selectedEpisode) return setStatus("Select an episode first.");
        setLoading(true);
        setStatus("Generating reflection prompts...");
        const result = await generateReflectionAction(selectedEpisode);
        setLoading(false);
        if (result.success) {
            const data = result.data as { prompts?: string[] };
            setStatus(`✅ Reflections generated (${data?.prompts?.length ?? 0} prompts)${result.cached ? " (cached)" : ""}`);
        } else {
            setStatus(`❌ ${result.error}`);
        }
    }, [selectedEpisode]);

    const handleGenerateBestMoments = useCallback(async () => {
        if (!selectedEpisode) return setStatus("Select an episode first.");
        setLoading(true);
        setStatus("Generating best moments...");
        const result = await generateBestMomentsAction(selectedEpisode);
        setLoading(false);
        if (result.success) {
            const data = result.data as { moments?: unknown[] };
            setStatus(`✅ Best moments generated (${data?.moments?.length ?? 0} moments)${result.cached ? " (cached)" : ""}`);
        } else {
            setStatus(`❌ ${result.error}`);
        }
    }, [selectedEpisode]);

    const handleGenerateCohortSignals = useCallback(async () => {
        if (!programId) return setStatus("No program found.");
        setLoading(true);
        setStatus("Generating cohort signals...");
        const result = await generateCohortSignalsAction(programId);
        setLoading(false);
        if (result.success) {
            const data = result.data as { signals?: unknown[] };
            setStatus(`✅ Cohort signals generated (${data?.signals?.length ?? 0} signals)${result.cached ? " (cached)" : ""}`);
        } else {
            setStatus(`❌ ${result.error}`);
        }
    }, [programId]);

    const handleBulkGenerate = useCallback(async () => {
        setLoading(true);
        setBulkProgress("Starting bulk generation...");
        setStatus(null);
        const result = await bulkGenerateInsightsAction();
        setLoading(false);
        if (result.success) {
            const generated = result.results.filter((r) => r.takeaways === "generated" || r.reflections === "generated").length;
            const cached = result.results.filter((r) => r.takeaways === "cached" && r.reflections === "cached").length;
            const errors = result.results.filter((r) => r.takeaways === "error" || r.reflections === "error").length;
            setBulkProgress(null);
            setStatus(`✅ Bulk complete: ${generated} generated, ${cached} cached, ${errors} errors across ${result.results.length} episodes`);
        } else {
            setBulkProgress(null);
            setStatus("❌ Bulk generation failed");
        }
    }, []);

    const handleCreateHighlight = useCallback(async () => {
        if (!selectedEpisode) return setStatus("Select an episode first.");
        if (!hlTitle.trim()) return setStatus("Title is required.");
        if (!hlBody.trim()) return setStatus("Body is required.");
        setLoading(true);
        setStatus("Creating highlight...");
        const result = await createOperatorHighlightAction({
            episodeId: selectedEpisode,
            title: hlTitle.trim(),
            body: hlBody.trim(),
            timestampSeconds: hlTimestamp ? parseInt(hlTimestamp, 10) : undefined,
        });
        setLoading(false);
        if (result.success) {
            setStatus("✅ Highlight created.");
            setHlTitle("");
            setHlBody("");
            setHlTimestamp("");
        } else {
            setStatus(`❌ ${result.error}`);
        }
    }, [selectedEpisode, hlTitle, hlBody, hlTimestamp]);

    if (!session) return <div>Loading...</div>;

    const selectedEp = episodes.find((e) => e.id === selectedEpisode);

    return (
        <div style={{ maxWidth: "42rem" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                🧠 Learning Intelligence
            </h1>

            {status && (
                <div style={{
                    padding: "0.75rem 1rem",
                    marginBottom: "1.5rem",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${status.startsWith("✅") ? "rgba(34,197,94,0.3)" : status.startsWith("❌") ? "rgba(239,68,68,0.3)" : "var(--border-subtle)"}`,
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    background: status.startsWith("✅") ? "rgba(34,197,94,0.04)" : status.startsWith("❌") ? "rgba(239,68,68,0.04)" : "transparent",
                }}>
                    {status}
                </div>
            )}

            {bulkProgress && (
                <div style={{
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    background: "rgba(59,130,246,0.04)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                }}>
                    ⏳ {bulkProgress}
                </div>
            )}

            {/* Bulk Generate All */}
            <div style={{
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(227, 38, 82, 0.2)",
                background: "rgba(227, 38, 82, 0.02)",
                marginBottom: "1.5rem",
            }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    🚀 Bulk Generate — All Episodes
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 0.75rem" }}>
                    Generates takeaways + reflections for all {episodes.length} episodes. Previously cached insights are skipped.
                    This calls OpenAI and may take a few minutes.
                </p>
                <button
                    onClick={handleBulkGenerate}
                    disabled={loading || episodes.length === 0}
                    className="episode-action-btn"
                    style={{ fontSize: "0.75rem" }}
                >
                    {loading ? "Processing..." : `Generate All (${episodes.length} episodes)`}
                </button>
            </div>

            {/* Episode Picker */}
            <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
                    Episode
                </label>
                <select
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(e.target.value)}
                    style={{
                        width: "100%",
                        marginTop: "0.35rem",
                        padding: "0.6rem 0.75rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-subtle)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "0.8rem",
                    }}
                >
                    <option value="">Select an episode...</option>
                    {episodes.map((ep) => (
                        <option key={ep.id} value={ep.id}>
                            {ep.moduleTitle} → {ep.title} {ep.hasTranscript ? "✓" : "(no transcript)"}
                        </option>
                    ))}
                </select>
                {selectedEp && (
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem", fontFamily: "var(--font-mono, monospace)" }}>
                        {selectedEp.id}
                    </div>
                )}
            </div>

            {/* Per-Episode Actions */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1rem",
            }}>
                <div style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        💡 Takeaways
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0 0 0.75rem" }}>
                        Extract 3–5 key takeaways from the transcript.
                    </p>
                    <button
                        onClick={handleGenerateTakeaways}
                        disabled={loading || !selectedEpisode}
                        className="episode-action-btn"
                        style={{ fontSize: "0.72rem" }}
                    >
                        Generate
                    </button>
                </div>

                <div style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        🪞 Reflections
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0 0 0.75rem" }}>
                        Generate 3 reflection prompts for the learner.
                    </p>
                    <button
                        onClick={handleGenerateReflection}
                        disabled={loading || !selectedEpisode}
                        className="episode-action-btn"
                        style={{ fontSize: "0.72rem" }}
                    >
                        Generate
                    </button>
                </div>
            </div>

            {/* Generate Best Moments */}
            <div style={{
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "1rem",
            }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    ⚡ Generate Best Moments
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 0.75rem" }}>
                    AI scans transcript + discussion to identify 3–5 key learning moments.
                </p>
                <button
                    onClick={handleGenerateBestMoments}
                    disabled={loading || !selectedEpisode}
                    className="episode-action-btn"
                    style={{ fontSize: "0.75rem" }}
                >
                    {loading ? "Processing..." : "Generate"}
                </button>
            </div>

            {/* Generate Cohort Signals */}
            <div style={{
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "1rem",
            }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    📡 Generate Cohort Signals
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 0.75rem" }}>
                    AI derives cohort-level insights from discussion activity.
                    {programId && <span style={{ fontFamily: "var(--font-mono, monospace)" }}> ({programId.slice(0, 8)}...)</span>}
                </p>
                <button
                    onClick={handleGenerateCohortSignals}
                    disabled={loading || !programId}
                    className="episode-action-btn"
                    style={{ fontSize: "0.75rem" }}
                >
                    {loading ? "Processing..." : "Generate"}
                </button>
            </div>

            {/* Create Operator Highlight */}
            <div style={{
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(227, 38, 82, 0.15)",
                marginBottom: "1rem",
            }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                    ⭐ Create Operator Highlight
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <input
                        type="text"
                        placeholder="Highlight title"
                        value={hlTitle}
                        onChange={(e) => setHlTitle(e.target.value)}
                        style={{
                            padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "0.8rem",
                        }}
                    />
                    <textarea
                        placeholder="Highlight body — what makes this moment important?"
                        value={hlBody}
                        onChange={(e) => setHlBody(e.target.value)}
                        rows={3}
                        style={{
                            padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "0.8rem",
                            resize: "vertical",
                        }}
                    />
                    <input
                        type="number"
                        placeholder="Timestamp (seconds, optional)"
                        value={hlTimestamp}
                        onChange={(e) => setHlTimestamp(e.target.value)}
                        style={{
                            padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "0.8rem",
                            fontFamily: "var(--font-mono, monospace)",
                            width: "12rem",
                        }}
                    />
                    <button
                        onClick={handleCreateHighlight}
                        disabled={loading || !selectedEpisode}
                        className="episode-action-btn"
                        style={{ fontSize: "0.75rem", alignSelf: "flex-start" }}
                    >
                        {loading ? "Creating..." : "Create Highlight"}
                    </button>
                </div>
            </div>
        </div>
    );
}
