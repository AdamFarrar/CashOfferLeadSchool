import { describe, it, expect } from "vitest";
import { chunkTranscript } from "../src/embeddings";
import type { TranscriptChunk, EmbeddingResult } from "../src/embeddings";

// =============================================================================
// Transcript Chunking Tests
// =============================================================================

describe("chunkTranscript", () => {
    it("returns empty array for empty transcript", () => {
        expect(chunkTranscript("")).toEqual([]);
    });

    it("returns single chunk for short transcript", () => {
        const chunks = chunkTranscript("Hello world");
        expect(chunks).toHaveLength(1);
        expect(chunks[0].text).toBe("Hello world");
        expect(chunks[0].index).toBe(0);
    });

    it("splits long transcript into overlapping chunks", () => {
        const text = "A".repeat(1500);
        const chunks = chunkTranscript(text, 500, 100);
        expect(chunks.length).toBeGreaterThan(1);
    });

    it("chunks overlap by specified amount", () => {
        const text = "A".repeat(1000);
        const chunks = chunkTranscript(text, 500, 100);
        // Second chunk starts at 500-100=400
        expect(chunks[1].text.length).toBeLessThanOrEqual(500);
    });

    it("indexes chunks sequentially", () => {
        const text = "B".repeat(2000);
        const chunks = chunkTranscript(text, 500, 100);
        chunks.forEach((chunk, i) => {
            expect(chunk.index).toBe(i);
        });
    });

    it("default chunk size is 500", () => {
        const text = "C".repeat(600);
        const chunks = chunkTranscript(text);
        expect(chunks[0].text.length).toBe(500);
    });

    it("covers entire transcript (no text lost)", () => {
        const text = "ABCDEFGHIJ".repeat(100); // 1000 chars
        const chunks = chunkTranscript(text, 500, 100);
        // Last chunk should contain the end of the text
        const lastChunk = chunks[chunks.length - 1];
        expect(text.endsWith(lastChunk.text.slice(-10))).toBe(true);
    });
});

describe("EmbeddingResult type", () => {
    it("satisfies the interface", () => {
        const result: EmbeddingResult = {
            embedding: [0.1, 0.2, 0.3],
            model: "text-embedding-3-small",
            tokenCount: 42,
        };
        expect(result.embedding).toHaveLength(3);
        expect(typeof result.tokenCount).toBe("number");
    });
});

describe("TranscriptChunk type", () => {
    it("supports optional time fields", () => {
        const chunk: TranscriptChunk = {
            index: 0,
            text: "Hello",
            startSeconds: 0,
            endSeconds: 30,
        };
        expect(chunk.startSeconds).toBe(0);
    });

    it("works without time fields", () => {
        const chunk: TranscriptChunk = {
            index: 0,
            text: "Hello",
        };
        expect(chunk.startSeconds).toBeUndefined();
    });
});
