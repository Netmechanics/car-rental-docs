# MCP_SERVER_PLAN.md — nmecar Docs MCP Server (Build Spec)

> **Σκοπός αυτού του εγγράφου:** Πλήρες, αυτοτελές πλάνο κατασκευής που εκτελείται **βήμα-βήμα** από έναν AI agent ή developer. Κάθε φάση έχει στόχο, αρχεία, εντολές και **κριτήρια αποδοχής**. Δεν απαιτείται άλλο context πέρα από αυτό το αρχείο και το περιεχόμενο του repo.
>
> **Ρόλος συντάκτη:** Senior Software System Architect. **Εκτελεστής:** άλλος AI agent / developer.
>
> **Γλώσσα:** Επεξηγήσεις στα Ελληνικά· κώδικας, εντολές, identifiers στα Αγγλικά.

---

## 0. Πλαίσιο & Στόχος

### 0.1 Τι χτίζουμε
Έναν **custom lightweight MCP server** (Model Context Protocol) που σερβίρει το περιεχόμενο της τεκμηρίωσης του **nmecar** (αυτό το Antora repo) σε έναν **μελλοντικό AI agent** — βοηθό της εφαρμογής nmecar. Ο server κάνει **retrieval μόνο** (semantic search + ανάκτηση σελίδων). Η παραγωγή απαντήσεων ανήκει στον AI agent, που είναι ξεχωριστό, μελλοντικό σύστημα.

### 0.2 Επικυρωμένες αποφάσεις (μη τις αλλάξεις χωρίς έγκριση)
| Απόφαση | Επιλογή |
|---|---|
| Προσέγγιση | **Custom server** στο repo (όχι το έτοιμο `arabold/docs-mcp-server`) |
| Embeddings | **Cloud** — default `OpenAI text-embedding-3-small` (εναλλακτικά Gemini `text-embedding-004`) |
| Πηγή περιεχομένου | **AsciiDoc source από git** (όχι built HTML, όχι scraping) |
| Γλώσσα υλοποίησης | **TypeScript** (Node 22 LTS) |
| Transport | **Streamable HTTP** (ο agent θα είναι remote) |
| Deployment | **Docker image** → GHCR |

### 0.3 Μη-στόχοι (Non-goals)
- Δεν φτιάχνουμε τον AI agent εδώ — μόνο τον MCP server.
- Δεν αγγίζουμε το υπάρχον Antora setup (`antora-playbook.yml`, `docs/`, `publish.yml`).
- Δεν κάνουμε generation/LLM απαντήσεις στον server.
- Δεν υλοποιούμε versioning ανά έκδοση docs σε αυτή τη φάση (single corpus = current).

### 0.4 Μέγεθος corpus (για διαστασιολόγηση)
~41 σελίδες `.adoc`, ~15.400 λέξεις, στα **Ελληνικά**. Μικρό → in-memory vector store με cosine similarity αρκεί· **δεν χρειάζεται** εξωτερική vector DB.

---

## 1. Αρχιτεκτονική

```
docs/modules/ROOT/pages/**/*.adoc   (source of truth — git)
        │
        ▼
[1] Ingestion ── asciidoctor render + Antora macro resolution ──► καθαρό κείμενο/σελίδα
        │
        ▼
[2] Chunking ── split ανά heading (==/===), metadata: {page, section, title}
        │
        ▼
[3] Embeddings ── OpenAI text-embedding-3-small ──► vectors (1536 dims)
        │
        ▼
[4] Vector Store ── in-memory + cosine, JSON cache σε volume (keyed by content hash)
        │
        ▼
[5] MCP Server ── streamable HTTP @ :8765 + bearer auth
        │
        ▼
   (μελλοντικός) AI Agent  ──►  τελικός χρήστης nmecar
```

### 1.1 Ροή δεδομένων στο startup
1. Φόρτωση όλων των `pages/**/*.adoc`.
2. Υπολογισμός `contentHash` (sha256 όλων των source files + έκδοση pipeline).
3. Αν υπάρχει cache με ίδιο hash στο volume → φόρτωσε vectors από cache (skip embeddings).
4. Αλλιώς → render → chunk → embed → γράψε cache.
5. Σήκωσε HTTP server, κατάστασε tools διαθέσιμα.

