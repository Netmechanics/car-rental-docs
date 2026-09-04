# Files

- [Embeddings Providers](embeddings-providers.md) - How the MCP server abstracts embedding generation, selects between OpenAI and Gemini providers, batches and retries API calls, and ties the chosen model into the content-hash cache key.
- [Kroki & Diagrams Integration](kroki-and-diagrams.md) - How diagrams are authored, rendered at build time, and stripped from the MCP ingest pipeline — the asciidoctor-kroki extension, kroki.nmlabs.gr server, kroki-fetch-diagram build-time fetch, and the resolveMacros KROKI_BLOCK_RE.
- [Sibling Application & Specs Integration](sibling-app.md) - Explains how the nmecar docs repo relates to the external nmecar car-rental app repo (implementation source of truth) and the in-repo specs/ reference materials — the two complementary sources authors consult to keep documentation accurate.
