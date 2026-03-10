import type { Metadata } from "next";
import { EpisodeCard, ModuleHeader, SectionHeader } from "@/app/components/ui/Cards";

export const metadata: Metadata = {
    title: "Episodes — Cash Offer Conversion School",
    description: "Browse all Season 1 episodes grouped by module.",
};

const MODULES = [
    {
        number: 1,
        title: "Convert for the Appointment",
        weeks: "Weeks 1–3",
        episodes: [
            { number: 1, title: "Speed to Lead: Why the First 5 Minutes Win", guest: "Guest Operator (TBA)" },
            { number: 2, title: "The First Call Script That Books Appointments", guest: "Guest Operator (TBA)" },
            { number: 3, title: "Pre-Qualifying: Filtering Before You Drive", guest: "Guest Operator (TBA)" },
        ],
    },
    {
        number: 2,
        title: "The Appointment",
        weeks: "Weeks 4–6",
        episodes: [
            { number: 4, title: "Building Rapport at the Kitchen Table", guest: "Guest Operator (TBA)" },
            { number: 5, title: "Uncovering Motivation: Why They Really Want to Sell", guest: "Guest Operator (TBA)" },
            { number: 6, title: "Positioning the Cash Offer as the Obvious Solution", guest: "Guest Operator (TBA)" },
        ],
    },
    {
        number: 3,
        title: "Offer Mechanics",
        weeks: "Weeks 7–9",
        episodes: [
            { number: 7, title: "Running Comps That Protect Your Margin", guest: "Guest Operator (TBA)" },
            { number: 8, title: "Repair Estimates Without Over-Engineering", guest: "Guest Operator (TBA)" },
            { number: 9, title: "Creative Deal Structures That Close More Deals", guest: "Guest Operator (TBA)" },
        ],
    },
    {
        number: 4,
        title: "Nurture",
        weeks: "Weeks 10–12",
        episodes: [
            { number: 10, title: "Drip Sequences That Warm Cold Leads", guest: "Guest Operator (TBA)" },
            { number: 11, title: "Re-Engagement Campaigns for Dead Pipelines", guest: "Guest Operator (TBA)" },
            { number: 12, title: "Pipeline Management: Owning the Follow-Up", guest: "Guest Operator (TBA)" },
        ],
    },
];

export default function EpisodesPage() {
    return (
        <div>
            <SectionHeader
                title="Episodes"
                subtitle="Season 1 — 12 episodes across 4 modules"
            />

            {MODULES.map((mod) => (
                <div key={mod.number} className="mb-10">
                    <ModuleHeader
                        moduleNumber={mod.number}
                        title={mod.title}
                        weeks={mod.weeks}
                    />
                    <div className="flex flex-col gap-3">
                        {mod.episodes.map((ep) => (
                            <EpisodeCard
                                key={ep.number}
                                episodeNumber={ep.number}
                                title={ep.title}
                                guest={ep.guest}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
