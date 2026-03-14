import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProgramBySlugAction } from "@/app/actions/program";
import { Breadcrumbs } from "@/app/components/ui/Breadcrumbs";
import { EpisodeLibrary } from "../../episodes/EpisodeLibrary";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const program = await getProgramBySlugAction(slug);
    return {
        title: program
            ? `${program.title} — Cash Offer Conversion School`
            : "Program — Cash Offer Conversion School",
    };
}

export default async function ProgramDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const program = await getProgramBySlugAction(slug);

    if (!program) {
        notFound();
    }

    return (
        <div>
            <Breadcrumbs
                crumbs={[
                    { label: "Programs", href: "/programs" },
                    { label: program.title },
                ]}
            />
            <EpisodeLibrary program={program} />
        </div>
    );
}
