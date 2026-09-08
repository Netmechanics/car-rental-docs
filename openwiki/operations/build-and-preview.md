---
type: operations-runbook
title: Local Build & Preview Operations
description: Runbook for building and previewing the Antora docs site and running the MCP server locally — commands, prerequisites, env setup, output locations, and common pitfalls.
tags: [build, preview, antora, mcp-server, local-dev, runbook]
verified:
  - by: openwiki/0.4.3
    at: 2026-09-04T12:40:12.458Z
sources:
  - id: openwiki-source-4f023c807033aa9f84babd76
    resource: repo://antora-playbook.yml
  - id: openwiki-source-669c6b5d119a0cd3142bce3e
    resource: repo://mcp-server/.env.example
  - id: openwiki-source-54eca42f00a391caed4f9e84
    resource: repo://mcp-server/package.json
  - id: openwiki-source-c373fa2f3980420c295ffe54
    resource: repo://mcp-server/README.md
  - id: openwiki-source-df5b55cdd2353512e70211f9
    resource: repo://mcp-server/src/config.ts
  - id: openwiki-source-f5993cd5ff403bf40a0eb665
    resource: repo://mcp-server/src/index.ts
  - id: openwiki-source-98cdf74ff56a31e0e37165a2
    resource: repo://mcp-server/src/indexing/embed.ts
  - id: openwiki-source-bbdf9684076d5b01c8dd995f
    resource: repo://mcp-server/src/ingest/dump.ts
  - id: openwiki-source-61d8d4eaa276fd722fa083c9
    resource: repo://mcp-server/src/mcp/httpTransport.ts
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
generated: { by: "openwiki/0.4.3", at: "2026-09-04T12:40:12.458Z" }
---

# Local Build & Preview Operations

This runbook covers the two local workflows hosted in this repository: generating and previewing the Antora documentation site, and running the MCP semantic-search server against that documentation. Both workflows start from the repository root.

## Prerequisites

The docs build and the MCP server have different Node requirements because they live in separate `package.json` projects:

- **Docs site (repo root `package.json`):** Node.js 18+; the repository is tested with Node 20.18.1. `npm` is bundled with Node. Python 3 is an optional prerequisite for the local preview server.
- **MCP server (`mcp-server/package.json`):** Node.js `>=22` (declared via the `engines` field). Run MCP commands from inside `mcp-server/`.
- Both need network access: the docs build fetches Kroki diagrams from `https://kroki.nmlabs.gr`; the MCP server's first boot calls the OpenAI embeddings API.

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
flowchart TD
    A[Repo root] --> B{"Docs site build"}
    A --> C["MCP server (mcp-server/)"}
    B --> B1["npm install"]
    B1 --> B2["npm run build:site"]
    B2 --> B3["npm run preview -> :8081"]
    C --> C1["cp .env.example .env"]
    C1 --> C2["npm install"]
    C2 --> C3["npm run dev -> :8765/health"]
```

The two workflows share the same Antora AsciiDoc corpus under `docs/modules/ROOT/{pages,partials,examples}`; the site build renders it to HTML and the MCP server ingests it into a vector index.

## Docs site: build and preview

### Install dependencies

Run all docs commands from the repository root:

```shell
npm install
```

The root `package.json` installs the Antora toolchain (`antora` / `@antora/site-generator` 3.1.14), the Lunr search extension, Asciidoctor Kroki and Tabs extensions, and `sass` for theme compilation.

If the install is partial or fails due to network issues, delete `node_modules` and retry:

```shell
rm -rf node_modules
npm install
```

### Generate the site

```shell
npm run build:site
```

`build:site` first compiles the custom Sass theme into `supplemental-ui/css/site.css` (`build:theme` runs `sass --no-source-map theme/site.scss supplemental-ui/css/site.css`) and then runs `antora antora-playbook.yml`. The generated site is written to `./build/site`.

To rebuild after intentionally refreshing external Antora assets, use the fetch variant, which passes `--fetch` to Antora:

```shell
npm run build:site:fetch
```

The playbook reads content from the currently checked out `HEAD` (the content source is `url: .` with `branches: [HEAD]` and `start_path: docs`), so local documentation edits are included without committing to `master` first. The deployment site URL is configured in the playbook as `http://carrental-docs.nmlabs.gr`.

### Preview locally

```shell
npm run preview
```

`preview` runs `python3 -m http.server 8081 --directory build/site`, so Python 3 must be present. Then visit `http://localhost:8081`.

### Notes and pitfalls

