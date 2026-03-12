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
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Downloads
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Scripts, checklists, and SOPs — ready to install in your operation.
                </p>
            </div>

            {assets.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "3rem 2rem",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📥</div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Downloads Coming Soon
                    </h2>
                    <p style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        maxWidth: "28rem",
                        margin: "0 auto",
                        lineHeight: 1.6,
                    }}>
                        Downloadable scripts, templates, and checklists will appear here as
                        episodes are released.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1rem",
                }}>
                    {assets.map((asset) => (
                        <a
                            key={asset.id}
                            href={asset.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem 1.25rem",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                textDecoration: "none",
                                color: "inherit",
                                transition: "border-color 0.2s ease",
                            }}
                        >
                            <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>📄</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                                    {asset.title}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                    {asset.episodeTitle} · {asset.moduleTitle}
                                </div>
                            </div>
                            <span style={{
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                color: "var(--brand-orange)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                flexShrink: 0,
                            }}>
                                {asset.fileType ?? "PDF"}
                            </span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
