import type { Metadata } from "next";
import { getDownloadAssets } from "@/app/actions/program";
import { DownloadsListClient } from "@/app/components/program/DownloadsListClient";

export const metadata: Metadata = {
    title: "Downloads — Cash Offer Lead School",
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

            <DownloadsListClient assets={assets} />
        </div>
    );
}
