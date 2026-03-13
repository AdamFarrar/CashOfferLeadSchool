import type { Metadata } from "next";
import { getNotes } from "@/app/actions/program";
import { NotesListClient } from "@/app/components/program/NotesListClient";

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

            <NotesListClient notes={notes} />
        </div>
    );
}
