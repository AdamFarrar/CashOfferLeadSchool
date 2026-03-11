import type { Metadata } from "next";
import { getProgram } from "@/app/actions/program";
import { EpisodeLibrary } from "./EpisodeLibrary";

export const metadata: Metadata = {
    title: "Episodes — Cash Offer Conversion School",
    description: "Browse all Season 1 episodes grouped by module.",
};

export default async function EpisodesPage() {
    const program = await getProgram();

    if (!program) {
        return (
            <div className="text-center py-20">
                <div className="text-4xl mb-4">📺</div>
                <h1 className="text-xl font-bold mb-2">No Active Program</h1>
                <p className="text-[color:var(--text-secondary)] text-sm">
                    Check back soon — your cohort program is being prepared.
                </p>
            </div>
        );
    }

    return <EpisodeLibrary program={program} />;
}
