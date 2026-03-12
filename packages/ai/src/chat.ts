// =============================================================================
// Episode Chat — Phase 5
// =============================================================================
// Conversational Q&A using episode transcript as context.
// Single transcript fits in context window — no RAG needed.
// Returns non-streaming for server action compatibility.
// =============================================================================

import { getAIClient, MODELS, LIMITS } from "./client";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ChatResult {
    answer: string;
    model: string;
    tokenCount: number;
}

const SYSTEM_PROMPT = `You are an AI learning assistant for the Cash Offer Conversion School, a training program for real estate operators who buy houses with cash offers.

You answer questions about the current episode based ONLY on the transcript provided. If the answer is not in the transcript, say so — do not hallucinate or make up information.

Keep answers concise (2-4 paragraphs max), practical, and focused on what an operator can apply to their business. Use the same direct, no-BS tone as the instructor.

If the user asks something unrelated to the episode content, politely redirect them to focus on the lesson material.`;

export async function episodeChat(
    episodeTitle: string,
    transcript: string,
    question: string,
    history: ChatMessage[] = [],
): Promise<ChatResult> {
    const client = getAIClient();

    // Validate inputs
    if (!question || question.length > LIMITS.MAX_QUESTION_LENGTH) {
        return {
            answer: "Please keep your question under 1,000 characters.",
            model: MODELS.CHAT,
            tokenCount: 0,
        };
    }

    const trimmedTranscript = transcript.slice(0, LIMITS.MAX_TRANSCRIPT_CHARS);
    const trimmedHistory = history.slice(-LIMITS.MAX_CHAT_HISTORY);

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
        {
            role: "user",
            content: `Episode: "${episodeTitle}"\n\nTranscript:\n${trimmedTranscript}\n\n---\nI will now ask questions about this episode.`,
        },
        { role: "assistant", content: "I've read the transcript. What would you like to know about this episode?" },
        ...trimmedHistory.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        })),
        { role: "user", content: question },
    ];

    const response = await client.chat.completions.create({
        model: MODELS.CHAT,
        temperature: 0.4,
        max_tokens: 1000,
        messages,
    });

    return {
        answer: response.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.",
        model: MODELS.CHAT,
        tokenCount: response.usage?.total_tokens ?? 0,
    };
}
