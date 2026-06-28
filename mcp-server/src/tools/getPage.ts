import type { VectorStore } from "../indexing/store.js";

export function getPage(store: VectorStore, pagePath: string): object {
  const chunks = store.getAllChunks().filter((c) => c.relPath === pagePath);
  if (chunks.length === 0) {
    throw new Error(`Page not found: ${pagePath}`);
  }
  const title = chunks[0].pageTitle;
  // Reconstruct full text by joining all chunks, stripping duplicate context prefixes
  const text = chunks.map((c) => c.text).join("\n\n---\n\n");
  return { path: pagePath, title, text };
}
