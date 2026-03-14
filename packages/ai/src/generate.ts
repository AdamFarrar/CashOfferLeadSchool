// =============================================================================
// AI Generation — Phase 5
// =============================================================================
// One-shot generation functions for takeaways, digests, and reflections.
// All outputs stored in ai_insight via the service layer — never inline.
// =============================================================================

import { getAIClient, MODELS, LIMITS } from "./client";

// ── Types ──

export interface TakeawayResult {
    takeaways: string[];
    model: string;
    tokenCount: number;
}

export interface DigestResult {
    summary: string;
    themes: string[];
    topQuestions: string[];
    model: string;
    tokenCount: number;
}

export interface ReflectionResult {
    prompts: string[];
    model: string;
    tokenCount: number;
}

// ── Episode Takeaways ──

export async function generateTakeaways(
    episodeTitle: string,
    transcript: string,
): Promise<TakeawayResult> {
    const client = getAIClient();

    const trimmed = transcript.slice(0, LIMITS.MAX_TRANSCRIPT_CHARS);

    const response = await client.chat.completions.create({
        model: MODELS.SUMMARY,
        temperature: 0.3,
        max_tokens: 500,
        messages: [
            {
                role: "system",
                content: `You are a learning assistant for the Cash Offer Conversion School, a training program for real estate operators who buy houses with cash offers. Extract the most actionable key takeaways from episode transcripts. Be specific and practical — operators want tactics they can apply today, not vague advice. Return ONLY a JSON array of 3–5 strings, each a concise takeaway sentence. No markdown, no numbering, just the JSON array.`,
            },
            {
                role: "user",
                content: `Episode: "${episodeTitle}"\n\nTranscript:\n${trimmed}`,
            },
        ],
    });

    const content = response.choices[0]?.message?.content ?? "[]";
    let takeaways: string[];
    try {
        takeaways = JSON.parse(content);
        if (!Array.isArray(takeaways)) takeaways = [];
    } catch {
        // Fallback: split by newlines if JSON parse fails
        takeaways = content
            .split("\n")
            .map((l: string) => l.replace(/^[-•*\d.]+\s*/, "").trim())
            .filter((l: string) => l.length > 10);
    }

    return {
        takeaways: takeaways.slice(0, 5),
        model: MODELS.SUMMARY,
        tokenCount: response.usage?.total_tokens ?? 0,
    };
}

// ── Discussion Digest ──

