// =============================================================================
// AI Package Barrel Export — Phase 5
// =============================================================================

export { getAIClient, MODELS, LIMITS } from "./client";

export {
    generateTakeaways,
    generateDigest,
    generateReflectionPrompts,
    type TakeawayResult,
    type DigestResult,
    type ReflectionResult,
} from "./generate";

export {
    episodeChat,
    type ChatMessage,
    type ChatResult,
} from "./chat";

export {
    generateEmbedding,
    chunkTranscript,
    type EmbeddingResult,
    type TranscriptChunk,
} from "./embeddings";