- The repository vendors the Antora UI bundle in `vendor/antora-ui-default.zip` (referenced by the playbook's `ui.bundle.url`), so builds do not depend on downloading the default UI from GitLab on every run. The local Sass theme is supplied via `supplemental-ui`.
- Kroki diagrams are fetched during the build because `asciidoctor-kroki` is enabled and `kroki-server-url` is set to `https://kroki.nmlabs.gr`. Local or CI builds therefore still need network access to that Kroki server.
- A stale or partial `node_modules` is the most common cause of broken builds; deleting it and re-running `npm install` is the standard recovery step.

## MCP server: local development

The MCP server is an ESM TypeScript project in `mcp-server/`. Run its commands from inside `mcp-server/`.

### Configure environment

```shell
cp .env.example .env
```

Then edit `.env` and set at least:

- `OPENAI_API_KEY` (required when `EMBEDDING_PROVIDER=openai`, which is the default).
- `MCP_AUTH_TOKEN` (the Bearer token; required in production).

The local-dev defaults in `.env.example` point the content roots at the Antora corpus relative to `mcp-server/`:

- `DOCS_ROOT=../docs/modules/ROOT/pages`
- `PARTIALS_ROOT=../docs/modules/ROOT/partials`
- `EXAMPLES_ROOT=../docs/modules/ROOT/examples`
- `DATA_DIR=./data` (the embeddings cache for local dev; Docker uses `/data`).

### Install and run

```shell
npm install
npm run dev
```

`npm run dev` is `node --env-file=.env --import tsx/esm --watch src/index.ts`. It loads `.env`, runs the server through `tsx`, and watches for changes. The health endpoint is at `http://localhost:8765/health` (configured by `PORT=8765`).

### Boot behavior and embeddings cache

Startup loads `.adoc` files from `DOCS_ROOT`, preprocesses and renders them, chunks the rendered text, and computes a content hash over the chunks plus the embedding model. It then attempts to load a cached vector index from `DATA_DIR`:

- **Cache miss (first boot):** the server builds the vector index by calling the embeddings API in batches, which costs a few cents with `text-embedding-3-small`, then persists the index to `DATA_DIR`.
- **Cache hit (subsequent boots):** the index is loaded from disk and no embeddings API call is made.

Because the cache key is a hash of both the chunked content and the embedding model, changing the documentation content or the model invalidates the cache and triggers a fresh embedding pass.

### Inspect extracted content

```shell
npm run ingest:dump
```

`ingest:dump` runs `tsx src/ingest/dump.ts`, which runs the same load → preprocess → render → chunk pipeline as the live server but writes the results to `${DATA_DIR}/_dump` instead of embedding them: each page becomes a `.txt` file of rendered text and a `.chunks.json` summary (chunk id, section, approximate token count, and a 200-character text preview). Use it to verify extraction and chunking without calling the embeddings API.

### MCP server entrypoints and lifecycle

The server exposes an Express HTTP app with two routes:

- `GET /health` returns `{ status: "ok" }` and is not authenticated.
- `ALL /mcp` is the MCP endpoint. When `MCP_AUTH_TOKEN` is set, requests must carry `Authorization: Bearer <token>`; otherwise they get a 401. Each request gets a fresh `McpServer` instance backed by a stateless `StreamableHTTPServerTransport` (`sessionIdGenerator: undefined`), while the underlying vector store and embedder are shared and reused across requests.

If startup fails (invalid configuration, missing API key, embedding error), `main()` logs a fatal error and exits with code 1. Configuration is validated eagerly by a Zod schema before the server starts; a missing required API key for the selected provider terminates the process at config load time.

## Common pitfalls

- **Partial npm install (docs or MCP):** delete `node_modules` and re-run `npm install` in the corresponding project directory.
- **Node version mismatch:** the docs site targets Node 18+, the MCP server requires Node 22+. Use a Node 20 runtime for the docs build and Node 22+ for MCP dev.
- **First MCP boot costs money:** a cache miss calls the embeddings API. Point `DATA_DIR` at a persistent directory so subsequent boots load from cache.
- **Kroki network dependency:** the docs build fetches diagrams from `https://kroki.nmlabs.gr`; offline builds fail when diagrams are present.
- **Local MCP content paths:** the `.env.example` paths are relative to `mcp-server/`. Running the MCP server from the repo root without adjusting `DOCS_ROOT`/`PARTIALS_ROOT`/`EXAMPLES_ROOT` will fail to find the Antora corpus.

## Related pages

- `/openwiki/concepts/mcp-server.md` — MCP server concepts and tool surface.
- `/openwiki/operations/mcp-deployment.md` — Docker and CI/CD deployment of the MCP server.
- `/openwiki/workflows/docs-build-flow.md` — end-to-end docs build flow.