export async function generateDigest(
    episodeTitle: string,
    discussionPosts: Array<{ threadTitle: string; body: string; helpfulCount: number }>,
): Promise<DigestResult> {
    const client = getAIClient();

    // Truncate posts to limit
    const posts = discussionPosts.slice(0, LIMITS.MAX_DISCUSSION_POSTS);
    const postsText = posts
        .map((p) => `[Thread: ${p.threadTitle}] (${p.helpfulCount} helpful) ${p.body.slice(0, 500)}`)
        .join("\n\n");

    const response = await client.chat.completions.create({
        model: MODELS.SUMMARY,
        temperature: 0.3,
        max_tokens: 800,
        messages: [
            {
                role: "system",
                content: `You are a learning assistant summarizing student discussion for the Cash Offer Conversion School. Identify the key themes, most helpful insights, and common questions from discussion posts about a specific episode. Return a JSON object with three fields: "summary" (2-3 sentence overview), "themes" (array of 3-5 theme strings), "topQuestions" (array of 2-3 common question strings). No markdown, just the JSON object.`,
            },
            {
                role: "user",
                content: `Episode: "${episodeTitle}"\n\nDiscussion Posts:\n${postsText}`,
            },
        ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let parsed: { summary?: string; themes?: string[]; topQuestions?: string[] };
    try {
        parsed = JSON.parse(content);
    } catch {
        parsed = { summary: content, themes: [], topQuestions: [] };
    }

    return {
        summary: parsed.summary ?? "",
        themes: parsed.themes ?? [],
        topQuestions: parsed.topQuestions ?? [],
        model: MODELS.SUMMARY,
        tokenCount: response.usage?.total_tokens ?? 0,
    };
}

// ── Reflection Prompts ──

export async function generateReflectionPrompts(
    episodeTitle: string,
    transcript: string,
): Promise<ReflectionResult> {
    const client = getAIClient();

    const trimmed = transcript.slice(0, LIMITS.MAX_TRANSCRIPT_CHARS);

    const response = await client.chat.completions.create({
        model: MODELS.SUMMARY,
        temperature: 0.5,
        max_tokens: 400,
        messages: [
            {
                role: "system",
                content: `You are a learning coach for the Cash Offer Conversion School, a training program for real estate operators. Generate 3 reflection questions that force the learner to APPLY what they learned to their own business. Questions should be specific to the episode content, not generic. They should push operators to think about what they'll change in their workflow, scripts, or habits. Return ONLY a JSON array of 3 strings. No markdown, no numbering.`,
            },
            {
                role: "user",
                content: `Episode: "${episodeTitle}"\n\nTranscript:\n${trimmed}`,
            },
        ],
    });

    const content = response.choices[0]?.message?.content ?? "[]";
    let prompts: string[];
    try {
        prompts = JSON.parse(content);
        if (!Array.isArray(prompts)) prompts = [];
    } catch {
        prompts = content
            .split("\n")
            .map((l: string) => l.replace(/^[-•*\d.]+\s*/, "").trim())
            .filter((l: string) => l.length > 10);
    }

    return {
        prompts: prompts.slice(0, 3),
        model: MODELS.SUMMARY,
        tokenCount: response.usage?.total_tokens ?? 0,
    };
}

// ── Best Moments Detection (Phase 6 Feature 3) ──

export interface BestMoment {
    title: string;
    timestampSeconds: number | null;
    source: "transcript" | "discussion";
    description: string;
}

export interface BestMomentResult {
    moments: BestMoment[];
    model: string;
    tokenCount: number;
}

export async function generateBestMoments(
    episodeTitle: string,
    transcript: string,
    discussionPosts: Array<{ threadTitle: string; body: string; helpfulCount: number }>,
): Promise<BestMomentResult> {
    const client = getAIClient();

    const trimmed = transcript.slice(0, LIMITS.MAX_TRANSCRIPT_CHARS);
    const posts = discussionPosts.slice(0, 50);
    const postsText = posts
        .map((p) => `[${p.threadTitle}] (${p.helpfulCount} helpful) ${p.body.slice(0, 300)}`)
        .join("\n");

    const response = await client.chat.completions.create({
        model: MODELS.SUMMARY,
        temperature: 0.3,
        max_tokens: 800,
        messages: [
            {
                role: "system",
                content: `You are a learning analyst for the Cash Offer Conversion School. Identify the 3-5 most valuable learning moments in an episode based on the transcript and student discussion. Each moment should be a specific, actionable insight — not a vague topic.

Return a JSON array of objects, each with:
- "title": short moment title (max 80 chars)
- "timestampSeconds": approximate seconds into the episode (null if unknown)
- "source": "transcript" or "discussion"
- "description": one sentence explaining why this moment is valuable (max 150 chars)

Prioritize moments that students discussed or found most helpful. No markdown, just JSON.`,
            },
            {
                role: "user",
                content: `Episode: "${episodeTitle}"\n\nTranscript:\n${trimmed}\n\nStudent Discussion:\n${postsText || "(No discussion yet)"}`,
            },
        ],
    });

    const content = response.choices[0]?.message?.content ?? "[]";
    let moments: BestMoment[];
    try {
        moments = JSON.parse(content);
        if (!Array.isArray(moments)) moments = [];
    } catch {
        moments = [];
    }

    // Validate and sanitize
    moments = moments.slice(0, 5).map((m) => ({
        title: String(m.title ?? "").slice(0, 80),
        timestampSeconds: typeof m.timestampSeconds === "number" && m.timestampSeconds >= 0
            ? Math.round(m.timestampSeconds)
            : null,
        source: m.source === "discussion" ? "discussion" : "transcript",
        description: String(m.description ?? "").slice(0, 150),
    }));

    return {
        moments,
        model: MODELS.SUMMARY,
        tokenCount: response.usage?.total_tokens ?? 0,
    };
}

// ── Cohort Signals (Phase 6 Feature 4) ──

export interface CohortSignal {
    signalType: "most_discussed" | "common_pattern" | "top_takeaway";
    title: string;
    description: string;
    episodeId?: string;
    episodeTitle?: string;
}

export interface CohortSignalResult {
    signals: CohortSignal[];
    model: string;
    tokenCount: number;
}

export async function generateCohortSignals(
    episodeStats: Array<{
        episodeId: string;
        episodeTitle: string;
        threadCount: number;
        postCount: number;
        helpfulCount: number;
    }>,
): Promise<CohortSignalResult> {
    const client = getAIClient();

    const statsText = episodeStats
        .slice(0, 20)
        .map((s) => `"${s.episodeTitle}" — ${s.threadCount} threads, ${s.postCount} posts, ${s.helpfulCount} helpful reactions`)
        .join("\n");

    const response = await client.chat.completions.create({
        model: MODELS.SUMMARY,
        temperature: 0.4,
        max_tokens: 600,
        messages: [
            {
                role: "system",
                content: `You are a learning analyst for the Cash Offer Conversion School. Based on recent cohort activity data, generate 2-3 actionable signals for the program operator.

Return a JSON array of objects, each with:
- "signalType": one of "most_discussed", "common_pattern", "top_takeaway"
- "title": short signal title (max 60 chars)
- "description": one sentence explanation (max 120 chars)

Focus on patterns that would help operators guide learners. No markdown, just JSON.`,
            },
            {
                role: "user",
                content: `Recent Cohort Activity (last 7 days):\n${statsText || "(No activity)"}`,
            },
        ],
    });

    const content = response.choices[0]?.message?.content ?? "[]";
    let signals: CohortSignal[];
    try {
        signals = JSON.parse(content);
        if (!Array.isArray(signals)) signals = [];
    } catch {
        signals = [];
    }

    // Tag most_discussed with the actual episode data
    const topEpisode = episodeStats[0];
    signals = signals.slice(0, 3).map((s) => ({
        signalType: (["most_discussed", "common_pattern", "top_takeaway"].includes(s.signalType)
            ? s.signalType
            : "common_pattern") as CohortSignal["signalType"],
        title: String(s.title ?? "").slice(0, 60),
        description: String(s.description ?? "").slice(0, 120),
        episodeId: s.signalType === "most_discussed" && topEpisode ? topEpisode.episodeId : undefined,
        episodeTitle: s.signalType === "most_discussed" && topEpisode ? topEpisode.episodeTitle : undefined,
    }));

    return {
        signals,
        model: MODELS.SUMMARY,
        tokenCount: response.usage?.total_tokens ?? 0,
    };
}

// ── Content Moderation (Phase E) ──

export interface ModerationResult {
    flagged: boolean;
    reason: string | null;
    confidence: number; // 0.0 – 1.0
}

export async function moderateContent(
    text: string,
    context: "thread_title" | "post_body",
): Promise<ModerationResult> {
    if (!text || text.trim().length === 0) {
        return { flagged: false, reason: null, confidence: 1.0 };
    }

    try {
        const client = getAIClient();

        const response = await client.chat.completions.create({
            model: MODELS.SUMMARY,
            temperature: 0,
            max_tokens: 150,
            messages: [
                {
                    role: "system",
                    content: `You are a content moderation assistant for the Cash Offer Lead School, a professional training community for real estate operators who buy houses with cash offers.

Evaluate the following ${context === "thread_title" ? "discussion thread title" : "discussion post"} for community guideline violations.

FLAG content that contains:
- Hate speech, slurs, or personal attacks
- Spam, advertising, or unsolicited promotion
- Personally identifiable information (phone numbers, addresses, SSNs)
- Sexually explicit content
- Threats or harassment

DO NOT FLAG content that:
- Discusses real estate deals, cash offers, properties, or market conditions
- Uses industry jargon (ARV, comps, wholesale, assignment, etc.)
- Contains strong opinions about business strategy
- Includes dollar amounts or deal figures (this is normal in RE)
- Uses casual or informal language

Return ONLY a JSON object: {"flagged": boolean, "reason": string|null, "confidence": number}
- confidence: 0.0 to 1.0 (how sure you are)
- reason: short explanation if flagged, null if not flagged
No markdown, just JSON.`,
                },
                {
                    role: "user",
                    content: text.slice(0, 2000),
                },
            ],
        });

        const raw = response.choices[0]?.message?.content ?? "{}";
        let parsed: { flagged?: boolean; reason?: string | null; confidence?: number };
        try {
            parsed = JSON.parse(raw);
        } catch {
            return { flagged: false, reason: null, confidence: 0 };
        }

        return {
            flagged: Boolean(parsed.flagged),
            reason: parsed.flagged ? (parsed.reason ?? "Flagged by AI moderation") : null,
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
        };
    } catch (err) {
        // Fail-open: if AI call fails, content passes through
        console.error("[moderateContent] AI moderation failed, allowing content:", err);
        return { flagged: false, reason: null, confidence: 0 };
    }
}
