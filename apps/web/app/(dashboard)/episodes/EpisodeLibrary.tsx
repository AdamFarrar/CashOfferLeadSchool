"use client";

// =============================================================================
// Episode Library — Client Component (Phase 3.5 editorial style)
// =============================================================================
// Renders modules and episodes from structured program data.
// No hardcoded content. All data comes from the database.
// =============================================================================

import Link from "next/link";
import type { ProgramWithModules } from "@cocs/services";

interface Props {
    program: ProgramWithModules;
}

export function EpisodeLibrary({ program }: Props) {
    const totalEpisodes = program.modules.reduce((sum, m) => sum + m.episodes.length, 0);
    const completedEpisodes = program.modules.reduce(
        (sum, m) => sum + m.episodes.filter((e) => e.completed).length,
        0,
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Episodes
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {program.title} — {totalEpisodes} episodes across {program.modules.length} modules
                </p>
                {totalEpisodes > 0 && (
                    <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                            flex: 1,
                            height: "6px",
                            background: "var(--surface-raised)",
                            borderRadius: "3px",
                            overflow: "hidden",
                        }}>
                            <div style={{
                                height: "100%",
                                width: `${(completedEpisodes / totalEpisodes) * 100}%`,
                                background: "var(--brand-orange)",
                                borderRadius: "3px",
                                transition: "width 0.5s ease",
                            }} />
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>
                            {completedEpisodes}/{totalEpisodes} complete
                        </span>
                    </div>
                )}
            </div>

            {/* Modules */}
            {program.modules.map((mod) => (
                <div key={mod.id} style={{ marginBottom: "2.5rem" }}>
                    {/* Module Header */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "1rem",
                    }}>
                        <span style={{ color: "var(--brand-orange)", fontWeight: 700, fontSize: "0.8rem" }}>
                            MODULE {mod.orderIndex + 1}
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{mod.title}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                            {mod.episodes.filter((e) => e.completed).length}/{mod.episodes.length} done
                        </span>
                    </div>

                    {/* Episodes */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {mod.episodes.map((ep, idx) => {
                            const globalEpNumber =
                                program.modules
                                    .slice(0, program.modules.indexOf(mod))
                                    .reduce((s, m) => s + m.episodes.length, 0) + idx + 1;

                            return (
                                <EpisodeRow
                                    key={ep.id}
                                    episode={ep}
                                    episodeNumber={globalEpNumber}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

function EpisodeRow({
    episode,
    episodeNumber,
}: {
    episode: ProgramWithModules["modules"][0]["episodes"][0];
    episodeNumber: number;
}) {
    const rowStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.75rem 1rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.2s ease",
    };

    if (episode.locked) {
        return (
            <div style={{ ...rowStyle, opacity: 0.5 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>🔒</span>
                <span style={{ fontSize: "0.7rem", color: "var(--brand-orange)", fontWeight: 600, flexShrink: 0 }}>
                    Ep {episodeNumber}
                </span>
                <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500 }}>
                    {episode.title}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Week {episode.unlockWeek + 1}
                </span>
            </div>
        );
    }

    return (
        <Link href={`/episodes/${episode.id}`} style={rowStyle}>
            <span style={{ fontSize: "0.75rem" }}>
                {episode.completed ? "✅" : "🎬"}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--brand-orange)", fontWeight: 600, flexShrink: 0 }}>
                Ep {episodeNumber}
            </span>
            <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500 }}>
                {episode.title}
            </span>
            {episode.description && (
                <span style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    maxWidth: "20rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}>
                    {episode.description}
                </span>
            )}
            {episode.durationSeconds && (
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", flexShrink: 0 }}>
                    {Math.ceil(episode.durationSeconds / 60)} min
                </span>
            )}
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>→</span>
        </Link>
    );
}
