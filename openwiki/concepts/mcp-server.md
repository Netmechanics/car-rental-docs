---
type: mcp-server-architecture
title: MCP Server Architecture
description: Conceptual model of the nmecar docs MCP server — the ingest→index→serve startup pipeline, the three retrieval-only MCP tools, an in-memory cosine vector store with content-hash disk cache, and a stateless Streamable HTTP transport.
tags: [mcp-server, vector-index, embeddings, streamable-http, retrieval, nmecar]
verified:
  - by: openwiki/0.4.3
    at: 2026-09-04T12:40:12.458Z
sources:
  - id: openwiki-source-25c92de403cf735f04b1580d
    resource: repo://MCP_SERVER_PLAN.md
  - id: openwiki-source-b2d086d65d6d4185bba54bbd
    resource: repo://mcp-server/Dockerfile
  - id: openwiki-source-c373fa2f3980420c295ffe54
    resource: repo://mcp-server/README.md
  - id: openwiki-source-df5b55cdd2353512e70211f9
    resource: repo://mcp-server/src/config.ts
  - id: openwiki-source-f5993cd5ff403bf40a0eb665
    resource: repo://mcp-server/src/index.ts
  - id: openwiki-source-98cdf74ff56a31e0e37165a2
    resource: repo://mcp-server/src/indexing/embed.ts
  - id: openwiki-source-e21117b284f783a4aa49a395
    resource: repo://mcp-server/src/indexing/hash.ts
  - id: openwiki-source-fa60629d432927f2e09d474a
    resource: repo://mcp-server/src/indexing/store.ts
  - id: openwiki-source-2e8c5314f847f65f3082cd1a
    resource: repo://mcp-server/src/ingest/chunk.ts
  - id: openwiki-source-d818db1b591ed1b606cdce28
    resource: repo://mcp-server/src/ingest/loadAdoc.ts
  - id: openwiki-source-b721192bd4a62080a29f5bbc
    resource: repo://mcp-server/src/ingest/render.ts
  - id: openwiki-source-777363cdf2c969971937b51e
    resource: repo://mcp-server/src/ingest/resolveMacros.ts
  - id: openwiki-source-61d8d4eaa276fd722fa083c9
    resource: repo://mcp-server/src/mcp/httpTransport.ts
  - id: openwiki-source-5a4b03705e6b83f35ae8b8c1
    resource: repo://mcp-server/src/mcp/server.ts
  - id: openwiki-source-049836ebe884f0e4a855dba5
    resource: repo://mcp-server/src/tools/getPage.ts
  - id: openwiki-source-0c2c347d1a40a921cb6e25a5
    resource: repo://mcp-server/src/tools/listSections.ts
  - id: openwiki-source-cda82de14d7658b1149da4b5
    resource: repo://mcp-server/src/tools/searchDocs.ts
  - id: openwiki-source-0a1a9e1753a33e0fc6d20934
    resource: repo://mcp-server/test/chunk.test.ts
  - id: openwiki-source-cce7e7963f6760ed74146799
    resource: repo://mcp-server/test/resolveMacros.test.ts
  - id: openwiki-source-c880a918e434ac0476aecdb1
    resource: repo://mcp-server/test/smoke.ts
  - id: openwiki-source-c3de0750396abf9c6026ee7a
    resource: repo://mcp-server/test/store.test.ts
generated: { by: "openwiki/0.4.3", at: "2026-09-04T12:40:12.458Z" }
---

# MCP Server Architecture

The **nmecar docs MCP server** (under `mcp-server/`) is a custom, retrieval-only Model Context Protocol service. Its single job is to turn the repository's AsciiDoc corpus into a searchable vector index at process startup and expose that index to a future AI agent through three MCP tools served over Streamable HTTP. It deliberately does **not** generate answers with an LLM — answer synthesis is the agent's responsibility, which is out of scope for the server. This page is the conceptual model of the server: the startup data flow, the tool contracts, the in-memory store with its content-hash cache, and the stateless transport. It orients the reader before diving into the per-workflow detail in [Ingest &amp; index pipeline](../workflows/ingest-index-pipeline.md) and [MCP request flow](../workflows/mcp-request-flow.md).

The server is one of two independent consumers of a single AsciiDoc corpus (the other being the Antora site — see [Repository Architecture Overview](../architecture/overview.md)). It shares the corpus but shares nothing else: no Antora configuration, no build pipeline, no runtime. Content is baked into its Docker image as flat `docs/pages`, `docs/partials`, and `docs/examples` folders, pointed at by `DOCS_ROOT`, `PARTIALS_ROOT`, and `EXAMPLES_ROOT`.

## Startup data flow

