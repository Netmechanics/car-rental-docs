import type { VectorStore } from "../indexing/store.js";
import type { Embedder } from "../indexing/embed.js";

export async function searchDocs(
  store: VectorStore,
  embedder: Embedder,
  query: string,
  k: number
): Promise<object> {
  const [queryVec] = await embedder.embed([query]);
  const hits = store.search(queryVec, k);
  return {
    results: hits.map((h) => ({
      page: h.chunk.relPath,
      title: h.chunk.pageTitle,
      section: h.chunk.section,
      score: Math.round(h.score * 1000) / 1000,
      text: h.chunk.text,
    })),
  };
}
