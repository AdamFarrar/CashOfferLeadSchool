"use client";

// =============================================================================
// Episode Library — Client Component
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
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Episodes</h1>
                <p className="text-[color:var(--text-secondary)] text-sm">
                    {program.title} — {totalEpisodes} episodes across {program.modules.length} modules
                </p>
                {totalEpisodes > 0 && (
                    <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--brand-orange)] rounded-full transition-all duration-500"
                                style={{ width: `${(completedEpisodes / totalEpisodes) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-[color:var(--text-muted)] shrink-0">
                            {completedEpisodes}/{totalEpisodes} complete
                        </span>
                    </div>
                )}
            </div>

            {/* Modules */}
            {program.modules.map((mod) => (
                <div key={mod.id} className="mb-10">
                    {/* Module Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[color:var(--brand-orange)] font-bold text-sm">
                            MODULE {mod.orderIndex + 1}
                        </span>
                        <span className="text-[color:var(--text-muted)] text-sm">—</span>
                        <span className="font-semibold text-sm">{mod.title}</span>
                        <span className="text-xs text-[color:var(--text-muted)] ml-auto">
                            {mod.episodes.filter((e) => e.completed).length}/{mod.episodes.length} done
                        </span>
                    </div>

                    {/* Episodes */}
                    <div className="flex flex-col gap-3">
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
    if (episode.locked) {
        return (
            <div className="glass-card p-6 opacity-60">
                <div className="flex items-start gap-4">
                    <div className="icon-box shrink-0 text-sm">🔒</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="badge text-xs shrink-0">Ep {episodeNumber}</span>
                            <h3 className="font-semibold text-sm truncate">{episode.title}</h3>
                        </div>
                        <p className="text-xs text-[color:var(--text-muted)]">
                            Unlocks in Week {episode.unlockWeek + 1}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            href={`/episodes/${episode.id}`}
            className="glass-card p-6 no-underline text-inherit hover:border-[var(--brand-orange)]/30 transition-colors"
        >
            <div className="flex items-start gap-4">
                <div className="icon-box shrink-0 text-sm">
                    {episode.completed ? "✅" : "🎬"}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="badge text-xs shrink-0">Ep {episodeNumber}</span>
                        <h3 className="font-semibold text-sm truncate">{episode.title}</h3>
                    </div>
                    {episode.description && (
                        <p className="text-xs text-[color:var(--text-muted)] line-clamp-2">
                            {episode.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {episode.durationSeconds && (
                        <span className="text-xs text-[color:var(--text-muted)]">
                            {Math.ceil(episode.durationSeconds / 60)} min
                        </span>
                    )}
                    <span className="text-[color:var(--text-muted)]">→</span>
                </div>
            </div>
        </Link>
    );
}