---

## 2. Tech Stack & Εξαρτήσεις

| Πακέτο | Έκδοση (ελάχιστη) | Ρόλος |
|---|---|---|
| `node` | 22 LTS | runtime |
| `typescript` | ^5.5 | γλώσσα |
| `@modelcontextprotocol/sdk` | latest | MCP server + streamable HTTP transport |
| `@asciidoctor/core` | ^3 | render `.adoc` → HTML |
| `html-to-text` | ^9 | HTML → καθαρό κείμενο |
| `openai` | ^4 | embeddings client (ή `@google/genai` για Gemini) |
| `zod` | ^3 | input schemas για MCP tools |
| `express` | ^5 | HTTP layer για το streamable transport |
| `tsx` | ^4 (dev) | τοπικό run χωρίς build |
| `vitest` | ^2 (dev) | unit tests |

> **ΣΗΜΕΙΩΣΗ προς εκτελεστή:** Το API του `@modelcontextprotocol/sdk` εξελίσσεται. Πριν γράψεις τον MCP layer (Φάση 5), **επιβεβαίωσε την τρέχουσα τεκμηρίωση** του SDK για `McpServer`, `registerTool`, και `StreamableHTTPServerTransport`. Τα skeletons παρακάτω αντικατοπτρίζουν το γνωστό μοτίβο — προσάρμοσέ τα αν χρειαστεί.

---

## 3. Δομή φακέλων (τελική)

```
mcp-server/
├── package.json
├── tsconfig.json
├── Dockerfile
├── .dockerignore
├── .env.example
├── README.md
├── src/
│   ├── index.ts                 # entrypoint: config, build index, start HTTP server
│   ├── config.ts                # ENV parsing + validation (zod)
│   ├── logger.ts                # structured logging
│   ├── ingest/
│   │   ├── loadAdoc.ts          # walk pages/**/*.adoc → {path, raw}
│   │   ├── resolveMacros.ts     # Antora macro → asciidoctor-friendly
│   │   ├── render.ts            # asciidoctor → HTML → text
│   │   └── chunk.ts             # split ανά heading → chunks με metadata
│   ├── indexing/
│   │   ├── embed.ts             # provider-agnostic embeddings client
│   │   ├── store.ts             # in-memory vector store + cosine + persistence
│   │   └── hash.ts              # contentHash util
│   ├── tools/
│   │   ├── searchDocs.ts
│   │   ├── getPage.ts
│   │   └── listSections.ts
│   └── mcp/
│       ├── server.ts            # McpServer + tool registration
│       └── httpTransport.ts     # express + StreamableHTTPServerTransport + auth
├── test/
│   ├── resolveMacros.test.ts
│   ├── chunk.test.ts
│   └── store.test.ts
└── data/                        # (volume) cache embeddings — gitignored
```

---

## 4. ΦΑΣΕΙΣ ΥΛΟΠΟΙΗΣΗΣ (βήμα-βήμα)

> Κάθε φάση: **Στόχος → Βήματα → Κριτήρια αποδοχής**. Μη προχωράς στην επόμενη αν δεν περάσουν τα κριτήρια.

---

### ΦΑΣΗ 1 — Scaffold & Project Setup

**Στόχος:** Έτοιμο TypeScript project που τρέχει ένα «hello» HTTP healthcheck.

**Βήματα:**
1. Δημιούργησε φάκελο `mcp-server/` στη ρίζα του repo (branch `mcp-integration`).
2. `npm init -y` και ρύθμισε `package.json`:
   ```jsonc
   {
     "name": "nmecar-docs-mcp-server",
     "version": "0.1.0",
     "type": "module",
     "engines": { "node": ">=22" },
     "scripts": {
       "dev": "tsx watch src/index.ts",
       "build": "tsc -p tsconfig.json",
       "start": "node dist/index.js",
       "test": "vitest run",
       "typecheck": "tsc --noEmit"
     }
   }
   ```
