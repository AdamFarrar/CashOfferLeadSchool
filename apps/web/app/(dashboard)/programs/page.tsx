import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserProgramsAction } from "@/app/actions/program";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Programs — Cash Offer Conversion School",
    description: "Browse your enrolled programs.",
};

export default async function ProgramsPage() {
    const programs = await getUserProgramsAction();

    // Single program: auto-redirect to program view (UX decision by @ux-researcher)
    if (programs.length === 1 && programs[0].slug) {
        redirect(`/programs/${programs[0].slug}`);
    }

    // Zero programs
    if (programs.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-4xl mb-4">📚</div>
                <h1 className="text-xl font-bold mb-2">No Programs Available</h1>
                <p className="text-[color:var(--text-secondary)] text-sm">
                    Your cohort programs will appear here once they&apos;re available.
                </p>
            </div>
        );
    }

    // Multi-program: show program cards
    return (
        <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                Your Programs
            </h1>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem",
            }}>
                {programs.map((prog) => (
                    <Link
                        key={prog.id}
                        href={`/programs/${prog.slug ?? prog.id}`}
                        className="program-card"
                    >
                        {prog.previewImageUrl && (
                            <img
                                src={prog.previewImageUrl}
                                alt={prog.title}
                                className="program-card-image"
                            />
                        )}
                        <div className="program-card-title">{prog.title}</div>
                        <div className="program-card-meta">
                            {prog.totalModules} modules · {prog.totalEpisodes} episodes
                        </div>
                        <div className="program-progress-bar">
                            <div
                                className="program-progress-fill"
                                style={{ width: `${prog.progressPercent}%` }}
                            />
                        </div>
                        <div style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: "0.5rem",
                        }}>
                            {prog.progressPercent}% complete
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
