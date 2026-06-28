import fs from "fs/promises";
import path from "path";
import type { Chunk } from "../ingest/chunk.js";
import type { Embedder } from "./embed.js";
import { logger } from "../logger.js";

interface StoredVector {
  id: string;
  vector: number[];  // normalized (unit length)
  chunk: Chunk;
}

interface CacheFile {
  hash: string;
  vectors: StoredVector[];
}

function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  if (norm === 0) return v;
  return v.map((x) => x / norm);
}

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

export class VectorStore {
  private vectors: StoredVector[] = [];

  async build(chunks: Chunk[], embedder: Embedder): Promise<void> {
    logger.info("Building vector index", { chunks: chunks.length, model: embedder.model });
    const texts = chunks.map((c) => c.text);
    const embeddings = await embedder.embed(texts);
    this.vectors = chunks.map((chunk, i) => ({
      id: chunk.id,
      vector: normalize(embeddings[i]),
      chunk,
    }));
    logger.info("Vector index built", { vectors: this.vectors.length });
  }

  search(queryVec: number[], k: number): { chunk: Chunk; score: number }[] {
    const qNorm = normalize(queryVec);
    const scored = this.vectors.map((sv) => ({
      chunk: sv.chunk,
      score: dotProduct(sv.vector, qNorm),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  async saveToDisk(dataDir: string, hash: string): Promise<void> {
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, `index-${hash}.json`);
    const cacheFile: CacheFile = { hash, vectors: this.vectors };
    await fs.writeFile(filePath, JSON.stringify(cacheFile), "utf-8");
    logger.info("Vector index saved to disk", { path: filePath });
  }

  static async loadFromDisk(dataDir: string, expectedHash: string): Promise<VectorStore | null> {
    const filePath = path.join(dataDir, `index-${expectedHash}.json`);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const cacheFile: CacheFile = JSON.parse(raw);
      if (cacheFile.hash !== expectedHash) return null;
      const store = new VectorStore();
      store.vectors = cacheFile.vectors;
      logger.info("Vector index loaded from disk", { path: filePath, vectors: store.vectors.length });
      return store;
    } catch {
      return null;
    }
  }

  get size(): number {
    return this.vectors.length;
  }

  getAllChunks(): Chunk[] {
    return this.vectors.map((sv) => sv.chunk);
  }
}
