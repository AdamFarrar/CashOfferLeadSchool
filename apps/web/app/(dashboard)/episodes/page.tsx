import type { Metadata } from "next";

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
            <div className="mb-8">
                <h1 className="text-[1.75rem] mb-2">Episodes</h1>
                <p className="text-[color:var(--text-secondary)] text-[0.95rem]">
                    Season 1 — 12 episodes across 4 modules
                </p>
            </div>

            {MODULES.map((mod) => (
                <div key={mod.number} className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[color:var(--brand-orange)] font-bold text-sm">
                            MODULE {mod.number}
                        </span>
                        <span className="text-[color:var(--text-muted)] text-sm">—</span>
                        <span className="font-semibold text-[0.95rem]">{mod.title}</span>
                        <span className="text-xs text-[color:var(--text-muted)] ml-auto">{mod.weeks}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {mod.episodes.map((ep) => (
                            <div key={ep.number} className="glass-card p-5">
                                <div className="flex items-start gap-4">
                                    <div className="icon-box shrink-0 text-sm">🎬</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="badge text-xs shrink-0">Ep {ep.number}</span>
                                            <h3 className="font-semibold text-[0.9rem] truncate">{ep.title}</h3>
                                        </div>
                                        <p className="text-xs text-[color:var(--text-muted)]">{ep.guest}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            className="btn-ghost text-xs py-1.5 px-3 opacity-50 cursor-not-allowed"
                                            disabled
                                            title="Coming soon"
                                        >
                                            📥 Download
                                        </button>
                                        <button
                                            className="btn-ghost text-xs py-1.5 px-3 opacity-50 cursor-not-allowed"
                                            disabled
                                            title="Coming soon"
                                        >
                                            ▶ Replay
                                        </button>
                                        <button
                                            className="btn-ghost text-xs py-1.5 px-3 opacity-50 cursor-not-allowed"
                                            disabled
                                            title="Coming soon"
                                        >
                                            📝 Notes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
