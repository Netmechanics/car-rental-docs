import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VectorStore } from "../src/indexing/store.js";
import type { Embedder } from "../src/indexing/embed.js";
import type { Chunk } from "../src/ingest/chunk.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Fake embedder: returns deterministic orthogonal vectors
function fakeEmbedder(dim = 4): Embedder {
  return {
    model: "fake-model",
    dims: dim,
    async embed(texts: string[]): Promise<number[][]> {
      return texts.map((_, i) => {
        const v = new Array<number>(dim).fill(0);
        v[i % dim] = 1;
        return v;
      });
    },
  };
}

function makeChunk(id: string, text: string): Chunk {
  return {
    id,
    relPath: "test/page.adoc",
    pageTitle: "Test Page",
    section: id,
    text,
    tokensApprox: Math.ceil(text.length / 4),
  };
}

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "store-test-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("VectorStore", () => {
  it("builds and searches with correct top result", async () => {
    const chunks = [
      makeChunk("a", "Εκπτώσεις"),
      makeChunk("b", "Τιμολόγηση"),
      makeChunk("c", "Ρόλοι"),
    ];
    const embedder = fakeEmbedder();
    const store = new VectorStore();
    await store.build(chunks, embedder);

    // Query with a vector that points to first dimension → should match chunk "a"
    const results = store.search([1, 0, 0, 0], 1);
    expect(results.length).toBe(1);
    expect(results[0].chunk.id).toBe("a");
    expect(results[0].score).toBeCloseTo(1, 5);
  });

  it("returns k results ordered by score", async () => {
    const chunks = Array.from({ length: 5 }, (_, i) => makeChunk(`chunk-${i}`, `text ${i}`));
    const embedder = fakeEmbedder(5);
    const store = new VectorStore();
    await store.build(chunks, embedder);

    const results = store.search([0, 0, 1, 0, 0], 3);
    expect(results.length).toBe(3);
    // Scores should be descending
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("saves to disk and loads back with same hash", async () => {
    const chunks = [makeChunk("x", "Content")];
    const embedder = fakeEmbedder();
    const store = new VectorStore();
    await store.build(chunks, embedder);

    const hash = "testhash123";
    await store.saveToDisk(tmpDir, hash);

    const loaded = await VectorStore.loadFromDisk(tmpDir, hash);
    expect(loaded).not.toBeNull();
    expect(loaded!.size).toBe(1);

    const results = loaded!.search([1, 0, 0, 0], 1);
    expect(results[0].chunk.id).toBe("x");
  });

  it("returns null when loading with wrong hash", async () => {
    const chunks = [makeChunk("x", "Content")];
    const embedder = fakeEmbedder();
    const store = new VectorStore();
    await store.build(chunks, embedder);

    await store.saveToDisk(tmpDir, "hash-A");
    const loaded = await VectorStore.loadFromDisk(tmpDir, "hash-B");
    expect(loaded).toBeNull();
  });

  it("returns null when cache file does not exist", async () => {
    const loaded = await VectorStore.loadFromDisk(tmpDir, "nonexistent");
    expect(loaded).toBeNull();
  });
});
