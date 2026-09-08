---
type: architecture-overview
title: Repository Architecture Overview
description: Bird's-eye view of the nmecar docs repository, where one AsciiDoc corpus feeds both an Antora documentation site published to GitHub Pages and a retrieval-only MCP server that turns the same source into a searchable vector index for a future AI agent.
tags: [architecture, antora, mcp-server, docs-corpus, vector-index]
verified:
  - by: openwiki/0.4.3
    at: 2026-09-04T12:40:12.458Z
sources:
  - id: openwiki-source-43109e5c4a510102aebf4a40
    resource: repo://.github/workflows/mcp-image.yml
  - id: openwiki-source-f2608d0d515da097485b6ec5
    resource: repo://.github/workflows/publish.yml
  - id: openwiki-source-4f023c807033aa9f84babd76
    resource: repo://antora-playbook.yml
  - id: openwiki-source-25c92de403cf735f04b1580d
    resource: repo://MCP_SERVER_PLAN.md
  - id: openwiki-source-b2d086d65d6d4185bba54bbd
    resource: repo://mcp-server/Dockerfile
  - id: openwiki-source-df5b55cdd2353512e70211f9
    resource: repo://mcp-server/src/config.ts
  - id: openwiki-source-f5993cd5ff403bf40a0eb665
    resource: repo://mcp-server/src/index.ts
  - id: openwiki-source-e21117b284f783a4aa49a395
    resource: repo://mcp-server/src/indexing/hash.ts
  - id: openwiki-source-fa60629d432927f2e09d474a
    resource: repo://mcp-server/src/indexing/store.ts
  - id: openwiki-source-d818db1b591ed1b606cdce28
    resource: repo://mcp-server/src/ingest/loadAdoc.ts
  - id: openwiki-source-61d8d4eaa276fd722fa083c9
    resource: repo://mcp-server/src/mcp/httpTransport.ts
  - id: openwiki-source-5a4b03705e6b83f35ae8b8c1
    resource: repo://mcp-server/src/mcp/server.ts
generated: { by: "openwiki/0.4.3", at: "2026-09-04T12:40:12.458Z" }
---

# Repository Architecture Overview

The nmecar docs repository is a single Antora documentation project that owns **two independent consumers of one AsciiDoc corpus**:

1. An **Antora documentation site** — built from the same `.adoc` sources with `antora-playbook.yml` and published to GitHub Pages for human readers.
2. An **MCP (Model Context Protocol) server** — a custom TypeScript service in `mcp-server/` that reads the same `.adoc` files at startup, renders and chunks them, embeds them with an external embeddings API, and exposes semantic search and page retrieval to a future AI agent over Streamable HTTP.

Both systems are deliberately decoupled. They share content but not configuration, build pipeline, or runtime: the MCP server is retrieval-only, does not generate text with an LLM, and makes no changes to the Antora setup.

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
flowchart TD
  corpus["docs/modules/ROOT/pages/**/*.adoc<br/>(single source of truth)"]

  subgraph Antora["Antora site (human-readable)"]
    playbook["antora-playbook.yml<br/>content source: git HEAD, start_path: docs"]
    antoraBuild["npx antora --fetch<br/>build/site HTML"]
    pages["GitHub Pages<br/>carrental-docs.nmlabs.gr"]
    playbook --> antoraBuild
  end

  subgraph MCP["MCP server (machine-readable retrieval)"]
    load["loadAdoc: walk DOCS_ROOT at startup"]
    ingest["resolveMacros + renderAdoc + chunkPage"]
    embed["embedder (OpenAI text-embedding-3-small)"]
    store["in-memory VectorStore<br/>+ cosine + JSON cache on volume"]
    tools["MCP tools: search/get/list"]
    http["Streamable HTTP :8765<br/>bearer auth, stateless"]
    load --> ingest --> embed --> store --> tools --> http
  end

  corpus --> playbook
  corpus --> load
  antoraBuild --> pages

  http -. future .-> agent["AI agent (out of scope here)"]
