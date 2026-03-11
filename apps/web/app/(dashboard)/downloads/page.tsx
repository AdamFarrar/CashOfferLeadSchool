import type { Metadata } from "next";
import { getDownloadAssets } from "@/app/actions/program";

export const metadata: Metadata = {
    title: "Downloads — Cash Offer Conversion School",
    description: "Scripts, checklists, and SOPs from your program.",
};

export default async function DownloadsPage() {
    const assets = await getDownloadAssets();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Downloads</h1>
                <p className="text-[color:var(--text-secondary)] text-sm">
                    Scripts, checklists, and SOPs — ready to install in your operation.
                </p>
            </div>

            {assets.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-4">📥</div>
                    <h2 className="text-lg font-semibold mb-2">Downloads Coming Soon</h2>
                    <p className="text-[color:var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed">
                        Downloadable scripts, templates, and checklists will appear here as
                        episodes are released.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assets.map((asset) => (
                        <a
                            key={asset.id}
                            href={asset.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-card p-6 no-underline text-inherit hover:border-[var(--brand-orange)]/30 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="icon-box shrink-0 text-sm">📄</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm mb-1">{asset.title}</h3>
                                    <p className="text-xs text-[color:var(--text-muted)]">
                                        {asset.episodeTitle} · {asset.moduleTitle}
                                    </p>
                                </div>
                                <span className="badge text-xs shrink-0">
                                    {asset.fileType ?? "PDF"}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
