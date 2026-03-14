import { getEpisode } from "@/app/actions/program";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/app/components/ui/Breadcrumbs";
import { EpisodeView } from "../../../../episodes/[episodeId]/EpisodeView";

interface Props {
    params: Promise<{ slug: string; episodeId: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { episodeId } = await params;
    const episode = await getEpisode(episodeId);
    return {
        title: episode ? `${episode.title} — Cash Offer Conversion School` : "Episode Not Found",
        description: episode?.description ?? "",
    };
}

export default async function ProgramEpisodePage({ params }: Props) {
    const { slug, episodeId } = await params;
    const episode = await getEpisode(episodeId);

    if (!episode) {
        notFound();
    }

    return (
        <div>
            <Breadcrumbs
                crumbs={[
                    { label: "Programs", href: "/programs" },
                    { label: episode.moduleTitle.replace(/^Module \d+:\s*/, ""), href: `/programs/${slug}` },
                    { label: episode.title },
                ]}
            />
            <EpisodeView episode={episode} />
        </div>
    );
}
