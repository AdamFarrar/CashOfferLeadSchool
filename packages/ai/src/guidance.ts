// =============================================================================
// Completion Guidance Engine — Phase 6 Feature 5
// =============================================================================
// Deterministic rules engine — NOT AI-generated.
// Evaluates user progress and returns contextual nudges.
//
// Rule 5: Guidance is computed dynamically per user.
// NOT persisted in ai_insight unless explicitly needed later.
// =============================================================================

export interface GuidanceMessage {
    type: "stalled" | "no_notes" | "rapid_progress" | "completed" | "just_started";
    title: string;
    body: string;
    priority: number; // 1 = highest
}

export interface GuidanceInput {
    totalEpisodes: number;
    completedEpisodes: number;
    hasWrittenNotes: boolean;
    lastActivityDaysAgo: number | null;
    nextEpisodeTitle: string | null;
    nextEpisodeId: string | null;
}

export function evaluateCompletionGuidance(input: GuidanceInput): GuidanceMessage[] {
    const messages: GuidanceMessage[] = [];
    const {
        totalEpisodes,
        completedEpisodes,
        hasWrittenNotes,
        lastActivityDaysAgo,
        nextEpisodeTitle,
    } = input;

    const progressRatio = totalEpisodes > 0 ? completedEpisodes / totalEpisodes : 0;

    // ── Rule: All completed ──
    if (completedEpisodes >= totalEpisodes && totalEpisodes > 0) {
        messages.push({
            type: "completed",
            title: "🎉 Program Complete",
            body: "You've completed all episodes. Review the discussion highlights for extra insights, or revisit your notes.",
            priority: 1,
        });
        return messages; // No other guidance needed
    }

    // ── Rule: Stalled learner (no activity for 5+ days) ──
    if (lastActivityDaysAgo !== null && lastActivityDaysAgo >= 5 && progressRatio < 1) {
        const nextDesc = nextEpisodeTitle
            ? ` "${nextEpisodeTitle}" is ready for you.`
            : " Your next episode is waiting.";
        messages.push({
            type: "stalled",
            title: "📌 Pick Up Where You Left Off",
            body: `You haven't logged in for ${lastActivityDaysAgo} days.${nextDesc}`,
            priority: 1,
        });
    }

    // ── Rule: No notes written ──
    if (!hasWrittenNotes && completedEpisodes >= 2) {
        messages.push({
            type: "no_notes",
            title: "✍️ Start Taking Notes",
            body: "Learners who write notes complete the program 30% more often. Try jotting down one key insight per episode.",
            priority: 2,
        });
    }

    // ── Rule: Rapid progress ──
    if (progressRatio >= 0.5 && lastActivityDaysAgo !== null && lastActivityDaysAgo <= 2) {
        messages.push({
            type: "rapid_progress",
            title: "🚀 Great Momentum",
            body: "You're ahead of the cohort. Consider reviewing the discussion highlights to deepen your understanding.",
            priority: 3,
        });
    }

    // ── Rule: Just started ──
    if (completedEpisodes <= 1 && totalEpisodes > 3) {
        messages.push({
            type: "just_started",
            title: "👋 Welcome to the Program",
            body: "Complete your first few episodes to build momentum. The strategies build on each other.",
            priority: 3,
        });
    }

    // Sort by priority
    messages.sort((a, b) => a.priority - b.priority);

    return messages;
}
