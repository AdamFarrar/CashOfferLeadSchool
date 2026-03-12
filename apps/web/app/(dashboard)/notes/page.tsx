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
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    My Notes
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Your personal notes from episodes — private to you.
                </p>
            </div>

            {notes.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "3rem 2rem",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📝</div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        No Notes Yet
                    </h2>
                    <p style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        maxWidth: "28rem",
                        margin: "0 auto 1.5rem",
                        lineHeight: 1.6,
                    }}>
                        Start taking notes while watching episodes. Your notes will appear here,
                        organized by episode.
                    </p>
                    <Link
                        href="/episodes"
                        style={{
                            display: "inline-block",
                            padding: "0.5rem 1.5rem",
                            background: "var(--brand-orange)",
                            color: "#fff",
                            borderRadius: "var(--radius-md)",
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                        }}
                    >
                        Browse Episodes
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {notes.map((note) => (
                        <Link
                            key={note.episodeId}
                            href={`/episodes/${note.episodeId}`}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "1rem",
                                padding: "1rem 1.25rem",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                textDecoration: "none",
                                color: "inherit",
                                transition: "border-color 0.2s ease",
                            }}
                        >
                            <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.1rem" }}>📝</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.2rem" }}>
                                    {note.episodeTitle}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                                    {note.moduleTitle}
                                </div>
                                <p style={{
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}>
                                    {note.content}
                                </p>
                            </div>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", flexShrink: 0 }}>
                                {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
