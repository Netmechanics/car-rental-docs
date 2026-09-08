---
type: pipeline
title: Ingestion & Indexing Pipeline
description: End-to-end data flow that turns .adoc files into a searchable vector index — file walking with stub skipping, macro resolution, AsciiDoc render and html-to-text, heading-based chunking with context prefixes, content-hash keyed embedding cache, L2-normalized cosine store, and the disk cache lifecycle.
tags: [mcp-server, ingest, indexing, embeddings, vector-store, chunking, cache, ascii-doc]
verified:
  - by: openwiki/0.4.3
    at: 2026-09-04T12:40:12.458Z
sources:
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
  - id: openwiki-source-bbdf9684076d5b01c8dd995f
    resource: repo://mcp-server/src/ingest/dump.ts
  - id: openwiki-source-d818db1b591ed1b606cdce28
    resource: repo://mcp-server/src/ingest/loadAdoc.ts
  - id: openwiki-source-b721192bd4a62080a29f5bbc
    resource: repo://mcp-server/src/ingest/render.ts
  - id: openwiki-source-777363cdf2c969971937b51e
    resource: repo://mcp-server/src/ingest/resolveMacros.ts
  - id: openwiki-source-0a1a9e1753a33e0fc6d20934
    resource: repo://mcp-server/test/chunk.test.ts
  - id: openwiki-source-cce7e7963f6760ed74146799
    resource: repo://mcp-server/test/resolveMacros.test.ts
  - id: openwiki-source-c3de0750396abf9c6026ee7a
    resource: repo://mcp-server/test/store.test.ts
generated: { by: "openwiki/0.4.3", at: "2026-09-04T12:40:12.458Z" }
---

# Ingestion & Indexing Pipeline

The nmecar docs MCP server turns a flat AsciiDoc corpus into a searchable vector index at process startup. This page traces that end-to-end flow in detail: the per-stage transformations, the data shapes that flow between them, the content-hash cache contract that gates a rebuild, and the failure semantics that decide whether a cold start re-embeds or reuses disk. The conceptual overview — the in-memory store, the three retrieval tools, and the stateless transport — is in [MCP Server Architecture](../concepts/mcp-server.md); this page is the per-stage engineering view. The embedding provider abstraction that `build` calls into is in [Embeddings Providers](../integrations/embeddings-providers.md), and the tests that pin these stages are in [MCP Server Testing](../testing/mcp-server-tests.md).

The entire pipeline is orchestrated by a single sequential pass in `mcp-server/src/index.ts`. Nothing is served until it completes: the HTTP server boots only after the vector store is loaded from cache or built from embeddings. The per-file ingest stages (load → resolve → render → chunk) run in a `for` loop, producing one `allChunks` array; the index stages (hash → cache-or-embed → save) run once over that array.

## Pipeline stages

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
flowchart TD
  load["loadAdoc<br/>walk DOCS_ROOT, skip stubs"]
  macros["resolveMacros<br/>strip Kroki, inline partial$/example$, xref/image to text"]
  render["renderAdoc<br/>AsciiDoc to HTML to plain text"]
  chunk["chunkPage<br/>heading split, context prefix, MIN/MAX tokens, merge"]
  hash["contentHash<br/>sha256 of sorted chunk text + PIPELINE_VERSION + model"]
  cache{cache hit?}
  loadIndex["VectorStore.loadFromDisk<br/>read index-hash.json, verify hash"]
  embed["embedder.embed<br/>batched OpenAI embeddings, retry/backoff"]
  build["VectorStore.build<br/>L2-normalize each vector"]
  save["VectorStore.saveToDisk<br/>write index-hash.json to DATA_DIR"]
  serve["createHttpApp<br/>factory passed store + embedder"]

  load --> macros --> render --> chunk --> hash --> cache
  cache -->|yes| loadIndex --> serve
  cache -->|no| embed --> build --> save --> serve
