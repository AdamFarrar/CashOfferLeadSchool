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
