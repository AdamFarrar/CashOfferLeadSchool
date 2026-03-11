import type { Metadata } from "next";
import { getNotes } from "@/app/actions/program";
import Link from "next/link";

export const metadata: Metadata = {
    title: "My Notes — Cash Offer Conversion School",
    description: "Your personal notes from episodes.",
};

export default async function NotesPage() {
    const notes = await getNotes();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">My Notes</h1>
                <p className="text-[color:var(--text-secondary)] text-sm">
                    Your personal notes from episodes — private to you.
                </p>
            </div>

            {notes.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-4">📝</div>
                    <h2 className="text-lg font-semibold mb-2">No Notes Yet</h2>
                    <p className="text-[color:var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed mb-6">
                        Start taking notes while watching episodes. Your notes will appear here,
                        organized by episode.
                    </p>
                    <Link href="/episodes" className="btn-primary inline-block">
                        Browse Episodes
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {notes.map((note) => (
                        <Link
                            key={note.episodeId}
                            href={`/episodes/${note.episodeId}`}
                            className="glass-card p-6 no-underline text-inherit hover:border-[var(--brand-orange)]/30 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="icon-box shrink-0 text-sm">📝</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm mb-1">{note.episodeTitle}</h3>
                                    <p className="text-xs text-[color:var(--text-muted)] mb-2">
                                        {note.moduleTitle}
                                    </p>
                                    <p className="text-sm text-[color:var(--text-secondary)] line-clamp-3">
                                        {note.content}
                                    </p>
                                </div>
                                <span className="text-xs text-[color:var(--text-muted)] shrink-0">
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
