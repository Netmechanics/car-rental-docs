import type { VectorStore } from "../indexing/store.js";

export function listSections(store: VectorStore): object {
  const byPage = new Map<string, { title: string; sections: string[] }>();

  for (const chunk of store.getAllChunks()) {
    if (!byPage.has(chunk.relPath)) {
      byPage.set(chunk.relPath, { title: chunk.pageTitle, sections: [] });
    }
    const entry = byPage.get(chunk.relPath)!;
    if (chunk.section && !entry.sections.includes(chunk.section)) {
      entry.sections.push(chunk.section);
    }
  }

  const pages = [...byPage.entries()].map(([path, { title, sections }]) => ({
    path,
    title,
    sections,
  }));

  return { pages };
}
