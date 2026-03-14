import type { Metadata } from "next";
import Link from "next/link";
import { getServerIdentity } from "@/app/actions/identity";
import { getThreadDetailAction } from "@/app/actions/discussion";
import { ThreadDetail } from "@/app/components/program/ThreadDetail";

export const metadata: Metadata = {
    title: "Thread — Cash Offer Lead School",
    description: "Discussion thread detail.",
};

export default async function ThreadDetailPage({
    params,
}: {
    params: Promise<{ threadId: string }>;
}) {
    const { threadId } = await params;
    const identity = await getServerIdentity();
    if (!identity) return <div>Not authenticated.</div>;

    const result = await getThreadDetailAction(threadId, 1);

    if (!result.success || !result.data) {
        return (
            <div style={{ textAlign: "center", padding: "3rem" }}>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Thread Not Found
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    This thread may have been removed or hidden.
                </p>
                <Link
                    href="/discussion"
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
                    Back to Discussion
                </Link>
            </div>
        );
    }

    const isAdmin = identity.role === "owner" || identity.role === "admin";

    return (
        <div>
            <Link
                href={result.data.thread.episodeId ? `/episodes/${result.data.thread.episodeId}` : "/discussion"}
                style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    display: "inline-block",
                    marginBottom: "1rem",
                }}
            >
                ← Back to {result.data.thread.episodeId ? "Episode" : "Discussion"}
            </Link>

            <ThreadDetail
                thread={result.data.thread}
                posts={result.data.posts}
                totalPosts={result.data.totalPosts}
                currentUserId={identity.userId}
                isAdmin={isAdmin}
            />
        </div>
    );
}
