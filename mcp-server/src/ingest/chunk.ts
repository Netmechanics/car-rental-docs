import type { RenderedPage } from "./render.js";

export interface Chunk {
  id: string;
  relPath: string;
  pageTitle: string;
  section: string;
  text: string;
  tokensApprox: number;
}

// Approximate token count: 1 token ≈ 4 chars (conservative for Greek)
function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function makeId(relPath: string, slug: string, idx: number): string {
  return `${relPath}#${slug}-${idx}`;
}

function slugify(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function splitByParagraph(text: string, maxTokens: number): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const parts: string[] = [];
  let current = "";
  for (const para of paragraphs) {
    const candidate = current ? current + "\n\n" + para : para;
    if (approxTokens(candidate) > maxTokens && current) {
      parts.push(current);
      current = para;
    } else {
      current = candidate;
    }
  }
  if (current) parts.push(current);
  return parts.filter((p) => p.trim().length > 0);
}

export function chunkPage(page: RenderedPage): Chunk[] {
  const { relPath, title, text } = page;
  const MIN_TOKENS = 80;
  const MAX_TOKENS = 800;

  // Split on section (==) and subsection (===) headings
  // We work on the raw text lines rather than the rendered HTML
  // Rendered text has headings as plain text lines with no == prefix,
  // so we need a different approach: split on double-newline isolated lines
  // that look like headings in rendered text.
  // Better: we'll keep the heading markers by looking at the original — but
  // render.ts already stripped them. So we split on blank-line-separated
  // blocks and use reasonable heuristics.
  //
  // For clean splitting, we use the title as the first section and look for
  // lines that are short (< 80 chars) and followed by content — potential headings.

  // Simple approach: split on lines that are potential section headings
  // (short, non-empty, preceded and followed by blank lines)
  const HEADING_RE = /\n{2,}([^\n]{1,120})\n{1,}(?=[^\n])/g;

  const sections: Array<{ heading: string; text: string }> = [];
  let lastIndex = 0;
  let currentHeading = "";

  const intro = text.slice(0, text.search(HEADING_RE) > 0 ? text.search(HEADING_RE) : text.length);
  if (intro.trim()) {
    sections.push({ heading: "", text: intro.trim() });
  }

  let match: RegExpExecArray | null;
  const re = /\n{2,}([^\n]{1,120})\n(?=[^\n])/g;
  re.lastIndex = 0;

  // Fallback: treat the entire text as one section and split by paragraph
  // This is the most reliable approach for rendered plain text
  const rawSections = text.split(/\n{3,}/);

  sections.length = 0; // reset

  let pendingHeading = "";
  let pendingText = "";

  for (const block of rawSections) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    // Heuristic: single short line at start of block = heading
    if (lines.length <= 2 && trimmed.length < 100 && !trimmed.includes(".") && !trimmed.includes(",")) {
      if (pendingText.trim()) {
        sections.push({ heading: pendingHeading, text: pendingText.trim() });
      }
      pendingHeading = trimmed;
      pendingText = "";
    } else {
      pendingText += (pendingText ? "\n\n" : "") + trimmed;
    }
  }
  if (pendingText.trim()) {
    sections.push({ heading: pendingHeading, text: pendingText.trim() });
  }

  // If no sections were detected, treat whole text as one chunk
  if (sections.length === 0) {
    sections.push({ heading: "", text: text.trim() });
  }

  const chunks: Chunk[] = [];
  let globalIdx = 0;

  for (const sec of sections) {
    const contextPrefix = sec.heading
      ? `«${title} › ${sec.heading}»\n\n`
      : `«${title}»\n\n`;
    const fullText = contextPrefix + sec.text;

    if (approxTokens(fullText) > MAX_TOKENS) {
      // Split by paragraph
      const parts = splitByParagraph(sec.text, MAX_TOKENS - approxTokens(contextPrefix));
      for (const part of parts) {
        const chunkText = contextPrefix + part;
        chunks.push({
          id: makeId(relPath, slugify(sec.heading || title), globalIdx++),
          relPath,
          pageTitle: title,
          section: sec.heading,
          text: chunkText,
          tokensApprox: approxTokens(chunkText),
        });
      }
    } else {
      chunks.push({
        id: makeId(relPath, slugify(sec.heading || title), globalIdx++),
        relPath,
        pageTitle: title,
        section: sec.heading,
        text: fullText,
        tokensApprox: approxTokens(fullText),
      });
    }
  }

  // Merge tiny consecutive chunks from same page
  const merged: Chunk[] = [];
  for (const chunk of chunks) {
    const last = merged[merged.length - 1];
    if (last && chunk.tokensApprox < MIN_TOKENS && last.relPath === chunk.relPath) {
      last.text += "\n\n" + chunk.text;
      last.tokensApprox = approxTokens(last.text);
    } else {
      merged.push({ ...chunk });
    }
  }

  return merged;
}