3. Πρόσθεσε εξαρτήσεις (Ενότητα 2).
4. `tsconfig.json`: target `ES2022`, module `NodeNext`, `moduleResolution NodeNext`, `outDir dist`, `strict: true`, `rootDir src`.
5. `.dockerignore`: `node_modules`, `dist`, `data`, `.env`.
6. `.env.example` με όλες τις ENV (Ενότητα 9).
7. `src/config.ts`: parse + validate ENV με zod· fail-fast αν λείπει το API key.
8. `src/logger.ts`: απλό structured logger (JSON lines).
9. `src/index.ts`: σήκωσε express με `GET /health` → `{ status: "ok" }`.
10. Πρόσθεσε `mcp-server/data/` στο root `.gitignore`.

**Κριτήρια αποδοχής:**
- [ ] `npm run dev` σηκώνει server· `curl localhost:8765/health` → `{"status":"ok"}`.
- [ ] `npm run typecheck` περνά χωρίς errors.

---

### ΦΑΣΗ 2 — Ingestion (AsciiDoc → καθαρό κείμενο) ⚠️ ΤΟ ΠΙΟ ΚΡΙΣΙΜΟ

**Στόχος:** Από κάθε `.adoc` να παράγεται καθαρό, αναγνώσιμο κείμενο, με σωστή επίλυση των Antora macros.

#### 2.1 `loadAdoc.ts`
- Κάνε glob `docs/modules/ROOT/pages/**/*.adoc` (σχετικά με το repo root· το path δίνεται από ENV `DOCS_ROOT`).
- Επέστρεψε `{ path: string, relPath: string, raw: string }[]`.
- Εξαίρεσε κενά/stub αρχεία (π.χ. `pricing_analysis.adoc` — μόνο τίτλος). Κανόνας: skip αν `raw` < 50 μη-κενοί χαρακτήρες μετά τον τίτλο.

#### 2.2 `resolveMacros.ts` — Antora macro resolution
Το plain asciidoctor **δεν** καταλαβαίνει τα Antora resource IDs (`partial$`, `example$`, `image$`). Κάνε preprocessing **πριν** το render. Κανόνες μετασχηματισμού:

| Pattern (regex) | Ενέργεια |
|---|---|
| `include::partial\$([^\[\]]+)\[\]` | Αναδρομικό inline του `docs/modules/ROOT/partials/$1`. Τα `nav_*.adoc` partials → **skip** (navigation θόρυβος). |
| `include::example\$([^\[\]]+)\[.*?\]` | Inline του `docs/modules/ROOT/examples/$1` μέσα σε code fence (χρήσιμο context κώδικα). |
| `xref:[^\[]+\[([^\]]*)\]` | Αντικατάσταση με το link text `$1`· αν κενό, με το basename του target. |
| `image::?[^\[]*\[([^\]]*)\]` | Αντικατάσταση με το alt text `$1` (ή drop αν κενό). |
| Kroki blocks: `\[(plantuml\|mermaid\|graphviz)[^\]]*\]\s*\.{4}[\s\S]*?\.{4}` | **Αφαίρεση** όλου του block (ο source κώδικας διαγράμματος είναι θόρυβος για embeddings). Κάλυψε και `----` delimiter. |
| `:attribute:` definitions | Άφησέ τα στο asciidoctor να τα κάνει resolve. |

> **Προσοχή:** Το inline των includes πρέπει να είναι **αναδρομικό** (ένα partial μπορεί να κάνει include άλλο). Βάλε guard για κυκλικές αναφορές (max depth 10).

#### 2.3 `render.ts`
- Πέρνα το preprocessed κείμενο στο `@asciidoctor/core`: `asciidoctor.convert(src, { safe: 'safe', standalone: false, attributes: { 'icons': 'font' } })`.
- HTML → text με `html-to-text` (options: `wordwrap: false`, drop links to href, κράτα πίνακες ως κείμενο).
- Επέστρεψε `{ relPath, title, text }`. Ο `title` = το πρώτο `= Heading` (document title).

#### 2.4 Verification script
Πρόσθεσε προσωρινό `npm run ingest:dump` που γράφει το extracted text κάθε σελίδας στο `data/_dump/` για οπτικό έλεγχο.

