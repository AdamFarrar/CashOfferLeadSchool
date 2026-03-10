import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Discussion — Cash Offer Conversion School",
    description: "Discuss episodes, share wins, and connect with your cohort.",
};

export default function DiscussionPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-[1.75rem] mb-2">Discussion</h1>
                <p className="text-[color:var(--text-secondary)] text-[0.95rem]">
                    Share wins, ask questions, and connect with your cohort.
                </p>
            </div>

            <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
                <p className="text-[color:var(--text-secondary)] text-[0.9rem] max-w-md mx-auto leading-relaxed">
                    Discussion threads will be available when Season 1 kicks off.
                    You&apos;ll be able to discuss episodes, share deal breakdowns,
                    and learn from other operators in your cohort.
                </p>
            </div>
        </div>
    );
}
