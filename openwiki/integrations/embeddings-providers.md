---
type: integration
title: Embeddings Providers
description: How the MCP server abstracts embedding generation, selects between OpenAI and Gemini providers, batches and retries API calls, and ties the chosen model into the content-hash cache key.
tags: [embeddings, openai, gemini, mcp-server, cache, configuration]
verified:
  - by: openwiki/0.4.3
    at: 2026-09-04T12:40:12.458Z
sources:
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
generated: { by: "openwiki/0.4.3", at: "2026-09-04T12:40:12.458Z" }
---

# Embeddings Providers

The MCP server turns AsciiDoc pages into searchable vectors through a small, provider-agnostic embedding abstraction. The abstraction lives in `mcp-server/src/indexing/embed.ts` and is the only component that talks to an external embeddings API. Everything downstream — the in-memory vector store, the cosine search, and the on-disk cache — depends only on the `Embedder` interface, not on any specific vendor.

## The Embedder interface

The contract that any embedding provider must satisfy is intentionally narrow:

```ts
export interface Embedder {
  readonly model: string;
  readonly dims: number;
  embed(texts: string[]): Promise<number[][]>;
}
```

- `model` exposes the model identifier the embedder is configured to use. It is `readonly` and is consumed outside the embedder — most importantly by the content-hash/cache-key computation (see [Model name and the cache key](#model-name-and-the-cache-key)).
- `dims` declares the dimensionality of the vectors this provider emits. The OpenAI embedder hard-codes this to `1536` (matching `text-embedding-3-small`); downstream code normalizes vectors to unit length, so `dims` is informational rather than enforced at the type level.
- `embed(texts)` takes an array of input strings and returns a parallel array of embedding vectors (one vector per input, in order). Callers — `VectorStore.build` — pass all chunk texts at once and trust the embedder to chunk the work into API-safe batches internally.

This interface decouples the rest of the server from vendor SDKs. The store, the search tools, and the cache file all work with plain `number[]` vectors and never import the OpenAI SDK directly.

## Provider selection

Which provider runs is decided at startup, before any text is embedded. The selection flows through configuration in `mcp-server/src/config.ts`:

- `EMBEDDING_PROVIDER` is a zod-validated enum restricted to `"openai"` or `"gemini"`, defaulting to `"openai"`.
- After zod parsing, `config.ts` performs a provider-specific key check and **exits with a non-zero status** if the matching API key is missing:
  - `openai` requires `OPENAI_API_KEY`.
  - `gemini` requires `GEMINI_API_KEY`.
- The model name comes from `OPENAI_EMBED_MODEL` (default `text-embedding-3-small`); `OPENAI_API_KEY` and `OPENAI_EMBED_MODEL` are both surfaced from config.

The `.env.example` documents these knobs together: `EMBEDDING_PROVIDER`, the OpenAI key/model pair, and the commented-out `GEMINI_API_KEY`.

`createEmbedder()` in `embed.ts` is the factory that turns config into a live `Embedder`. It branches on `config.EMBEDDING_PROVIDER`:

```ts
export function createEmbedder(): Embedder {
  if (config.EMBEDDING_PROVIDER === "openai") {
    return createOpenAIEmbedder();
  }
  throw new Error(`Embedding provider '${config.EMBEDDING_PROVIDER}' not yet implemented`);
}
```

### Gemini status

Gemini is a **first-class option in configuration but not in implementation.** The config layer accepts `EMBEDDING_PROVIDER=gemini`, validates `GEMINI_API_KEY`, and the `EMBEDDING_PROVIDER` enum explicitly lists `"gemini"` as valid — so selecting it will pass config validation. However, `createEmbedder()` throws `"not yet implemented"` for any provider other than `openai`. There is no Gemini embedder branch, no `@google/genai` import, and no dimensionality constant for Gemini in `embed.ts`. In practice this means a `gemini` configuration will start up successfully through config validation and then fail at embedding time with a thrown error. The plan document lists Gemini `text-embedding-004` as the alternative embedding source, but that path is not wired into the code.

## OpenAI embedder

`createOpenAIEmbedder()` builds the only implemented `Embedder`. It captures `OPENAI_API_KEY` and `OPENAI_EMBED_MODEL` from config at construction time and returns an object with `model`, `dims: 1536`, and an `embed` method.

### Lazy SDK import

The OpenAI SDK is imported lazily inside `embed`, not at module load:

```ts
const { default: OpenAI } = await import("openai");
const client = new OpenAI({ apiKey: OPENAI_API_KEY });
```

Two consequences follow. First, the `openai` package is only loaded when embedding actually runs — a cache hit that loads vectors from disk never triggers the import or instantiates a client. Second, a fresh `OpenAI` client is constructed on every `embed` call rather than once at construction. For the server's batch-at-startup workload this is acceptable, but it is worth noting if `embed` were ever called repeatedly at runtime.

### Batching

Inputs are split into fixed-size batches before hitting the API. `BATCH_SIZE` is `100`, and each batch is sent as a single `client.embeddings.create({ model, input: batch })` call:

```ts
for (let i = 0; i < texts.length; i += BATCH_SIZE) {
  const batch = texts.slice(i, i + BATCH_SIZE);
  const response = await retry(
    () => client.embeddings.create({ model, input: batch }),
    MAX_RETRIES
  );
  results.push(...response.data.map((d) => d.embedding));
}
```

The returned vectors are flattened into a single `number[][]` preserving input order. Batching is internal to the embedder — callers see one array in, one array out. The batch boundary only appears in debug logs (`from`, `count`).

### Retry and backoff

Each batch call is wrapped in a `retry` helper. Retry behavior is deliberately conservative:

- **`MAX_RETRIES` is `3`** total attempts.
- Retries happen **only** for transient errors: HTTP status `429` (rate limited) or any `status >= 500` (server error). The status is read off the thrown error as `err.status ?? 0`.
- For transient errors the helper sleeps with **exponential backoff** — `delay = Math.pow(2, i) * 1000` milliseconds, i.e. 1s, 2s, 4s across attempts — and logs a warning with the attempt number, status, and delay.
- For any **other** error (non-429, below 500, or no status), the helper **rethrows immediately**; it does not swallow or retry unknown failures.
- If all attempts are exhausted, the last error is thrown from the loop.

This keeps the embedder resilient to rate-limiting and provider outages while failing fast on auth errors, bad requests, and other non-transient problems.

## Model name and the cache key

The chosen embedding model is not just a runtime detail — it is part of the cache identity. The content hash in `mcp-server/src/indexing/hash.ts` folds the model name into the SHA-256 payload:

```ts
const payload =
  sorted.map((c) => c.text).join("\x00") + "\x00" + PIPELINE_VERSION + "\x00" + model;
return crypto.createHash("sha256").update(payload, "utf-8").digest("hex");
```

`PIPELINE_VERSION` is a constant (`"1"`) and `model` is `embedder.model`. Because the model name participates in the hash, **changing the embedding model invalidates the cache**: the computed hash changes, `VectorStore.loadFromDisk` finds no matching `index-<hash>.json` file, and the server rebuilds the index by re-embedding every chunk. The same mechanism invalidates the cache if the chunking pipeline version changes, even when the model stays the same. Startup in `index.ts` computes `contentHash(allChunks, embedder.model)` and uses it both to look up the cache file and, on a miss, as the filename for the freshly written cache.

## Where it fits in the pipeline

The embedder sits between chunking and the vector store. At startup `index.ts` calls `createEmbedder()`, computes the content hash from the embedder's `model`, attempts a cache load, and only on a miss calls `store.build(allChunks, embedder)` — which passes all chunk texts to `embed` and normalizes the resulting vectors to unit length for cosine similarity. Once the index is built or loaded, the embedder is also handed to the MCP server factory (`buildMcpServer(store, embedder)`) so that search queries can be embedded at request time against the same provider and model used to build the index. Keeping a single `Embedder` instance for both indexing and querying guarantees query and document vectors live in the same vector space.

## Configuration summary

| Variable | Role | Default |
|---|---|---|
| `EMBEDDING_PROVIDER` | Selects `openai` or `gemini` | `openai` |
| `OPENAI_API_KEY` | Required when provider is `openai`; missing key is a fatal config error | — |
| `OPENAI_EMBED_MODEL` | Model name passed to the API and folded into the cache hash | `text-embedding-3-small` |
| `GEMINI_API_KEY` | Required when provider is `gemini`; accepted by config but provider is not implemented | — |
| `DATA_DIR` | Where the keyed cache JSON files are written/read | `/data` |

Operational notes: because the model is part of the cache key, rotating the embedding model is a deploy-time action that triggers a full re-embed on the next startup (one-time cost), after which subsequent starts hit the new cache file. Transient provider failures are tolerated up to three attempts; persistent 4xx failures other than 429 will surface immediately and abort startup, since `store.build` runs before the HTTP server starts listening.