**Κριτήρια αποδοχής:**
- [ ] Όλες οι μη-stub σελίδες παράγουν μη-κενό κείμενο.
- [ ] Δεν υπάρχουν leftover `include::`, `xref:`, `image::`, `plantuml`, `....` στο output.
- [ ] Τα Java examples εμφανίζονται ως κείμενο όπου γίνονταν include.
- [ ] Οι πίνακες (π.χ. roles matrix, scheduled-jobs) είναι αναγνώσιμοι ως κείμενο.
- [ ] Unit test `resolveMacros.test.ts` καλύπτει κάθε pattern του 2.2.

---

### ΦΑΣΗ 3 — Chunking

**Στόχος:** Κάθε σελίδα να σπάει σε semantically coherent chunks με metadata.

#### 3.1 Στρατηγική (`chunk.ts`)
- Split στα headings `==` (section) και `===` (subsection).
- Κάθε chunk φέρει **context prefix**: `«{pageTitle} › {sectionHeading}»` στην αρχή του text (βελτιώνει το retrieval).
- **Μέγεθος-στόχος:** 200–800 tokens/chunk (προσέγγισε: 1 token ≈ 0.75 ελληνικές λέξεις· ή χρησιμοποίησε char count ≈ 4 chars/token).
  - Αν chunk > 800 tokens → split περαιτέρω ανά παράγραφο (κενή γραμμή).
  - Αν chunk < ~80 tokens → merge με το επόμενο sibling του ίδιου section.
- Metadata ανά chunk:
  ```ts
  interface Chunk {
    id: string;          // `${relPath}#${sectionSlug}-${i}`
    relPath: string;     // π.χ. "booking/discounts.adoc"
    pageTitle: string;
    section: string;     // heading της ενότητας ("" για intro)
    text: string;        // με context prefix
    tokensApprox: number;
  }
  ```

**Κριτήρια αποδοχής:**
- [ ] Κανένα chunk > ~1000 tokens.
- [ ] Κάθε chunk έχει σταθερό, μοναδικό `id`.
- [ ] Unit test `chunk.test.ts` με sample multi-section page.

---

### ΦΑΣΗ 4 — Embeddings & Vector Store

**Στόχος:** Embeddings ανά chunk + in-memory search με persistence cache.

#### 4.1 `embed.ts` (provider-agnostic)
```ts
export interface Embedder {
  readonly model: string;
  readonly dims: number;
  embed(texts: string[]): Promise<number[][]>;  // batched
}
```
- Default impl: OpenAI `text-embedding-3-small` (dims 1536). Batch ≤ 100 inputs/request.
- Πρόσθεσε retry με exponential backoff (3 προσπάθειες) σε 429/5xx.
- Factory βάσει `EMBEDDING_PROVIDER` (`openai` | `gemini`).

#### 4.2 `hash.ts`
- `contentHash(chunks) = sha256(join(sorted chunk.text) + PIPELINE_VERSION + model)`.
- `PIPELINE_VERSION` σταθερά στον κώδικα — αύξησέ την όταν αλλάζει το ingestion/chunking ώστε να ακυρώνεται το cache.

#### 4.3 `store.ts`
```ts
interface StoredVector { id: string; vector: number[]; chunk: Chunk; }
class VectorStore {
  build(chunks: Chunk[], embedder: Embedder): Promise<void>;
  search(queryVec: number[], k: number): { chunk: Chunk; score: number }[]; // cosine
  saveToDisk(path: string, hash: string): void;
  static loadFromDisk(path: string, expectedHash: string): VectorStore | null;
}
```
- Cosine similarity (normalize vectors κατά την αποθήκευση → dot product).
- Persistence: JSON στο `${DATA_DIR}/index-${hash}.json`. Στο startup: αν υπάρχει αρχείο με τρέχον hash → load· αλλιώς build + save.

**Κριτήρια αποδοχής:**
- [ ] Πρώτο boot: καλεί embeddings API, γράφει cache.
- [ ] Δεύτερο boot (ίδιο content): **δεν** καλεί API, φορτώνει από cache (< 2s).
- [ ] `search` επιστρέφει σχετικά chunks για ελληνικό query (manual check).
- [ ] Unit test `store.test.ts` με fake embedder (deterministic vectors).

---

### ΦΑΣΗ 5 — MCP Layer (tools + streamable HTTP)

**Στόχος:** Έκθεση 3 MCP tools πάνω από streamable HTTP με auth.

#### 5.1 Tool contracts

**`search_nmecar_docs`** — semantic search.
```jsonc
// input
{ "query": "string (η ερώτηση)", "k": "number? (default 5, max 20)" }
// output (content: text με JSON)
{
  "results": [
    { "page": "booking/discounts.adoc", "title": "Εκπτώσεις",
      "section": "Προτεραιότητα εφαρμογής", "score": 0.83,
      "text": "..." }
  ]
}
```

**`get_doc_page`** — πλήρες κείμενο σελίδας.
```jsonc
// input
{ "path": "booking/discounts.adoc" }
// output
{ "path": "...", "title": "...", "text": "<πλήρες rendered text>" }
```

**`list_doc_sections`** — κατάλογος για discovery.
```jsonc
// input: {}
// output
{ "pages": [ { "path": "booking/discounts.adoc", "title": "Εκπτώσεις",
              "sections": ["Τύποι", "Προτεραιότητα εφαρμογής", "..."] } ] }