```

*The ingest→index pipeline: four per-file stages produce a flat chunk array, then a content hash gates a cache hit (load) or a cache miss (embed, normalize, persist) before the HTTP server starts.*

### Stage 1 — Load and stub skip

`loadAdoc(docsRoot)` in `mcp-server/src/ingest/loadAdoc.ts` recursively walks `DOCS_ROOT`, collecting every `.adoc` file into `{ path, relPath, raw }` triples (`path` is absolute, `relPath` is the repo-relative form such as `booking/discounts.adoc`). The walk descends directories and ignores any non-`.adoc` file.

The one filtering decision inside the walk is a **stub skip**: after stripping the first `= Heading` line, the file is dropped if it has fewer than 50 non-whitespace characters in the remaining body. The check is `raw.replace(/^=\s+.+\n/m, "").replace(/\s/g, "")` — remove the title line, then strip all whitespace, then measure. Stub pages (navigational placeholders, empty scaffolding) never reach rendering or embedding, so they neither pollute the index nor cost an API call.

### Stage 2 — Macro resolution

`resolveMacros(raw, partialsRoot, examplesRoot)` in `mcp-server/src/ingest/resolveMacros.ts` normalizes the raw AsciiDoc before the renderer ever sees it. It runs four transformations in a fixed order:

1. **Kroki/diagram blocks are removed entirely.** A single regex (`KROKI_BLOCK_RE`) matches a bracketed diagram attribute (any of plantuml, mermaid, graphviz, ditaa, and the rest of the Kroki family) followed by either `....….` or `----…----` delimiters, and deletes the whole block. Diagrams are structural noise for text embeddings — they carry layout, not prose — so they are stripped rather than rendered.
2. **`include::partial$…` is inlined recursively.** `resolveIncludes` reads the referenced partial file from `partialsRoot`, recurses into the partial's own includes (bounded by `MAX_DEPTH = 10`), and replaces the macro with the resolved content. **`nav_*` partials are dropped**, not inlined: a partial whose filename starts with `nav_` is navigation chrome and is removed to avoid polluting embeddings with menu text. A missing partial file is replaced with the empty string.
3. **`include::example$…` is inlined as a source block.** The example file is read from `examplesRoot` and wrapped in a literal AsciiDoc source fence (`[source]\n----\n…\n----\n`) so the renderer treats it as a code block. A missing example is replaced with the empty string.
4. **`xref:` and `image:` are reduced to their text.** `xref:target[link text]` is replaced with its link text (or dropped if the text is empty — the target path never leaks into the embedding); `image::file[alt]` (and the blockless `image:` form) is replaced with its alt text (or dropped if empty). This keeps the human-visible labels and discards the machine-only targets.

The result is a preprocessed string that still has AsciiDoc block structure (headings, lists, code fences) but no external includes or macro noise.

### Stage 3 — Render

`renderAdoc(relPath, preprocessed)` in `mcp-server/src/ingest/render.ts` does a two-step conversion: AsciiDoc → HTML via `@asciidoctor/core` (in `safe` mode, `standalone: false`, `icons: "font"`), then HTML → plain text via `html-to-text`. The `html-to-text` options drop anchors' hrefs (`ignoreHref: true`) and skip `<img>` elements entirely, because the `resolveMacros` step already extracted alt text into the AsciiDoc source — the renderer never needs the HTML `<img>` tags.

The page title is recovered separately from the *preprocessed* source, not the rendered text: `preprocessed.match(/^=\s+(.+)$/m)` captures the first `= Heading` line. If no title line is found, the title falls back to `relPath`. This is why the title must survive macro resolution — it is the source of `pageTitle` in every downstream chunk.

The output is a `RenderedPage { relPath, title, text }` where `text` is the plain-text rendering with the heading *markers* (`=`, `==`, `===`) already stripped by AsciiDoc → HTML → text. The chunker therefore cannot rely on AsciiDoc heading prefixes; it has to infer section breaks from the rendered text's structure.

### Stage 4 — Chunking

`chunkPage(page)` in `mcp-server/src/ingest/chunk.ts` turns one `RenderedPage` into an array of `Chunk`s. Each chunk carries `id`, `relPath`, `pageTitle`, `section`, `text`, and `tokensApprox`.

**Section detection on rendered text.** Because the AsciiDoc heading prefixes are gone after rendering, `chunkPage` splits the text on three-or-more consecutive newlines (`text.split(/\n{3,}/)`), then treats a block as a heading if it is short (≤ 2 lines, < 100 chars) and contains no `.` or `,` — a heuristic for a standalone label line. Each detected heading starts a new section; non-heading blocks accumulate under the current heading. If no sections are detected the whole page becomes one section.

**Token estimate.** `approxTokens(text) = Math.ceil(text.length / 4)`. The factor is deliberately conservative for Greek (and other multi-byte scripts): Greek text produces more characters per token than English, so dividing by a smaller number over-estimates tokens and biases toward earlier splitting. `tokensApprox` is stored on every chunk and is what the size guards use.

**Size bounds.** `MIN_TOKENS = 80` and `MAX_TOKENS = 800`. A section whose full text (with its context prefix) exceeds `MAX_TOKENS` is split further by `splitByParagraph`, which accumulates `\n\n`-separated paragraphs until the running estimate would exceed a budget of `MAX_TOKENS` minus the prefix cost, then starts a new part. After all sections are chunked, a merge pass folds any chunk below `MIN_TOKENS` into the preceding chunk *from the same page* (`last.relPath === chunk.relPath`), re-computing the combined `tokensApprox`. The result is that no chunk is gratuitously tiny and no chunk blows past the hard ceiling.

**Context prefix.** Every chunk is prefixed with either `«{pageTitle}»\n\n` (for untitled/lead sections) or `«{pageTitle} › {sectionHeading}»\n\n` (for headed sections). This embeds the page title and section heading into the chunk text itself, so the embedding model sees the context the chunk lives in rather than a floating paragraph — the single most important design choice for retrieval quality on a small corpus.

**Chunk id.** `makeId(relPath, slug, idx)` produces `${relPath}#${slug}-${idx}`, where `slug` is the slugified heading (or the page title if the section has no heading) and `idx` is a per-page global counter that increments across all chunks in the page. The slug is `heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")`, so Greek headings slugify to empty-ish strings — the `idx` counter keeps ids unique regardless.

