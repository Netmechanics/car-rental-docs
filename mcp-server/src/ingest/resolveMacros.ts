import fs from "fs/promises";
import path from "path";

const MAX_DEPTH = 10;

// Kroki/diagram block patterns — both .... and ---- delimiters
const KROKI_BLOCK_RE =
  /\[\s*(?:plantuml|mermaid|graphviz|ditaa|blockdiag|seqdiag|actdiag|nwdiag|packetdiag|rackdiag|c4plantuml|erd|excalidraw|nomnoml|pikchr|structurizr|svgbob|umlet|vega|vegalite|wavedrom)[^\]]*\]\s*(?:\.{4}[\s\S]*?\.{4}|-{4}[\s\S]*?-{4})/gi;

const XREF_RE = /xref:[^\[]+\[([^\]]*)\]/g;
const IMAGE_RE = /image::?[^\[]*\[([^\]]*)\]/g;
const INCLUDE_PARTIAL_RE = /^include::partial\$([^\[\]]+)\[\]$/gm;
const INCLUDE_EXAMPLE_RE = /^include::example\$([^\[\]]+)\[([^\]]*)\]$/gm;

async function readFileOpt(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function resolveIncludes(
  src: string,
  partialsRoot: string,
  examplesRoot: string,
  depth: number
): Promise<string> {
  if (depth > MAX_DEPTH) return src;

  // Replace partial includes
  const partialMatches = [...src.matchAll(INCLUDE_PARTIAL_RE)];
  for (const m of partialMatches) {
    const partialFile = m[1];
    // Skip navigation partials — they're noise for embeddings
    if (partialFile.startsWith("nav_")) {
      src = src.replace(m[0], "");
      continue;
    }
    const partialPath = path.join(partialsRoot, partialFile);
    const content = await readFileOpt(partialPath);
    if (content) {
      // Recurse into the partial's own includes
      const resolved = await resolveIncludes(content, partialsRoot, examplesRoot, depth + 1);
      src = src.replace(m[0], resolved);
    } else {
      src = src.replace(m[0], "");
    }
  }

  // Replace example includes — wrap in a source block
  const exampleMatches = [...src.matchAll(INCLUDE_EXAMPLE_RE)];
  for (const m of exampleMatches) {
    const exampleFile = m[1];
    const examplePath = path.join(examplesRoot, exampleFile);
    const content = await readFileOpt(examplePath);
    if (content) {
      src = src.replace(m[0], `\n[source]\n----\n${content.trim()}\n----\n`);
    } else {
      src = src.replace(m[0], "");
    }
  }

  return src;
}

export async function resolveMacros(
  raw: string,
  partialsRoot: string,
  examplesRoot: string
): Promise<string> {
  let src = raw;

  // 1. Remove Kroki diagram blocks entirely (noise for embeddings)
  src = src.replace(KROKI_BLOCK_RE, "");

  // 2. Resolve includes (recursive)
  src = await resolveIncludes(src, partialsRoot, examplesRoot, 0);

  // 3. Replace xref with link text (or basename if empty)
  src = src.replace(XREF_RE, (_match, text) => text.trim() || "");

  // 4. Replace image macros with alt text (or drop if empty)
  src = src.replace(IMAGE_RE, (_match, alt) => alt.trim() || "");

  return src;
}
