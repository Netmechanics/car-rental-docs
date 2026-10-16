import type { VectorStore } from "../indexing/store.js";
import { getDocUrl } from "./url.js";

export function listSections(store: VectorStore): object {
  const byPage = new Map<
    string,
    { title: string; url: string; sections: Array<{ name: string; url: string }> }
  >();

  for (const chunk of store.getAllChunks()) {
    if (!byPage.has(chunk.relPath)) {
      byPage.set(chunk.relPath, {
        title: chunk.pageTitle,
        url: getDocUrl(chunk.relPath),
        sections: [],
      });
    }
    const entry = byPage.get(chunk.relPath)!;
    if (chunk.section && !entry.sections.some((s) => s.name === chunk.section)) {
      entry.sections.push({
        name: chunk.section,
        url: getDocUrl(chunk.relPath, chunk.section),
      });
    }
  }

  const pages = [...byPage.entries()].map(([path, { title, url, sections }]) => ({
    path,
    title,
    url,
    sections,
  }));

  return { pages };
}
