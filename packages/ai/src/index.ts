// =============================================================================
// AI Package Barrel Export — Phase 5 + Phase 6
// =============================================================================

export { getAIClient, MODELS, LIMITS } from "./client";

export {
    generateTakeaways,
    generateDigest,
    generateReflectionPrompts,
    generateBestMoments,
    generateCohortSignals,
    moderateContent,
    type TakeawayResult,
    type DigestResult,
    type ReflectionResult,
    type BestMoment,
    type BestMomentResult,
    type CohortSignal,
    type CohortSignalResult,
    type ModerationResult,
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

export {
    evaluateCompletionGuidance,
    type GuidanceMessage,
    type GuidanceInput,
} from "./guidance";

