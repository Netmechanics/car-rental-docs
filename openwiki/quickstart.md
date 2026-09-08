---
type: quickstart
title: Quickstart & Wiki Navigation
description: Entry point for the nmecar docs wiki — summarizes the two-system repository (an Antora documentation site plus an MCP semantic-search server that share one AsciiDoc corpus), lists the required tools and Node version requirements, and routes each common task to the right page.
tags: [quickstart, navigation, antora, mcp-server, docs-corpus, nmecar]
verified:
  - by: openwiki/0.4.3
    at: 2026-09-04T12:40:12.458Z
sources:
  - id: openwiki-source-6d4b4e707b8d60b6ccfa3425
    resource: repo://.github/workflows/openwiki-update.yml
  - id: openwiki-source-4f023c807033aa9f84babd76
    resource: repo://antora-playbook.yml
  - id: openwiki-source-a2371d6362e5db4bc834ad03
    resource: repo://CLAUDE.md
  - id: openwiki-source-54eca42f00a391caed4f9e84
    resource: repo://mcp-server/package.json
  - id: openwiki-source-c373fa2f3980420c295ffe54
    resource: repo://mcp-server/README.md
  - id: openwiki-source-f5993cd5ff403bf40a0eb665
    resource: repo://mcp-server/src/index.ts
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
generated: { by: "openwiki/0.4.3", at: "2026-09-04T12:40:12.458Z" }
---

# Quickstart & Wiki Navigation

This is the entry point for the `nmecar` docs repository wiki. The repository owns **two independent systems that share one AsciiDoc corpus** under `docs/modules/ROOT/`:

1. An **Antora documentation site** that builds the `.adoc` sources into a static site and publishes it to GitHub Pages for human readers.
2. An **MCP (Model Context Protocol) server** under `mcp-server/` that reads the same `.adoc` files at startup, renders and chunks them, embeds them via an external embeddings API, and exposes semantic search and page retrieval to a future AI agent over Streamable HTTP.

The two systems share content but nothing else: no configuration, no build pipeline, no runtime. The MCP server is retrieval-only and does not generate text with an LLM. For the full bird's-eye view, see [Repository Architecture Overview](architecture/overview.md).

This wiki is **generated** by the scheduled `openwiki-update.yml` GitHub Actions workflow and refreshed via an LLM provider; do not hand-edit generated pages unless explicitly asked. Prefer updating the source code/docs and letting OpenWiki regenerate.

## Required tools

The two systems live in separate `package.json` projects and have **different Node version requirements**:

| System | Location | Node version | Notes |
|---|---|---|---|
| Docs site | repo root `package.json` | Node.js 18+ (tested with Node 20.18.1; CI pins Node 20) | Antora toolchain, Sass theme, Kroki, Lunr search |
| MCP server | `mcp-server/package.json` | Node.js `>=22` (declared via the `engines` field) | TypeScript, Express, MCP SDK, OpenAI embeddings |
| Local preview | repo root `package.json` | — | Python 3 (the `preview` script runs `python3 -m http.server`) |
| OpenWiki refresh | `.github/workflows/openwiki-update.yml` | Node 22 (pinned in the workflow) | Runs `openwiki code --update` daily |

Both the docs build and the MCP server's first boot require network access: the docs build fetches Kroki diagrams from `https://kroki.nmlabs.gr`, and the MCP server calls the OpenAI embeddings API on a cache miss. For the operational commands, output locations, and common pitfalls, see [Local Build & Preview Operations](operations/build-and-preview.md).

## Task-routing map

Use this map to jump straight to the right page for a given task. Each row lists the task, where to make the change, and the wiki pages that explain the relevant mechanisms.

| If you want to… | Go to |
|---|---|
| Author or edit a documentation page | [nmecar Documentation Corpus](concepts/docs-corpus.md) (content map) + [Antora Build Flow](workflows/docs-build-flow.md) (what the build touches) |
| Change the navigation, partials, or AsciiDoc attributes/ conventions | [Antora Site Structure & Conventions](concepts/antora-site.md) |
| Understand or change the MCP ingest → index → serve pipeline | [Ingestion & Indexing Pipeline](workflows/ingest-index-pipeline.md) |
| Understand or change how a single MCP request is handled | [MCP Request Handling Flow](workflows/mcp-request-flow.md) |
| Get the conceptual model of the MCP server (tools, store, transport) | [MCP Server Architecture](concepts/mcp-server.md) |
| Switch or add an embeddings provider (OpenAI/Gemini) | [Embeddings Providers](integrations/embeddings-providers.md) |
| Author or render diagrams (Kroki/PlantUML/Mermaid) | [Kroki & Diagrams Integration](integrations/kroki-and-diagrams.md) |
| Understand the relationship to the sibling car-rental app repo or `specs/` | [Sibling Application & Specs Integration](integrations/sibling-app.md) |
| Build, preview, or run things locally | [Local Build & Preview Operations](operations/build-and-preview.md) |
| Change deployment, Docker, or Kubernetes for the MCP server | [MCP Server Deployment](operations/mcp-deployment.md) |
| Change CI/CD (publish, image build, OpenWiki refresh) | [CI/CD Pipelines](operations/cicd.md) |
| Run or extend the MCP server tests | [MCP Server Testing](testing/mcp-server-tests.md) |

## Quick orientation by domain

- **Architecture** — [overview](architecture/overview.md): the shared corpus and the two decoupled consumers.
- **Concepts** — [Antora site](concepts/antora-site.md), [docs corpus](concepts/docs-corpus.md), [MCP server](concepts/mcp-server.md): the conceptual models behind each system.
- **Workflows** — [docs build flow](workflows/docs-build-flow.md), [ingest/index pipeline](workflows/ingest-index-pipeline.md), [MCP request flow](workflows/mcp-request-flow.md): the end-to-end traces for each runtime path.
- **Integrations** — [embeddings providers](integrations/embeddings-providers.md), [Kroki & diagrams](integrations/kroki-and-diagrams.md), [sibling app & specs](integrations/sibling-app.md): the external boundaries.
- **Operations** — [local build & preview](operations/build-and-preview.md), [CI/CD](operations/cicd.md), [MCP deployment](operations/mcp-deployment.md): runbooks for building, shipping, and deploying.
- **Testing** — [MCP server tests](testing/mcp-server-tests.md): the vitest suite, smoke script, and manual verification flow.

## Two Node versions, one repo

Because the docs site and the MCP server are separate projects with separate toolchains, the same checkout needs different Node versions depending on what you are doing:

- **Working on the docs site** (`npm run build:site`, `npm run preview`) — use Node 20 (the version CI pins for the publish workflow). The root `package.json` declares the Antora 3.1 toolchain, `sass`, the Lunr extension, and the Asciidoctor Kroki/Tabs extensions.
- **Working on the MCP server** (`npm run dev`, `npm test`, `npm run smoke`, `npm run ingest:dump` from inside `mcp-server/`) — use Node 22 (the `engines` field in `mcp-server/package.json` requires `>=22`). The MCP `package.json` declares `@modelcontextprotocol/sdk`, `express`, `openai`, `html-to-text`, `zod`, and `@asciidoctor/core`.

Both toolchains are installed independently with `npm install` in their respective directories. If an install is partial or fails due to network issues, delete `node_modules` and retry.