### Stage 5 — Content hash

`contentHash(chunks, model)` in `mcp-server/src/indexing/hash.ts` computes a sha256 over a deterministic payload: the chunk *texts* sorted by chunk id, joined by null bytes, followed by the hardcoded `PIPELINE_VERSION` (currently `"1"`) and the embedding model name. The sort by id makes the hash insensitive to the order chunks were produced in; the null-byte separator prevents two adjacent texts from colliding; the pipeline version and model name make the hash change when the ingestion/chunking logic changes or when the embedding model changes — without anyone having to edit content.

This hash is the cache key. It is computed *before* any embedding call, so a warm cache skips the API entirely.

### Stage 6 — Cache-or-build

`VectorStore.loadFromDisk(dataDir, hash)` in `mcp-server/src/indexing/store.ts` is tried first. The cache contract is:

- **File name**: `${dataDir}/index-${hash}.json`, written by `saveToDisk` which `mkdir`s the directory (recursively) and serializes `{ hash, vectors }` as JSON.
- **Load success**: the file is read, parsed, and its stored `hash` field is compared to the expected hash. **A mismatch returns `null`**, not an error. Any read or parse failure is swallowed by the `catch` and also returns `null`.
- **Rebuild trigger**: `index.ts` treats `null` as a cache miss and rebuilds: `store.build(allChunks, embedder)` embeds every chunk, `saveToDisk` persists the new index. The old cache file is left behind (not garbage-collected) but is simply ignored because its filename no longer matches a future hash.

On a cache hit the embeddings API is never called and the OpenAI SDK is never imported (the import is lazy, inside `embed`).

### Stage 7 — Embed, normalize, persist

On a miss, `VectorStore.build(chunks, embedder)` does the expensive work:

1. `embedder.embed(allChunkTexts)` is called once with every chunk text. The embedder batches internally (OpenAI: `BATCH_SIZE = 100` per API call, with `MAX_RETRIES = 3` and exponential backoff on HTTP 429 and 5xx, rethrow immediately on any other status). The caller sees one array in, one array out — the batch boundary is internal.
2. Each returned vector is **L2-normalized to unit length** (`normalize` in `store.ts`) at build time. The zero vector is passed through unchanged to avoid division by zero.
3. The normalized vector is stored alongside its chunk as a `StoredVector { id, vector, chunk }`.

Because every stored vector is unit-length, `search(queryVec, k)` is just a linear scan of dot products: the query vector is normalized, `dotProduct(stored, normalizedQuery)` is computed for every vector, results are sorted descending, and the top `k` are returned. This is acceptable at the corpus scale (roughly 40 Greek pages, ~15,400 words) and is the architectural reason no external vector database is needed.

Finally `saveToDisk(dataDir, hash)` persists the whole `StoredVector[]` to `${dataDir}/index-${hash}.json` so the next cold start with the same corpus, pipeline version, and model is a cache hit.

## Data shapes across the boundary