```

#### 5.2 `mcp/server.ts` (skeleton — επιβεβαίωσε το SDK API)
```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function buildMcpServer(store: VectorStore, embedder: Embedder, pages: PageIndex) {
  const server = new McpServer({ name: "nmecar-docs", version: "0.1.0" });

  server.registerTool("search_nmecar_docs",
    { title: "Search nmecar docs",
      description: "Semantic search στην τεκμηρίωση του nmecar. Επέστρεψε τα πιο σχετικά αποσπάσματα.",
      inputSchema: { query: z.string(), k: z.number().int().min(1).max(20).optional() } },
    async ({ query, k = 5 }) => {
      const [qv] = await embedder.embed([query]);
      const hits = store.search(qv, k);
      return { content: [{ type: "text", text: JSON.stringify({ results: hits.map(...) }) }] };
    });

  // get_doc_page, list_doc_sections ομοίως
  return server;
}
```

#### 5.3 `mcp/httpTransport.ts`
- Express route `POST /mcp` (+ `GET`/`DELETE` αν χρειαστεί από το SDK).
- **Stateless mode** (απλούστερο για read-only retrieval): νέο `StreamableHTTPServerTransport` ανά request με `sessionIdGenerator: undefined`.
- **Auth middleware:** έλεγξε `Authorization: Bearer <MCP_AUTH_TOKEN>`· 401 αλλιώς. Παράκαμψη για `/health`.
- CORS: επίτρεψε μόνο τα origins από `ALLOWED_ORIGINS` (ENV).

**Κριτήρια αποδοχής:**
- [ ] Με MCP Inspector (`npx @modelcontextprotocol/inspector`) ή curl, τα 3 tools απαριθμούνται και εκτελούνται.
- [ ] `search_nmecar_docs` με ελληνικό query επιστρέφει σχετικά αποτελέσματα.
- [ ] Request χωρίς/λάθος bearer token → 401.
- [ ] `get_doc_page` με άκυρο path → καθαρό error (όχι crash).

---

### ΦΑΣΗ 6 — Docker

**Στόχος:** Reproducible image που τρέχει τον server με baked-in το `.adoc` content.

#### 6.1 `Dockerfile` (multi-stage)
```dockerfile
# ---- builder ----
FROM node:22-slim AS builder
WORKDIR /app
COPY mcp-server/package*.json ./
RUN npm ci
COPY mcp-server/ ./
RUN npm run build

# ---- runtime ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY mcp-server/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Baked content (read-only): τα .adoc + examples + partials
COPY docs/modules/ROOT/pages   ./docs/pages
COPY docs/modules/ROOT/examples ./docs/examples
COPY docs/modules/ROOT/partials ./docs/partials
ENV DOCS_ROOT=/app/docs/pages \
    PARTIALS_ROOT=/app/docs/partials \
    EXAMPLES_ROOT=/app/docs/examples \
    DATA_DIR=/data \
    PORT=8765
