# Οδηγός Δοκιμών — nmecar Docs MCP Server

Αυτό το έγγραφο εξηγεί πώς να δοκιμάσεις τον MCP server, τόσο αυτόματα όσο και χειροκίνητα.

---

## Προαπαιτούμενα

Πριν ξεκινήσεις, χρειάζεσαι:

1. **Node.js ≥20** εγκατεστημένο
2. **OpenAI API Key** με πρόσβαση στο `text-embedding-3-small`
3. Το repo κλωνοποιημένο τοπικά, branch `mcp-integration`

---

## Βήμα 1 — Ρύθμιση περιβάλλοντος

```bash
cd mcp-server
cp .env.example .env
```

Άνοιξε το `.env` και συμπλήρωσε:

```
OPENAI_API_KEY=sk-proj-...        # το πραγματικό σου key
MCP_AUTH_TOKEN=mysecrettoken      # ό,τι θέλεις — το ίδιο θα χρησιμοποιείς στα requests
```

Εγκατάστασε τις εξαρτήσεις:

```bash
npm install
```

---

## Βήμα 2 — Εκκίνηση server

```bash
npm run dev
```

Αν όλα πάνε καλά, βλέπεις:

```json
{"ts":"...","level":"info","message":"Loaded .adoc files","count":40}
{"ts":"...","level":"info","message":"Cache miss — building vector index (calling embeddings API)"}
{"ts":"...","level":"info","message":"Vector index built","vectors":...}
{"ts":"...","level":"info","message":"MCP server ready","port":8765,"vectors":...}
```

> Η πρώτη εκκίνηση καλεί το OpenAI API (~40 requests για τα chunks). Κοστίζει μερικά cents. Κάθε επόμενη εκκίνηση φορτώνει από cache.

Επιβεβαίωσε ότι τρέχει:

```bash
curl http://localhost:8765/health
# → {"status":"ok"}
```

---

## Αυτόματες δοκιμές (Φάση 8)

Με τον server ήδη σε λειτουργία, σε άλλο terminal:

```bash
MCP_AUTH_TOKEN=mysecrettoken npm run smoke
```

Το script τρέχει 10 ελληνικά queries και βγάζει report:

```
══════════════════════════════════════════════
  nmecar MCP Server — Φάση 8 Smoke Tests
══════════════════════════════════════════════

✓ Server online at http://localhost:8765

[ 1/10] Πώς εφαρμόζονται οι εκπτώσεις και ποια έχει προτεραιότητα;
      ✓ PASS [top-1] — αναμενόμενο: booking/discounts.adoc
      rank: #1, score: 0.872

...

══════════════════════════════════════════════
  Αποτελέσματα
══════════════════════════════════════════════
  Top-1: 7/10  (στόχος ≥6)
  Top-3: 9/10  (στόχος ≥8)

✓ PASS — Φάση 8 ολοκληρώθηκε επιτυχώς.
```

**Κριτήρια αποδοχής:**
- Top-3: ≥ 8/10 ✅
- Top-1: ≥ 6/10 ✅

Αν αποτύχει, δες το τμήμα [Αντιμετώπιση προβλημάτων](#αντιμετώπιση-προβλημάτων).

---

## Χειροκίνητες δοκιμές

### Α) Με MCP Inspector (προτεινόμενο για UI)

**1.** Εκκίνησε τον Inspector (με τον server ήδη σε λειτουργία):

```bash
npx @modelcontextprotocol/inspector
```

Ανοίγει αυτόματα το browser στο `http://localhost:6274`.

**2.** Σύνδεση στον server:

| Πεδίο | Τιμή |
|---|---|
| Transport | `Streamable HTTP` |
| URL | `http://localhost:8765/mcp` |
| Header name | `Authorization` |
| Header value | `Bearer mysecrettoken` |

Κλικ **Connect**. Στο αριστερό panel εμφανίζονται τα 3 tools.

**3.** Δοκιμή `search_nmecar_docs`:

- Κλικ στο tool `search_nmecar_docs`
- Συμπλήρωσε το πεδίο `query`:
  ```
  Πώς εφαρμόζονται οι εκπτώσεις και ποια έχει προτεραιότητα;
  ```
- Άφησε το `k` κενό (default = 5)
- Κλικ **Run Tool**

Αναμενόμενο αποτέλεσμα: το `results[0].page` να είναι `booking/discounts.adoc`.

**4.** Δοκιμή `list_doc_sections` (χωρίς arguments):

Κλικ **Run Tool** → βλέπεις κατάλογο όλων των σελίδων και ενοτήτων.

**5.** Δοκιμή `get_doc_page`:

```json
{ "path": "booking/discounts.adoc" }
```

Επιστρέφει το πλήρες κείμενο της σελίδας.

---

### Β) Με curl (terminal)

#### Health check
```bash
curl http://localhost:8765/health
```

#### Semantic search
```bash
curl -s -X POST http://localhost:8765/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mysecrettoken" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_nmecar_docs",
      "arguments": {
        "query": "Πώς αναθέτω ρόλο σε χρήστη;",
        "k": 3
      }
    }
  }' | python3 -m json.tool
```

#### Λίστα σελίδων
```bash
curl -s -X POST http://localhost:8765/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mysecrettoken" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "list_doc_sections",
      "arguments": {}
    }
  }' | python3 -m json.tool
```

#### Πλήρης σελίδα
```bash
curl -s -X POST http://localhost:8765/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mysecrettoken" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_doc_page",
      "arguments": { "path": "admin/roles.adoc" }
    }
  }' | python3 -m json.tool
```

#### Έλεγχος auth (αναμένεται 401)
```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8765/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
# → 401
```

---

## Τα 10 queries της Φάσης 8

Τρέξε κάθε ένα χειροκίνητα ή με το `npm run smoke`. Για κάθε query, έλεγξε ότι η **αναμενόμενη σελίδα** εμφανίζεται στα top-3 αποτελέσματα.

| # | Ερώτηση | Αναμενόμενη σελίδα |
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

---

## Αντιμετώπιση προβλημάτων

**`FAIL` σε ≥3 queries:**
1. Τρέξε `npm run ingest:dump` και κοίτα τα `.chunks.json` για τις αποτυχημένες σελίδες.
2. Αν τα chunks είναι πολύ μεγάλα (>600 tokens), μείωσε `MAX_TOKENS` στο `chunk.ts`.
3. Αν το context prefix δεν περιέχει αρκετά keywords, εμπλούτισε τα headings στο `.adoc`.

**`text-embedding-3-small` με χαμηλά scores (<0.5):**
- Άλλαξε `OPENAI_EMBED_MODEL=text-embedding-3-large` στο `.env` και ξανά-εκκίνησε (το cache ακυρώνεται αυτόματα).

**Server crash στο startup:**
- Έλεγξε ότι το `OPENAI_API_KEY` είναι έγκυρο.
- Έλεγξε ότι τα paths `DOCS_ROOT`/`PARTIALS_ROOT`/`EXAMPLES_ROOT` υπάρχουν.

**401 Unauthorized:**
- Βεβαιώσου ότι το `MCP_AUTH_TOKEN` στο `.env` και στο `-H "Authorization: Bearer ..."` είναι ίδια.
