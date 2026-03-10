import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Downloads — Cash Offer Conversion School",
    description: "Scripts, checklists, and SOPs from your Season 1 program.",
};

const DOWNLOAD_CATEGORIES = [
    {
        title: "Call Scripts",
        icon: "📞",
        items: [
            "First-contact inbound script",
            "Follow-up call framework",
            "Objection handling cheat sheet",
        ],
    },
    {
        title: "Appointment SOPs",
        icon: "🏠",
        items: [
            "Pre-appointment checklist",
            "Kitchen table walkthrough guide",
            "Offer presentation template",
        ],
    },
    {
        title: "Offer Templates",
        icon: "💰",
        items: [
            "Comp analysis worksheet",
            "Repair estimate calculator",
            "Deal structure comparison sheet",
        ],
    },
    {
        title: "Nurture Sequences",
        icon: "📧",
        items: [
            "7-day drip sequence templates",
            "Re-engagement email series",
            "Pipeline tracking spreadsheet",
        ],
    },
];

export default function DownloadsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-[1.75rem] mb-2">Downloads</h1>
                <p className="text-[color:var(--text-secondary)] text-[0.95rem]">
                    Scripts, checklists, and SOPs — ready to install in your operation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DOWNLOAD_CATEGORIES.map((cat) => (
                    <div key={cat.title} className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="icon-box">{cat.icon}</div>
                            <h2 className="font-semibold text-[0.95rem]">{cat.title}</h2>
                        </div>
                        <ul className="flex flex-col gap-2">
                            {cat.items.map((item) => (
                                <li key={item} className="flex items-center gap-3 text-[0.85rem] text-[color:var(--text-secondary)]">
                                    <span className="text-[color:var(--text-muted)]">📥</span>
                                    <span className="flex-1">{item}</span>
                                    <span className="text-xs text-[color:var(--text-muted)]">Coming soon</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