VOLUME ["/data"]
EXPOSE 8765
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://localhost:8765/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
```

> **Σημείωση paths:** Στο image τα partials/examples είναι σε flat folders· ο `resolveMacros.ts` πρέπει να διαβάζει από `PARTIALS_ROOT`/`EXAMPLES_ROOT` (ENV), όχι από hardcoded Antora paths. Φρόντισέ το στη Φάση 2.

#### 6.2 Τοπικό test
```bash
docker build -t nmecar-docs-mcp:dev -f mcp-server/Dockerfile .
docker run --rm -p 8765:8765 \
  -e OPENAI_API_KEY=sk-... \
  -e MCP_AUTH_TOKEN=devtoken \
  -v $(pwd)/.mcp-data:/data \
  nmecar-docs-mcp:dev
```

**Κριτήρια αποδοχής:**
- [ ] `docker build` πετυχαίνει· image < ~300MB.
- [ ] Container σηκώνεται, `/health` ok, tools δουλεύουν μέσω HTTP.
- [ ] Δεύτερο run με ίδιο volume → δεν ξανακαλεί embeddings API.

---

### ΦΑΣΗ 7 — CI/CD (GHCR)

**Στόχος:** Αυτόματο build & push image, ανεξάρτητα από το υπάρχον `publish.yml`.

**Βήματα:**
1. Νέο `.github/workflows/mcp-image.yml`.
2. Trigger: `push` σε `mcp-integration` και `master`, **μόνο** όταν αλλάζουν `docs/**` ή `mcp-server/**` (paths filter).
3. Jobs: checkout → setup Node 22 → `npm ci` + `npm run typecheck` + `npm test` (στο `mcp-server/`) → `docker/build-push-action` → push σε `ghcr.io/netmechanics/nmecar-docs-mcp:<sha>` + `:latest`.
4. Auth στο GHCR με `GITHUB_TOKEN` (permissions: `packages: write`).
5. **Μην** βάλεις το `OPENAI_API_KEY` στο CI — το image δεν χρειάζεται embeddings στο build (το index χτίζεται στο runtime/startup).

**Κριτήρια αποδοχής:**
- [ ] Push που αγγίζει `mcp-server/` σκανδαλίζει το workflow.
- [ ] Push που αγγίζει μόνο άσχετα αρχεία **δεν** το σκανδαλίζει.
- [ ] Το image εμφανίζεται στο GHCR με σωστά tags.

---

### ΦΑΣΗ 8 — Smoke Tests & Αξιολόγηση Retrieval

**Στόχος:** Επιβεβαίωση ότι το semantic search επιστρέφει σωστά αποτελέσματα σε **πραγματικές ελληνικές ερωτήσεις**.

**Βήματα:** Τρέξε κάθε query μέσω `search_nmecar_docs` και επιβεβαίωσε ότι το top-1/top-3 περιέχει τη σωστή σελίδα:

| # | Ερώτηση | Αναμενόμενη σελίδα (top-3) |
|---|---|---|
| 1 | «Πώς εφαρμόζονται οι εκπτώσεις και ποια έχει προτεραιότητα;» | `booking/discounts.adoc` |
| 2 | «Πάνω σε ποιο ποσό υπολογίζεται το κουπόνι;» | `booking/coupons.adoc` |
| 3 | «Τι γίνεται όταν δύο σεζόν επικαλύπτονται;» | `booking/seasons.adoc` |
| 4 | «Πώς τιμολογούνται οι μέρες πέρα από το τελευταίο threshold;» | `fleet/vehicle_groups.adoc` |
| 5 | «Πώς αναθέτω ρόλο σε χρήστη;» | `admin/roles.adoc` |
| 6 | «Πώς δουλεύει η πληρωμή με κατάθεση τραπέζης;» | `admin/payments.adoc` |
| 7 | «Ποια scheduled jobs τρέχουν και πότε;» | `technical/scheduled-jobs.adoc` |
| 8 | «Χρέωση ανάλογα με την ηλικία οδηγού.» | `admin/driver-age-charges.adoc` |
| 9 | «Πώς φιλτράρω logs ανά εφαρμογή στο Grafana;» | `technical/logging.adoc` |
| 10 | «Ποια πεδία μιας ενοικίασης είναι επεξεργάσιμα;» | `booking/rentals.adoc` |

**Κριτήρια αποδοχής:**
- [ ] ≥ 8/10 queries: η σωστή σελίδα στο **top-3**.
- [ ] ≥ 6/10 queries: η σωστή σελίδα στο **top-1**.
- [ ] Αν αποτύχει → tune chunking (μέγεθος/context prefix) ή k, και ξανατρέξε.

---

## 5. Ορισμός «Έτοιμο» (Definition of Done)
- [ ] Όλες οι φάσεις 1–8 με τα κριτήριά τους ✅.
- [ ] `README.md` στο `mcp-server/` με: τι κάνει, πώς τρέχει local, πώς γίνεται deploy, πώς συνδέεται client.
- [ ] `npm run typecheck` + `npm test` πράσινα.
- [ ] Image στο GHCR, δοκιμασμένο με MCP Inspector.
- [ ] Ενημέρωση `SPECS.md` (νέο artifact) και `.wolf/anatomy.md`/`memory.md` (OpenWolf protocol).

---

## 6. Configuration Reference (ENV)

| ENV | Default | Περιγραφή |
|---|---|---|
| `PORT` | `8765` | HTTP port |
| `DOCS_ROOT` | — | Φάκελος με τα `.adoc` pages |
| `PARTIALS_ROOT` | — | Φάκελος partials |
| `EXAMPLES_ROOT` | — | Φάκελος examples |
| `DATA_DIR` | `/data` | Cache embeddings |
| `EMBEDDING_PROVIDER` | `openai` | `openai` ή `gemini` |
| `OPENAI_API_KEY` | — | (αν openai) |
| `OPENAI_EMBED_MODEL` | `text-embedding-3-small` | μοντέλο |
| `GEMINI_API_KEY` | — | (αν gemini) |
| `MCP_AUTH_TOKEN` | — | bearer token (υποχρεωτικό σε prod) |
| `ALLOWED_ORIGINS` | `*` | CORS origins |
| `LOG_LEVEL` | `info` | logging |

---

## 7. Παραδοχές & Κίνδυνοι (Architect's notes)

| Θέμα | Σημείωση |
|---|---|
| **Antora macro resolution** | Το πιο εύθραυστο κομμάτι. Επένδυσε στα unit tests της Φάσης 2. Αν το manual inline αποδειχθεί δύσκολο, εναλλακτική: rewrite των `partial$`/`example$` σε filesystem-relative include paths και άσε το asciidoctor (`safe: 'unsafe'`, `base_dir`) να κάνει το resolve. |
| **Ελληνικά embeddings** | Το `text-embedding-3-small` αποδίδει καλά στα Ελληνικά. Αν η ποιότητα είναι χαμηλή στη Φάση 8, δοκίμασε `text-embedding-3-large`. |
| **Re-indexing** | Με baked content + startup indexing, η ενημέρωση docs απαιτεί rebuild/redeploy του image. Αποδεκτό για την τρέχουσα συχνότητα αλλαγών. |
| **Stub σελίδες** | `technical/pricing_analysis.adoc` (κενό) — εξαιρείται από ingestion (κανόνας 2.1). |
| **Auth** | Stateless HTTP + bearer token επαρκεί για server-to-server. Αν ο agent γίνει multi-tenant, σκέψου OAuth2 αργότερα. |
| **Versioning docs** | Εκτός scope τώρα· αν χρειαστεί, πρόσθεσε `version` metadata στα chunks και φίλτρο στο search. |

---

## 8. Σειρά εκτέλεσης (TL;DR για τον εκτελεστή)
1. Φ1 Scaffold → healthcheck.
2. Φ2 Ingestion (⚠️ tests).
3. Φ3 Chunking.
4. Φ4 Embeddings + store + cache.
5. Φ5 MCP tools + HTTP + auth.
6. Φ6 Docker.
7. Φ7 CI → GHCR.
8. Φ8 Smoke tests (≥8/10 top-3).
9. README + DoD.

> Μη συμπιέζεις φάσεις. Κάθε φάση κλείνει με τα κριτήρια αποδοχής της πριν την επόμενη.
