// =============================================================================
// Embeddings — Phase 5 (Feature 4: Smart Search — Stretch)
// =============================================================================
// Generates text-embedding-3-small vectors for transcript segments.
// Used for semantic search across all episodes.
// =============================================================================

import { getAIClient, MODELS } from "./client";

export interface EmbeddingResult {
    embedding: number[];
    model: string;
    tokenCount: number;
}

export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
    const client = getAIClient();

    const response = await client.embeddings.create({
        model: MODELS.EMBEDDING,
        input: text.slice(0, 8000), // text-embedding-3-small max is ~8k tokens
    });

    return {
        embedding: response.data[0]?.embedding ?? [],
        model: MODELS.EMBEDDING,
        tokenCount: response.usage?.total_tokens ?? 0,
    };
}

// ── Transcript Chunking ──

export interface TranscriptChunk {
    index: number;
    text: string;
    startSeconds?: number;
    endSeconds?: number;
}

/**
 * Split a transcript into overlapping chunks for embedding.
 * Each chunk is ~500 chars with 100-char overlap.
 */
export function chunkTranscript(
    transcript: string,
    chunkSize: number = 500,
    overlap: number = 100,
): TranscriptChunk[] {
    const chunks: TranscriptChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < transcript.length) {
        const end = Math.min(start + chunkSize, transcript.length);
        chunks.push({
            index,
            text: transcript.slice(start, end),
        });
        start += chunkSize - overlap;
        index++;
    }

    return chunks;
}