`mcp-server/src/index.ts` orchestrates one sequential startup pass. Nothing is served until the index is ready: the HTTP server only starts after the vector store is loaded or built.

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
flowchart TD
  load["loadAdoc<br/>walk DOCS_ROOT, skip stubs"]
  macros["resolveMacros<br/>inline partial$/example$, drop xref/image/Kroki"]
  render["renderAdoc<br/>AsciiDoc → HTML → plain text"]
  chunk["chunkPage<br/>split by headings, add context prefix"]
  hash["contentHash<br/>sha256 of sorted chunk text + PIPELINE_VERSION + model"]
  cache{cache hit?}
  loadIndex["VectorStore.loadFromDisk<br/>load cached JSON index"]
  embed["embedder.embed<br/>OpenAI text-embedding-3-small, batched"]
  build["VectorStore.build<br/>normalize vectors"]
  save["VectorStore.saveToDisk<br/>index-<hash>.json on volume"]
  http["Express HTTP server on PORT<br/>/health + /mcp"]

  load --> macros --> render --> chunk --> hash --> cache
  cache -->|yes| loadIndex --> http
  cache -->|no| embed --> build --> save --> http
```

*The nmecar MCP server startup sequence: ingest the .adoc corpus, compute a content hash, then either load a cached vector index or build one from embeddings before serving.*

The steps in order are:

1. **Load** — `loadAdoc(config.DOCS_ROOT)` walks the `.adoc` tree and skips stub pages (files with fewer than 50 non-whitespace characters after the first `= Heading` line), returning `{ path, relPath, raw }` per file.
2. **Ingest** — per file: `resolveMacros` inlines Antora `partial$`/`example$` includes (recursively, max depth 10) and normalizes `xref:`/`image:`/Kroki blocks; `renderAdoc` converts AsciiDoc → HTML via `@asciidoctor/core` then to plain text via `html-to-text`; `chunkPage` splits by heading into metadata-bearing chunks, each prefixed with `«{pageTitle} › {sectionHeading}»` to improve retrieval.
3. **Hash** — `contentHash(allChunks, embedder.model)` computes a sha256 over the chunk texts (sorted by id), a hardcoded `PIPELINE_VERSION`, and the embedding model name.
4. **Cache or build** — `VectorStore.loadFromDisk(config.DATA_DIR, hash)` is tried first. A matching cached `index-<hash>.json` is loaded without calling the embeddings API. On a miss, the store embeds all chunks (batched, ≤100 per request, with retry/backoff on 429/5xx), L2-normalizes each vector, and persists the full `StoredVector[]` to disk.
5. **Serve** — `createHttpApp(() => buildMcpServer(store, embedder))` boots Express on `PORT` (default `8765`), exposing `GET /health` and `POST /mcp`.

Two invariants follow from this flow. First, **index freshness requires an image rebuild**: because the content is baked in and indexing happens at startup, serving updated docs means rebuilding and redeploying the image (an accepted trade-off for the current change frequency). Second, **cache validity is content-hash-gated**: a second boot with an unchanged corpus loads the cached JSON and skips the embeddings API entirely; any change to chunk text, `PIPELINE_VERSION`, or the embedding model name invalidates the cache and forces a fresh build.

## In-memory vector store and the content-hash cache

The corpus is small — roughly 40 Greek-language pages, ~15,400 words. At that scale an external vector database is unjustified, so the server keeps the entire index in memory and uses a simple cosine store.

`VectorStore` (in `mcp-server/src/indexing/store.ts`) holds a `StoredVector[]` where each vector is **L2-normalized to unit length at build time**. Search then reduces to a dot product (`score = dotProduct(storedVector, normalize(queryVec))`), scanned linearly across all vectors, sorted descending, and truncated to `k`. This is acceptable precisely because the corpus is small; it is the architectural reason no external vector DB is needed.

Persistence is a single JSON file per content hash, written to the `DATA_DIR` volume:

- **Write**: `saveToDisk(dataDir, hash)` creates `${dataDir}/index-${hash}.json` containing `{ hash, vectors }`.
- **Read**: `loadFromDisk(dataDir, expectedHash)` reads the matching file, returns `null` on any read/parse error or hash mismatch. The startup path in `index.ts` treats `null` as a cache miss and rebuilds.
- **Invalidation** is implicit: the file is keyed by the sha256 content hash, so a changed corpus, a bumped `PIPELINE_VERSION`, or a different embedding model name produces a different filename and a miss. The old file is left behind (not garbage-collected), but is simply ignored.

`PIPELINE_VERSION` (currently `"1"`) is a constant in `mcp-server/src/indexing/hash.ts`. It exists to let a maintainer force a full re-index after changing the ingestion/chunking logic without editing content — bumping it invalidates every cached index.

The embedding provider is selected by `EMBEDDING_PROVIDER` and is provider-agnostic behind the `Embedder` interface (`{ model, dims, embed(texts) }`). The default and only implemented provider is OpenAI `text-embedding-3-small` (1536 dims); Gemini is a documented alternative but not yet implemented in `createEmbedder` (it throws). See [Embeddings Providers](../integrations/embeddings-providers.md).

## The three MCP tools

`buildMcpServer(store, embedder)` in `mcp-server/src/mcp/server.ts` constructs an `McpServer({ name: "nmecar-docs", version: "0.1.0" })` and registers exactly three retrieval tools. Tool inputs are validated with `zod` schemas; every tool returns MCP `content` as a single `text` part containing a JSON-serialized payload.

### `search_nmecar_docs` — semantic search

Embeds the query with the same embedder used to build the index, runs `store.search(queryVec, k)`, and returns the top-*k* chunks.

- **Input schema**: `query: z.string().min(1)` (the question or topic); `k: z.number().int().min(1).max(20).optional()` (result count, default `5`).
- **Return shape** (JSON inside the text content):
  ```json
  {
    "results": [
      { "page": "booking/discounts.adoc", "title": "Εκπτώσεις",
        "section": "Προτεραιότητα εφαρμογής", "score": 0.872, "text": "…" }
    ]
  }
  ```
  `score` is the cosine similarity rounded to three decimals. `text` is the chunk text including its `«title › section»` context prefix.

### `get_doc_page` — full page text

Returns the rendered text of a single page by its repository-relative path.

- **Input schema**: `path: z.string().min(1)` (e.g. `booking/discounts.adoc`).
- **Return shape**: `{ path, title, text }` where `text` is the page's chunks joined with `\n\n---\n\n`. If no chunk matches the path, the tool returns `isError: true` with `{ error: "Page not found: …" }` rather than crashing.
- **Reconstruction caveat**: the page is *reconstructed* from indexed chunks, not re-rendered from the source, so it carries chunk boundaries and context prefixes. This is acceptable because the tool is for retrieval, not for rendering an exact copy of the AsciiDoc.

### `list_doc_sections` — discovery

Lists every page and its section headings, derived from chunk metadata. Takes no input.

- **Input schema**: `{}` (empty).
- **Return shape**: `{ pages: [{ path, title, sections: [...] }] }`, grouped and deduplicated by `relPath`, with non-empty `section` headings collected per page in chunk order.

## Stateless Streamable HTTP transport

The server uses MCP's **Streamable HTTP transport in stateless mode**. The key architectural choice, in `mcp-server/src/mcp/httpTransport.ts`, is that **a fresh `McpServer` and `StreamableHTTPServerTransport` are created for every `/mcp` request**:

```ts
app.all("/mcp", authMiddleware, async (req, res) => {
  const mcpServer = serverFactory();          // buildMcpServer(store, embedder)
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,           // stateless — no sessions
  });
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
```

`sessionIdGenerator: undefined` tells the SDK not to allocate or track sessions. This is the recommended pattern for **read-only, stateless** MCP servers: there is no per-session state to preserve because each tool call is a self-contained lookup against the shared, immutable in-memory `VectorStore`. Creating a server per request keeps the transport simple, avoids session lifecycle and cleanup concerns, and is cheap because the only per-request allocation is the `McpServer` wrapper and transport — the vector index itself is held by the long-lived `store` captured in the factory closure.

This is why `index.ts` passes a *factory* (`() => buildMcpServer(store, embedder)`) rather than a server instance: `createHttpApp` invokes the factory once per request to get a fresh server, while `store` and `embedder` (the expensive, shared state) are created once at startup and reused across all requests.

### HTTP surface and middleware

- `GET /health` → `{ status: "ok" }` (no auth; used by the Docker `HEALTHCHECK`).
- `POST /mcp` (plus `GET`/`DELETE` per the SDK) → MCP JSON-RPC over the streamable transport, behind `authMiddleware`.
- **Auth middleware**: if `MCP_AUTH_TOKEN` is unset, the middleware passes through (local dev). If set, it requires `Authorization: Bearer <token>` and returns `401` on mismatch. `/health` is registered before the auth-protected route and is exempt.
- **CORS middleware**: controlled by `ALLOWED_ORIGINS` (default `*`, meaning allow all; otherwise a comma-separated allowlist of origins). Handles `OPTIONS` preflight with `204`.

### Response framing

Streamable HTTP responses are delivered as `text/event-stream` (SSE). Clients parse the `data:` line for the JSON-RPC envelope `{ result: { content: [...] } }` (or `{ error }`). The Phase 8 smoke harness (`mcp-server/test/smoke.ts`) demonstrates this: it `fetch`es `/mcp` with `Accept: application/json, text/event-stream`, then extracts the JSON from the SSE `data:` line. This is the contract a remote MCP client must honor when connecting via the documented config:

```json
{
  "mcpServers": {
    "nmecar-docs": {
      "url": "http://localhost:8765/mcp",
      "headers": { "Authorization": "Bearer your-secret-token" }
    }
  }
}
```

## Configuration and fail-fast validation

All runtime configuration comes from environment variables, parsed and validated with `zod` in `mcp-server/src/config.ts` at import time. Validation fails fast: an invalid `PORT`, a missing `DOCS_ROOT`/`PARTIALS_ROOT`/`EXAMPLES_ROOT`, or a missing API key for the selected provider all `console.error` and `process.exit(1)` before the server starts.

| Variable | Default | Role |
|---|---|---|
| `PORT` | `8765` | HTTP listen port |
| `DOCS_ROOT` | — | `.adoc` pages folder (required) |
| `PARTIALS_ROOT` | — | partials folder (required) |
| `EXAMPLES_ROOT` | — | examples folder (required) |
| `DATA_DIR` | `/data` | vector-index cache volume |
| `EMBEDDING_PROVIDER` | `openai` | `openai` or `gemini` |
| `OPENAI_API_KEY` | — | required when provider is `openai` |
| `OPENAI_EMBED_MODEL` | `text-embedding-3-small` | embedding model (also feeds the content hash) |
| `GEMINI_API_KEY` | — | required when provider is `gemini` |
| `MCP_AUTH_TOKEN` | — | bearer token; mandatory in production |
| `ALLOWED_ORIGINS` | `*` | CORS origins (comma-separated, or `*`) |
| `LOG_LEVEL` | `info` | `debug`/`info`/`warn`/`error` |

Because `OPENAI_EMBED_MODEL` feeds the content hash, changing the model invalidates the cache and forces a full re-embed on next startup.

## Extension points and failure semantics

- **New retrieval tool**: add a function in `mcp-server/src/tools/`, then register it inside `buildMcpServer` in `mcp-server/src/mcp/server.ts`. The shared `store`/`embedder` are already in scope; the new tool just needs a `zod` input schema and a JSON return.
- **New embedding provider**: implement the `Embedder` interface in `mcp-server/src/indexing/embed.ts` and add it to `createEmbedder`'s switch (the current code throws for anything but `openai`, so `gemini` is a stub). Because the model name is part of the content hash, switching providers/models safely invalidates the cache.
- **Embedding API failure**: `embed.ts` retries up to 3 times with exponential backoff on HTTP 429 and 5xx, and throws immediately on other statuses. A failure during `store.build` propagates to `main()` and `process.exit(1)`, so a cold start that cannot reach the embeddings API fails loudly rather than serving an empty index. A cache hit avoids the API entirely, so a warm restart is resilient to embeddings outages.
- **Per-request server failure**: if `mcpServer.connect` or `transport.handleRequest` throws, `httpTransport.ts` logs the error and, if no headers were sent yet, responds `500 Internal server error`. The per-request server model means one failed request cannot poison the next — each starts from a fresh `McpServer`.
- **Search returns empty, not an error**: `search_nmecar_docs` simply returns a `results` array (possibly empty) for a valid query; it does not return `isError`. Only `get_doc_page` uses `isError`, for a missing path.

## Tests that anchor the architecture

- `mcp-server/test/store.test.ts` — uses a fake embedder returning deterministic orthogonal vectors to prove `VectorStore` builds, searches with the correct top result, orders results by score, and round-trips through `saveToDisk`/`loadFromDisk` (including returning `null` on a wrong hash). This is the test that pins the in-memory cosine store and the cache contract.
- `mcp-server/test/resolveMacros.test.ts` — covers every macro transformation: Kroki block removal (both `....` and `----` delimiters), `partial$` inlining, `nav_*` skipping, `example$` inlining as a code fence, `xref` replacement (and drop when link text is empty), `image::` alt replacement (and drop when empty), and recursive partial includes. This is the brittle-ist part of the pipeline, so it is the most heavily tested.
- `mcp-server/test/chunk.test.ts` — verifies that `chunkPage` always yields at least one chunk, that ids are unique, that the context prefix contains the page title, that no chunk exceeds ~1100 tokens, and that `tokensApprox` is consistent with text length.
- `mcp-server/test/smoke.ts` — the Phase 8 retrieval-quality harness: 10 real Greek queries posted to a running server, asserting the expected page appears in top-3 (target ≥8/10) and top-1 (target ≥6/10). This is the end-to-end check that the ingest→index→serve pipeline produces useful Greek-language semantic search.

For the deployment and operational view — Docker build, CI to GHCR, and the `/data` volume lifecycle — see [MCP Deployment](../operations/mcp-deployment.md).
