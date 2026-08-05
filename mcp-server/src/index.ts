import config from "./config.js";
import { logger } from "./logger.js";
import { loadAdoc } from "./ingest/loadAdoc.js";
import { resolveMacros } from "./ingest/resolveMacros.js";
import { renderAdoc } from "./ingest/render.js";
import { chunkPage } from "./ingest/chunk.js";
import { createEmbedder } from "./indexing/embed.js";
import { VectorStore } from "./indexing/store.js";
import { contentHash } from "./indexing/hash.js";
import { buildMcpServer } from "./mcp/server.js";
import { createHttpApp } from "./mcp/httpTransport.js";

async function main() {
  logger.info("Starting nmecar docs MCP server");

  // 1. Load .adoc source files
  const files = await loadAdoc(config.DOCS_ROOT);
  logger.info("Loaded .adoc files", { count: files.length });

  // 2. Preprocess + render → chunks
  const allChunks = [];
  for (const file of files) {
    const preprocessed = await resolveMacros(file.raw, config.PARTIALS_ROOT, config.EXAMPLES_ROOT);
    const rendered = renderAdoc(file.relPath, preprocessed);
    const chunks = chunkPage(rendered);
    allChunks.push(...chunks);
  }
  logger.info("Chunked content", { totalChunks: allChunks.length });

  // 3. Embedder
  const embedder = createEmbedder();

  // 4. Check cache or build index
  const hash = contentHash(allChunks, embedder.model);
  logger.info("Content hash computed", { hash: hash.slice(0, 12) });

  let store = await VectorStore.loadFromDisk(config.DATA_DIR, hash);
  if (!store) {
    logger.info("Cache miss — building vector index (calling embeddings API)");
    store = new VectorStore();
    await store.build(allChunks, embedder);
    await store.saveToDisk(config.DATA_DIR, hash);
  } else {
    logger.info("Cache hit — loaded index from disk");
  }

  // 5. MCP server + HTTP — factory creates a fresh server per request (stateless mode)
  const app = createHttpApp(() => buildMcpServer(store, embedder));

  app.listen(config.PORT, () => {
    logger.info("MCP server ready", { port: config.PORT, vectors: store!.size });
  });
}

main().catch((err) => {
  logger.error("Fatal startup error", { error: String(err) });
  process.exit(1);
});
