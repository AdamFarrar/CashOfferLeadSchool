import type { Metadata } from "next";
import { getServerIdentity } from "@/app/actions/identity";
import { getProgramThreadsAction, checkConductAction } from "@/app/actions/discussion";
import { DiscussionThreadList } from "@/app/components/program/DiscussionThread";
import { getActiveProgram } from "@cols/services";
import type { ThreadSummary } from "@cols/services";

export const metadata: Metadata = {
    title: "Discussion — Cash Offer Lead School",
    description: "Program-wide discussion threads.",
};

export default async function DiscussionPage() {
    const identity = await getServerIdentity();
    if (!identity) return <div>Not authenticated.</div>;

    const program = await getActiveProgram(identity.userId);
    if (!program) {
        return (
            <div>
                <h1 className="page-title">Discussion</h1>
                <p className="page-subtitle">
                    No active program found.
                </p>
            </div>
        );
    }

    // Graceful error handling — never crash the page
    let threads: ThreadSummary[] = [];
    let total = 0;
    let hasAgreed = false;
    try {
        const [threadResult, conductResult] = await Promise.all([
            getProgramThreadsAction(program.id, 1),
            checkConductAction(),
        ]);
        threads = threadResult.threads ?? [];
        total = threadResult.total ?? 0;
        hasAgreed = conductResult.agreed;
    } catch (e) {
        console.error("[DiscussionPage] Failed to load threads:", e);
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Discussion</h1>
                <p className="page-subtitle">
                    {program.title} — conversations across all modules and episodes.
                </p>
            </div>

            <DiscussionThreadList
                threads={threads}
                total={total}
                programId={program.id}
                discussionPrompt="What has changed the way you run your operation since joining the program?"
                hasAgreedToConduct={hasAgreed}
            />
        </div>
    );
}
