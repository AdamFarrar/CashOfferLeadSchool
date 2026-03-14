import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Programs — Cash Offer Conversion School",
};

export default function EpisodesRedirectPage() {
    redirect("/programs");
}
