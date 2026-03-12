import type { Metadata } from "next";
import { getServerIdentity } from "@/app/actions/identity";
import { getProgramThreadsAction } from "@/app/actions/discussion";
import { DiscussionThreadList } from "@/app/components/program/DiscussionThread";
import { getActiveProgram } from "@cocs/services";

export const metadata: Metadata = {
    title: "Discussion — Cash Offer Conversion School",
    description: "Program-wide discussion threads.",
};

export default async function DiscussionPage() {
    const identity = await getServerIdentity();
    if (!identity) return <div>Not authenticated.</div>;

    const program = await getActiveProgram(identity.userId);
    if (!program) {
        return (
            <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Discussion</h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    No active program found.
                </p>
            </div>
        );
    }

    const result = await getProgramThreadsAction(program.id, 1);

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Discussion
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {program.title} — conversations across all modules and episodes.
                </p>
            </div>

            <DiscussionThreadList
                threads={result.threads ?? []}
                total={result.total ?? 0}
                programId={program.id}
                discussionPrompt="What has changed the way you run your operation since joining the program?"
            />
        </div>
    );
}
