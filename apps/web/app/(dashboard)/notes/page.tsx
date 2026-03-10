import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Notes — Cash Offer Conversion School",
    description: "Your personal notes from episodes and live sessions.",
};

export default function NotesPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-[1.75rem] mb-2">My Notes</h1>
                <p className="text-[color:var(--text-secondary)] text-[0.95rem]">
                    Your personal notes from episodes and live sessions.
                </p>
            </div>

            <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
                <p className="text-[color:var(--text-secondary)] text-[0.9rem] max-w-md mx-auto leading-relaxed">
                    Take notes during episodes and live sessions. Your notes will be
                    saved here and linked to the content you were watching.
                </p>
            </div>
        </div>
    );
}
