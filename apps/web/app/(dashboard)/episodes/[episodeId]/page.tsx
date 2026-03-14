import { redirect, notFound } from "next/navigation";
import { resolveEpisodeSlugAction } from "@/app/actions/program";

interface Props {
    params: Promise<{ episodeId: string }>;
}

export async function generateMetadata() {
    return { title: "Redirecting..." };
}

export default async function EpisodeRedirectPage({ params }: Props) {
    const { episodeId } = await params;
    const slug = await resolveEpisodeSlugAction(episodeId);

    if (slug) {
        redirect(`/programs/${slug}/episodes/${episodeId}`);
    }

    // Fallback: if no slug found, still try to show the episode
    notFound();
}
