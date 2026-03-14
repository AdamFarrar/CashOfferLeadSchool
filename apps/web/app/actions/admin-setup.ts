"use server";

// =============================================================================
// Admin Setup Status — P2-5
// =============================================================================
// Queries counts across key tables to show admin what's configured.
// =============================================================================

import { db } from "@cols/database";
import {
    episode,
    episodeAsset,
    emailTemplate,
    automationRule,
    aiInsight,
    liveSession,
} from "@cols/database/schema";
import { count } from "drizzle-orm";
import { getServerIdentity } from "./identity";

interface SetupStatus {
    episodes: number;
    assets: number;
    emailTemplates: number;
    automationRules: number;
    aiInsights: number;
    liveSessions: number;
}

export async function getAdminSetupStatusAction(): Promise<{
    success: boolean;
    data: SetupStatus;
}> {
    try {
        const identity = await getServerIdentity();
        if (!identity) return { success: false, data: emptyCounts() };

        const [ep, as, et, ar, ai, ls] = await Promise.all([
            db.select({ c: count() }).from(episode),
            db.select({ c: count() }).from(episodeAsset),
            db.select({ c: count() }).from(emailTemplate),
            db.select({ c: count() }).from(automationRule),
            db.select({ c: count() }).from(aiInsight),
            db.select({ c: count() }).from(liveSession),
        ]);

        return {
            success: true,
            data: {
                episodes: ep[0]?.c ?? 0,
                assets: as[0]?.c ?? 0,
                emailTemplates: et[0]?.c ?? 0,
                automationRules: ar[0]?.c ?? 0,
                aiInsights: ai[0]?.c ?? 0,
                liveSessions: ls[0]?.c ?? 0,
            },
        };
    } catch (err) {
        console.error("[ADMIN] getAdminSetupStatusAction error:", err);
        return { success: false, data: emptyCounts() };
    }
}

function emptyCounts(): SetupStatus {
    return { episodes: 0, assets: 0, emailTemplates: 0, automationRules: 0, aiInsights: 0, liveSessions: 0 };
}
