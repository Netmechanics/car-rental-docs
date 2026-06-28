// Verification script: npm run ingest:dump
// Writes extracted text to data/_dump/ for manual inspection

import fs from "fs/promises";
import path from "path";
import config from "../config.js";
import { loadAdoc } from "./loadAdoc.js";
import { resolveMacros } from "./resolveMacros.js";
import { renderAdoc } from "./render.js";
import { chunkPage } from "./chunk.js";

const dumpDir = path.join(config.DATA_DIR, "_dump");
await fs.mkdir(dumpDir, { recursive: true });

const files = await loadAdoc(config.DOCS_ROOT);
console.log(`Loaded ${files.length} .adoc files`);

for (const file of files) {
  const preprocessed = await resolveMacros(file.raw, config.PARTIALS_ROOT, config.EXAMPLES_ROOT);
  const rendered = renderAdoc(file.relPath, preprocessed);
  const chunks = chunkPage(rendered);

  const outDir = path.join(dumpDir, path.dirname(file.relPath));
  await fs.mkdir(outDir, { recursive: true });

  // Write rendered text
  const textFile = path.join(dumpDir, file.relPath.replace(".adoc", ".txt"));
  await fs.writeFile(textFile, rendered.text, "utf-8");

  // Write chunks summary
  const chunksFile = path.join(dumpDir, file.relPath.replace(".adoc", ".chunks.json"));
  await fs.writeFile(chunksFile, JSON.stringify(chunks.map(c => ({
    id: c.id,
    section: c.section,
    tokensApprox: c.tokensApprox,
    textPreview: c.text.slice(0, 200),
  })), null, 2), "utf-8");

  console.log(`  ${file.relPath}: ${rendered.text.length} chars, ${chunks.length} chunks`);
}

console.log(`\nDump written to ${dumpDir}`);
