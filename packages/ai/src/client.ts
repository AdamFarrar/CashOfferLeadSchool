// =============================================================================
// OpenAI Client — Phase 5
// =============================================================================
// Lazy-initialized singleton. Never instantiated until first call.
// Uses gpt-4o-mini for cost efficiency on summaries/takeaways.
//
// NOTE: openai is loaded via require() to avoid TypeScript module resolution
// failures in Docker builds where packages/ai is not a recognized workspace
// project. The module IS installed via apps/web deps + serverExternalPackages.
// =============================================================================

/* eslint-disable @typescript-eslint/no-require-imports */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OpenAI = require("openai");

let _client: InstanceType<typeof OpenAI> | null = null;

export function getAIClient(): InstanceType<typeof OpenAI> {
    if (!_client) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is not set.");
        }
        _client = new OpenAI({ apiKey });
    }
    return _client;
}

// ── Model Constants ──

export const MODELS = {
    SUMMARY: "gpt-4o-mini" as const,
    CHAT: "gpt-4o-mini" as const,
    EMBEDDING: "text-embedding-3-small" as const,
} as const;

// ── Token Limits ──

export const LIMITS = {
    MAX_TRANSCRIPT_CHARS: 100_000,
    MAX_QUESTION_LENGTH: 1000,
    MAX_CHAT_HISTORY: 10,
    MAX_DISCUSSION_POSTS: 200,
} as const;