| Stage | Type | Key fields |
|---|---|---|
| Load | `AdocFile` | `path`, `relPath`, `raw` |
| Render | `RenderedPage` | `relPath`, `title`, `text` |
| Chunk | `Chunk` | `id`, `relPath`, `pageTitle`, `section`, `text`, `tokensApprox` |
| Index | `StoredVector` | `id`, `vector` (unit length), `chunk` |
| Cache | `CacheFile` | `hash`, `vectors` |

`Chunk` is the central type: the cache hash is computed from chunk texts, the embedder consumes chunk texts, the store holds chunks inside its vectors, and the retrieval tools return chunk-derived payloads. The `id` (`${relPath}#${slug}-${idx}`) is what makes the hash's `sort((a, b) => a.id.localeCompare(b.id))` deterministic.

## Invariants and failure semantics

- **Index freshness requires an image rebuild.** Content is baked into the Docker image and indexed at startup, so updated docs mean a rebuild and redeploy. A warm restart with unchanged content reuses the disk cache and never calls the embeddings API.
- **Cache validity is content-hash-gated.** Any change to chunk text, `PIPELINE_VERSION`, or the embedding model name produces a different hash, a different filename, a cache miss, and a fresh build. Bumping `PIPELINE_VERSION` is the escape hatch for re-indexing after changing the ingest/chunking logic without editing content.
- **`loadFromDisk` is total, not partial.** It returns the full store or `null`; it never returns a stale or half-built index. A hash mismatch, a missing file, or a JSON parse error all collapse to `null` and trigger a rebuild.
- **Embedding failure is loud.** If `store.build` throws (the embedder's retry policy does not swallow non-transient errors), the error propagates to `main()` and `process.exit(1)`. A cold start that cannot reach the embeddings API fails loudly rather than serving an empty index. A warm cache hit is resilient to embeddings outages because it never calls the API.
- **Chunking always yields at least one chunk.** `chunkPage` falls back to a single whole-page chunk when no sections are detected, so an empty-sections page is never a zero-chunk page.

## Manual inspection

`npm run ingest:dump` runs `mcp-server/src/ingest/dump.ts`, which re-runs the load → resolve → render → chunk stages per file and writes, for each page, a `.txt` of the rendered text and a `.chunks.json` summary (`id`, `section`, `tokensApprox`, a 200-char `textPreview`) into `${DATA_DIR}/_dump/`. It is not a test — it is a manual aid for eyeballing what the pipeline produced for a failing page without standing up the embeddings path.

## Tests that anchor the stages

Each ingest stage has a dedicated unit test that pins its observable behavior with deterministic inputs and no network:

- **`mcp-server/test/resolveMacros.test.ts`** — covers every macro: Kroki removal for both `....` and `----` delimiters, `partial$` inlining, `nav_*` skipping, `example$` inlining as a source fence, `xref` replacement and drop-on-empty, `image::` alt replacement and drop-on-empty, and recursive partial resolution. This is the most heavily tested stage because the regexes are the brittle-ist part of the pipeline.
- **`mcp-server/test/chunk.test.ts`** — asserts at least one chunk per non-empty page, unique ids, the page title in the context prefix, a hard `tokensApprox ≤ 1100` ceiling on a deliberately oversized page, the `tokensApprox = Math.ceil(text.length/4)` consistency invariant, and `relPath` propagation. It pins `MIN_TOKENS`/`MAX_TOKENS` bounds indirectly via the max-token and consistency cases.
- **`mcp-server/test/store.test.ts`** — uses a fake embedder returning deterministic orthogonal unit vectors (no `OPENAI_API_KEY` needed) to prove `VectorStore` builds, ranks by cosine/dot-product, round-trips through `saveToDisk`/`loadFromDisk`, returns `null` on a hash mismatch, and returns `null` on a missing cache file. This is the test that pins the in-memory cosine store and the cache contract end-to-end.

The vitest config injects fake `DOCS_ROOT`/`PARTIALS_ROOT`/`EXAMPLES_ROOT`/`DATA_DIR`/`OPENAI_API_KEY`/`MCP_AUTH_TOKEN` values so importing `src/config.ts` and `src/index.ts` does not crash the test process. The live smoke script (`mcp-server/test/smoke.ts`) is the end-to-end check: it posts ten real Greek queries to a running server and asserts the expected page appears in top-3 and top-1, which is the real retrieval-quality gate for the ingest→index→serve pipeline. See [MCP Server Testing](../testing/mcp-server-tests.md) for the full test surface.
