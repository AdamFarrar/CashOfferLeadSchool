"use server";

// =============================================================================
// Admin Downloads Server Actions — Phase H (Product Hardening)
// =============================================================================

import { requireAdmin } from "./guards";
import { db } from "@cocs/database";
import { episodeAsset, episode, module } from "@cocs/database/schema";
import { eq, desc } from "drizzle-orm";

export async function listAssetsAction() {
    try {
        await requireAdmin();
        const rows = await db
            .select({
                id: episodeAsset.id,
                title: episodeAsset.title,
                fileUrl: episodeAsset.fileUrl,
                fileType: episodeAsset.fileType,
                episodeId: episodeAsset.episodeId,
                episodeTitle: episode.title,
                moduleTitle: module.title,
                createdAt: episodeAsset.createdAt,
            })
            .from(episodeAsset)
            .leftJoin(episode, eq(episodeAsset.episodeId, episode.id))
            .leftJoin(module, eq(episode.moduleId, module.id))
            .orderBy(desc(episodeAsset.createdAt));
        return { success: true, assets: rows };
    } catch (e) {
        console.error("[listAssetsAction]", e);
        return { success: false, error: "Failed to list assets" };
    }
}

export async function getEpisodesForFormAction() {
    try {
        await requireAdmin();
        const rows = await db
            .select({
                id: episode.id,
                title: episode.title,
                moduleTitle: module.title,
                orderIndex: episode.orderIndex,
                moduleOrderIndex: module.orderIndex,
            })
            .from(episode)
            .leftJoin(module, eq(episode.moduleId, module.id))
            .orderBy(module.orderIndex, episode.orderIndex);
        return { success: true, episodes: rows };
    } catch (e) {
        console.error("[getEpisodesForFormAction]", e);
        return { success: false, error: "Failed to list episodes" };
    }
}

export async function createAssetAction(params: {
    episodeId: string;
    title: string;
    fileUrl: string;
    fileType: string;
}) {
    try {
        await requireAdmin();
        const [row] = await db
            .insert(episodeAsset)
            .values({
                episodeId: params.episodeId,
                title: params.title,
                fileUrl: params.fileUrl,
                fileType: params.fileType,
            })
            .returning();
        return { success: true, asset: row };
    } catch (e) {
        console.error("[createAssetAction]", e);
        return { success: false, error: "Failed to create asset" };
    }
}

export async function deleteAssetAction(assetId: string) {
    try {
        await requireAdmin();
        await db.delete(episodeAsset).where(eq(episodeAsset.id, assetId));
        return { success: true };
    } catch (e) {
        console.error("[deleteAssetAction]", e);
        return { success: false, error: "Failed to delete asset" };
    }
}
