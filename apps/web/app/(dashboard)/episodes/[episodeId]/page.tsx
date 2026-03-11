import { getEpisode } from "@/app/actions/program";
import { notFound } from "next/navigation";
import { EpisodeView } from "./EpisodeView";

interface Props {
    params: Promise<{ episodeId: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { episodeId } = await params;
    const episode = await getEpisode(episodeId);
    return {
        title: episode ? `${episode.title} — Cash Offer Conversion School` : "Episode Not Found",
        description: episode?.description ?? "",
    };
}

export default async function EpisodePage({ params }: Props) {
    const { episodeId } = await params;
    const episode = await getEpisode(episodeId);

    if (!episode) {
        notFound();
    }

    return <EpisodeView episode={episode} />;
}
