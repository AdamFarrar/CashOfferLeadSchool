"use client";

// =============================================================================
// NotesListClient — Phase H P3 Enhancement
// =============================================================================
// Client-side wrapper for notes list with search/filter functionality.
// Filters notes by episode title, module title, and content.
// =============================================================================

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/app/components/ui/EmptyState";

interface Note {
    episodeId: string;
    episodeTitle: string;
    moduleTitle: string;
    content: string;
    updatedAt: Date;
}

export function NotesListClient({ notes }: { notes: Note[] }) {
    const [search, setSearch] = useState("");

    const filtered = search.trim()
        ? notes.filter((n) => {
            const q = search.toLowerCase();
            return (
                n.episodeTitle.toLowerCase().includes(q) ||
                n.moduleTitle.toLowerCase().includes(q) ||
                n.content.toLowerCase().includes(q)
            );
        })
        : notes;

    if (notes.length === 0) {
        return (
            <EmptyState
                icon="📝"
                title="Your Notes Will Appear Here"
                description="While watching any episode, use the Your Notes panel to the right of the transcript — everything auto-saves. Once you've written a note, it'll show up here organized by episode."
                cta={{ label: "Browse Episodes", href: "/episodes" }}
            />
        );
    }

    return (
        <>
            {/* Search bar */}
            <div style={{ marginBottom: "1rem" }}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search notes by episode, module, or content..."
                    style={{
                        width: "100%",
                        padding: "0.6rem 0.9rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.825rem",
                        color: "var(--text-primary)",
                        outline: "none",
                    }}
                />
            </div>

            {filtered.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                }}>
                    No notes match &ldquo;{search}&rdquo;
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {filtered.map((note) => (
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

            {search && filtered.length > 0 && (
                <div style={{
                    marginTop: "0.75rem",
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    textAlign: "right",
                }}>
                    {filtered.length} of {notes.length} notes
                </div>
            )}
        </>
    );
}
