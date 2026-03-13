"use server";

// =============================================================================
// Platform Settings Server Actions — P3-6
// =============================================================================

import { db } from "@cocs/database";
import { platformSetting } from "@cocs/database/schema";
import { eq } from "drizzle-orm";
import { getServerIdentity } from "./identity";

export async function getPlatformSettingsAction(): Promise<{
    success: boolean;
    settings: { key: string; value: string; description: string | null; updatedAt: string }[];
}> {
    try {
        const identity = await getServerIdentity();
        if (!identity) return { success: false, settings: [] };

        const rows = await db.select().from(platformSetting);
        return {
            success: true,
            settings: rows.map((r) => ({
                key: r.key,
                value: r.value,
                description: r.description,
                updatedAt: r.updatedAt.toISOString(),
            })),
        };
    } catch (err) {
        console.error("[ADMIN] getPlatformSettingsAction error:", err);
        return { success: false, settings: [] };
    }
}

export async function updatePlatformSettingAction(
    key: string,
    value: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const identity = await getServerIdentity();
        if (!identity) return { success: false, error: "Not authenticated" };

        await db
            .update(platformSetting)
            .set({ value, updatedBy: identity.userId, updatedAt: new Date() })
            .where(eq(platformSetting.key, key));

        return { success: true };
    } catch (err) {
        console.error("[ADMIN] updatePlatformSettingAction error:", err);
        return { success: false, error: "Failed to update setting" };
    }
}
