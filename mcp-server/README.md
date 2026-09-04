# nmecar Docs MCP Server

Lightweight [Model Context Protocol](https://modelcontextprotocol.io) server που σερβίρει semantic search στην τεκμηρίωση του **nmecar** (Antora AsciiDoc corpus).

## Τι κάνει

Εκθέτει 3 MCP tools πάνω από Streamable HTTP:

| Tool | Περιγραφή |
|---|---|
| `search_nmecar_docs` | Semantic search — επιστρέφει τα πιο σχετικά αποσπάσματα |
| `get_doc_page` | Πλήρες κείμενο μιας συγκεκριμένης σελίδας |
| `list_doc_sections` | Κατάλογος όλων των σελίδων και ενοτήτων |

## Τοπική εκτέλεση

```bash
cp .env.example .env
# Συμπλήρωσε OPENROUTER_API_KEY και MCP_AUTH_TOKEN στο .env

npm install
npm run dev
# → http://localhost:8765/health
```

Για να δεις το extracted content:

```bash
npm run ingest:dump
# → data/_dump/**/*.txt και *.chunks.json
```

## Deploy με Docker

Το image χτίζεται από τη **ρίζα του repo** (ώστε να έχει πρόσβαση στα docs/):

```bash
docker build -t nmecar-docs-mcp:latest -f mcp-server/Dockerfile .

docker run --rm -p 8765:8765 \
  -e OPENROUTER_API_KEY=sk-or-... \
  -e MCP_AUTH_TOKEN=your-secret-token \
  -v $(pwd)/.mcp-data:/data \
  nmecar-docs-mcp:latest
```

Το `/data` volume κρατά τον vector index — το δεύτερο boot φορτώνει από cache χωρίς να ξανακαλεί το embeddings API.

## Σύνδεση MCP client

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

## Environment variables

| Μεταβλητή | Default | Περιγραφή |
|---|---|---|
| `PORT` | `8765` | HTTP port |
| `DOCS_ROOT` | — | Φάκελος .adoc pages |
| `PARTIALS_ROOT` | — | Φάκελος partials |
| `EXAMPLES_ROOT` | — | Φάκελος examples |
| `DATA_DIR` | `/data` | Cache vector index |
| `EMBEDDING_PROVIDER` | `openrouter` | `openrouter`, `openai` ή `gemini` |
| `OPENROUTER_API_KEY` | — | Υποχρεωτικό αν provider=openrouter |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | Base URL για OpenRouter |
| `OPENROUTER_EMBED_MODEL` | `openai/text-embedding-3-small` | Μοντέλο embeddings μέσω OpenRouter |
| `OPENAI_API_KEY` | — | Υποχρεωτικό αν provider=openai |
| `OPENAI_EMBED_MODEL` | `text-embedding-3-small` | Μοντέλο embeddings (OpenAI direct) |
| `MCP_AUTH_TOKEN` | — | Bearer token (υποχρεωτικό σε prod) |
| `ALLOWED_ORIGINS` | `*` | CORS origins (comma-separated) |
| `LOG_LEVEL` | `info` | `debug`/`info`/`warn`/`error` |

## CI/CD

Push στα branches `mcp-integration` ή `master` που αγγίζει `docs/**` ή `mcp-server/**` → αυτόματο build & push στο `ghcr.io/netmechanics/nmecar-docs-mcp`.
