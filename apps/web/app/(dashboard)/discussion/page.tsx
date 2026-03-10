import type { Metadata } from "next";
import { SectionHeader, ComingSoonCard } from "@/app/components/ui/Cards";

export const metadata: Metadata = {
    title: "Discussion — Cash Offer Conversion School",
    description: "Discuss episodes, share wins, and connect with your cohort.",
};

export default function DiscussionPage() {
    return (
        <div>
            <SectionHeader
                title="Discussion"
                subtitle="Share wins, ask questions, and connect with your cohort."
            />
            <ComingSoonCard
                icon="💬"
                title="Coming Soon"
                description="Discussion threads will be available when Season 1 kicks off. You'll be able to discuss episodes, share deal breakdowns, and learn from other operators in your cohort."
            />
        </div>
    );
}
