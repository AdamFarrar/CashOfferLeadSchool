import type { Metadata } from "next";
import { SectionHeader, ComingSoonCard } from "@/app/components/ui/Cards";

export const metadata: Metadata = {
    title: "My Notes — Cash Offer Conversion School",
    description: "Your personal notes from episodes and live sessions.",
};

export default function NotesPage() {
    return (
        <div>
            <SectionHeader
                title="My Notes"
                subtitle="Your personal notes from episodes and live sessions."
            />
            <ComingSoonCard
                icon="📝"
                title="Coming Soon"
                description="Take notes during episodes and live sessions. Your notes will be saved here and linked to the content you were watching."
            />
        </div>
    );
}