```

*The shared AsciiDoc corpus feeding the Antora build (to GitHub Pages) and the MCP ingest pipeline (to an in-memory vector index served over Streamable HTTP).*

## Single source of truth

The authoritative documentation content is the AsciiDoc page tree:

- `docs/modules/ROOT/pages/**/*.adoc` — every documentation page.
- `docs/modules/ROOT/partials/**` — reusable partials included via `include::partial$…​[]`.
- `docs/modules/ROOT/examples/**` — code samples included via `include::example$…​[]`.
- `docs/modules/ROOT/images/**` — media.

Both consumers read this tree, but from different places and at different times:

- **Antora** builds from the git working tree at `HEAD`. `antora-playbook.yml` declares a local content source (`url: .`, `branches: HEAD`, `start_path: docs`), so the build consumes whatever is committed on the branch being built. The component descriptor `docs/antora.yml` fixes the component as `nmecar`, version `2.0`, with `modules/ROOT/nav.adoc` as the navigation root.
- **The MCP server** reads the same files **at process startup**. In the Docker image those files are *baked in* (copied into the image as flat `docs/pages`, `docs/partials`, and `docs/examples` folders) and pointed at by the `DOCS_ROOT`, `PARTIALS_ROOT`, and `EXAMPLES_ROOT` environment variables. The server has no dependency on Antora, git, or the publish workflow; it walks `DOCS_ROOT` for `.adoc` files at boot.

Because Antora builds from `HEAD` and the server reads baked-in files at startup, the two stay consistent only through a shared commit and (for the server) an image rebuild/redeploy. There is no live synchronization; updating docs served by the MCP server requires rebuilding the image.

## The Antora site (human-readable path)

The Antora side is the original, pre-existing system. Its key facts:

- **Playbook** (`antora-playbook.yml`): site title `nmecar Documentation`, start page `nmecar::index.adoc`, `html_extension_style: indexify`, Kroki server at `https://kroki.nmlabs.gr`, Asciidoctor extensions `asciidoctor-kroki` and `@asciidoctor/tabs`, and the `@antora/lunr-extension` for client-side search (languages `en, el`).
- **Component** (`docs/antora.yml`): component `nmecar`, version `2.0`, shared AsciiDoc attributes for app names and Kroki fetch.
- **Build & publish**: `npm run build:site` compiles the Sass theme then runs Antora, producing `build/site`. The `Publish to GitHub Pages` workflow runs on `master` pushes, builds with Node 20, writes a `CNAME` of `carrental-docs.nmlabs.gr`, and deploys the `build/site` artifact to GitHub Pages.

This path is owned by the documentation workflow and is **not modified by the MCP server**.

## The MCP server (machine-readable retrieval path)

The MCP server is a separate Node 22 / TypeScript project under `mcp-server/`. Its single responsibility is **retrieval**: turn the `.adoc` corpus into a searchable vector index and expose it through MCP tools. It is deliberately not the AI agent.

### Responsibilities and non-goals

Per `MCP_SERVER_PLAN.md`, the server is:

- **Retrieval-only.** It performs semantic search and page/section retrieval. It does **not** do LLM generation or answer synthesis — that belongs to the future AI agent, which is out of scope here.
- **Non-invasive to Antora.** It does **not** touch `antora-playbook.yml`, `docs/`, or the publish workflow. The Antora setup remains unchanged.

Additional documented non-goals: no per-version docs versioning in this phase (the corpus is a single "current" version), and no external vector database — the corpus is small enough for an in-memory vector store with cosine similarity.

### Startup data flow

`mcp-server/src/index.ts` orchestrates a single startup sequence:

1. **Load** — `loadAdoc(DOCS_ROOT)` walks the `.adoc` tree, skipping stub pages (files with fewer than 50 non-whitespace characters after the first heading).
2. **Ingest** — for each file: `resolveMacros` inlines Antora `partial$`/`example$` includes and normalizes `xref:`/`image:`/Kroki blocks, `renderAdoc` converts AsciiDoc → HTML → plain text via `@asciidoctor/core` + `html-to-text`, and `chunkPage` splits by `==`/`===` headings into metadata-bearing chunks with a context prefix.
3. **Embed** — `createEmbedder()` builds a provider-agnostic embedder (default OpenAI `text-embedding-3-small`, 1536 dims; Gemini is an alternative). `contentHash` computes a sha256 over the chunk text plus a `PIPELINE_VERSION` plus the model name.
4. **Cache or build** — `VectorStore.loadFromDisk(DATA_DIR, hash)` is tried first. On a cache hit (matching hash) the index loads from the persisted JSON without calling the embeddings API. On a miss the store builds vectors, normalizes them, and persists them to `${DATA_DIR}/index-${hash}.json`.
5. **Serve** — `createHttpApp` boots Express on `PORT` (default `8765`), exposing `GET /health` and `POST /mcp`.

### MCP layer: tools, transport, and auth

The server registers three MCP tools in `mcp-server/src/mcp/server.ts`:

| Tool | Purpose |
|---|---|
| `search_nmecar_docs` | Semantic search; embeds the query and returns the top-*k* chunks (default 5, max 20) with page, title, section, score, and text. |
| `get_doc_page` | Returns the full rendered text of a page by relative path (e.g. `booking/discounts.adoc`). |
| `list_doc_sections` | Lists all pages and their section headings for discovery. |

Transport is **Streamable HTTP in stateless mode**. Each `/mcp` request constructs a fresh `McpServer` + `StreamableHTTPServerTransport` with `sessionIdGenerator: undefined`, then connects and handles the request. This keeps the read-only server simple and stateless.

Authentication is a **bearer token** check (`Authorization: Bearer <MCP_AUTH_TOKEN>`) applied only to `/mcp`; `/health` is exempt. When `MCP_AUTH_TOKEN` is unset the middleware passes through (local dev); in production the token is mandatory. CORS is controlled by `ALLOWED_ORIGINS` (default `*`).

### Configuration

All configuration comes from environment variables, validated with `zod` in `mcp-server/src/config.ts` (fail-fast on missing required values and on a missing API key for the selected provider). Notable variables: `PORT` (8765), `DOCS_ROOT`/`PARTIALS_ROOT`/`EXAMPLES_ROOT` (corpus locations), `DATA_DIR` (cache volume, default `/data`), `EMBEDDING_PROVIDER` (`openai` or `gemini`), `OPENAI_API_KEY`/`GEMINI_API_KEY`, `OPENAI_EMBED_MODEL` (default `text-embedding-3-small`), `MCP_AUTH_TOKEN`, `ALLOWED_ORIGINS`, `LOG_LEVEL`.

## Deployment and CI/CD

The two systems have **independent** delivery pipelines that both ultimately consume the same corpus commit.

- **Antora → GitHub Pages**: `.github/workflows/publish.yml` triggers on `master`, builds the site with Node 20, and deploys `build/site` to GitHub Pages with the `carrental-docs.nmlabs.gr` CNAME.
- **MCP → GHCR**: `.github/workflows/mcp-image.yml` triggers on pushes to `mcp-integration` or `master` that touch `docs/**` or `mcp-server/**`. It runs `npm ci`, typecheck, and tests in `mcp-server/`, then builds and pushes a Docker image to `ghcr.io/netmechanics/nmecar-docs-mcp` (tagged by SHA, plus `:latest` on the default branch). The embeddings API key is **not** needed at build time — the vector index is built at container startup, not during the image build.

The `mcp-server/Dockerfile` is a multi-stage Node 22 image that bakes the `.adoc` pages, partials, and examples into the image as read-only content and exposes `:8765` with a `/data` volume for the vector-index cache and a `/health`-based `HEALTHCHECK`.

## Ownership boundaries and invariants

- **One corpus, two readers.** Content lives in `docs/modules/ROOT/**` and is the only shared dependency. Neither system writes to the other's configuration or output.
- **Antora is read-only from the MCP server's perspective.** The MCP server must not change `antora-playbook.yml`, `docs/antora.yml`, `docs/`, or `publish.yml`.
- **The server is retrieval-only.** No LLM generation happens inside it; answer synthesis is a future, separate AI agent's responsibility.
- **Index freshness requires an image rebuild.** Because content is baked into the image and indexing happens at startup, serving updated docs to the MCP server requires rebuilding and redeploying the image. This is an accepted trade-off for the current change frequency.
- **Cache validity is content-hash-gated.** A second boot with unchanged corpus loads the cached JSON and skips the embeddings API; any change to content, pipeline version, or embedding model invalidates the cache and triggers a fresh build.
