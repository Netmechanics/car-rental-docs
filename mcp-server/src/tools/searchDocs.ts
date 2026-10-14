import type { VectorStore } from "../indexing/store.js";
import type { Embedder } from "../indexing/embed.js";
import { getDocUrl } from "./url.js";

export async function searchDocs(
  store: VectorStore,
  embedder: Embedder,
  query: string,
  k: number
): Promise<object> {
  const [queryVec] = await embedder.embed([query]);
  const hits = store.search(queryVec, k, query);
  return {
    results: hits.map((h) => ({
      page: h.chunk.relPath,
      title: h.chunk.pageTitle,
      section: h.chunk.section,
      url: getDocUrl(h.chunk.relPath, h.chunk.section),
      score: Math.round(h.score * 1000) / 1000,
      text: h.chunk.text,
    })),
  };
}
