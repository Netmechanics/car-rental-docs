/**
 * Φάση 8 — Smoke Tests (semantic retrieval quality)
 *
 * Εκτέλεση:
 *   npm run smoke
 *
 * Απαιτεί τον server να τρέχει ήδη στο PORT (default 8765).
 * Διαβάζει PORT και MCP_AUTH_TOKEN από process.env.
 */

const PORT = process.env.PORT ?? "8765";
const TOKEN = process.env.MCP_AUTH_TOKEN ?? "";
const BASE_URL = `http://localhost:${PORT}`;

interface SearchResult {
  page: string;
  title: string;
  section: string;
  score: number;
  text: string;
}

interface McpResponse {
  result?: {
    content: Array<{ type: string; text: string }>;
  };
  error?: { message: string };
}

async function search(query: string, k = 5): Promise<SearchResult[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;

  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "search_nmecar_docs", arguments: { query, k } },
  });

  const res = await fetch(`${BASE_URL}/mcp`, { method: "POST", headers, body });

  if (!res.ok && res.status !== 200) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  // Streamable HTTP returns text/event-stream (SSE)
  const text = await res.text();
  let json: McpResponse;
  // SSE format: "event: message\ndata: {...}\n\n"
  const dataLine = text.split("\n").find((l) => l.startsWith("data:"));
  if (dataLine) {
    json = JSON.parse(dataLine.slice(5).trim());
  } else {
    json = JSON.parse(text);
  }

  if (json.error) throw new Error(json.error.message);
  const payload = JSON.parse(json.result!.content[0].text);
  return payload.results as SearchResult[];
}

// ─── Test cases (Φάση 8 του MCP_SERVER_PLAN.md) ───────────────────────────

const TESTS = [
  {
    id: 1,
    query: "Πώς εφαρμόζονται οι εκπτώσεις και ποια έχει προτεραιότητα;",
    expected: "booking/discounts.adoc",
  },
  {
    id: 2,
    query: "Πάνω σε ποιο ποσό υπολογίζεται το κουπόνι;",
    expected: "booking/coupons.adoc",
  },
  {
    id: 3,
    query: "Τι γίνεται όταν δύο σεζόν επικαλύπτονται;",
    expected: "booking/seasons.adoc",
  },
  {
    id: 4,
    query: "Πώς τιμολογούνται οι μέρες πέρα από το τελευταίο threshold;",
    expected: "fleet/vehicle_groups.adoc",
  },
  {
    id: 5,
    query: "Πώς αναθέτω ρόλο σε χρήστη;",
    expected: "admin/roles.adoc",
  },
  {
    id: 6,
    query: "Πώς δουλεύει η πληρωμή με κατάθεση τραπέζης;",
    expected: "admin/payments.adoc",
  },
  {
    id: 7,
    query: "Ποια scheduled jobs τρέχουν και πότε;",
    expected: "technical/scheduled-jobs.adoc",
  },
  {
    id: 8,
    query: "Χρέωση ανάλογα με την ηλικία οδηγού.",
    expected: "admin/driver-age-charges.adoc",
  },
  {
    id: 9,
    query: "Πώς φιλτράρω logs ανά εφαρμογή στο Grafana;",
    expected: "technical/logging.adoc",
  },
  {
    id: 10,
    query: "Ποια πεδία μιας ενοικίασης είναι επεξεργάσιμα;",
    expected: "booking/rentals.adoc",
  },
];

// ─── Runner ────────────────────────────────────────────────────────────────

const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";
const DIM  = "\x1b[2m";
const RST  = "\x1b[0m";

console.log("\n══════════════════════════════════════════════");
console.log("  nmecar MCP Server — Φάση 8 Smoke Tests");
console.log("══════════════════════════════════════════════\n");

// Check server health first
try {
  const health = await fetch(`${BASE_URL}/health`);
  if (!health.ok) throw new Error(`HTTP ${health.status}`);
  console.log(`${PASS} Server online at ${BASE_URL}\n`);
} catch {
  console.error(`${FAIL} Server δεν ανταποκρίνεται στο ${BASE_URL}/health`);
  console.error("   Σήκωσε τον server πρώτα: npm run dev\n");
  process.exit(1);
}

let top1Pass = 0;
let top3Pass = 0;
let errors = 0;

for (const tc of TESTS) {
  process.stdout.write(`[${tc.id.toString().padStart(2, " ")}/10] ${tc.query}\n`);
  try {
    const results = await search(tc.query, 5);
    const pages = results.map((r) => r.page);
    const inTop1 = pages[0] === tc.expected;
    const inTop3 = pages.slice(0, 3).includes(tc.expected);

    if (inTop1) top1Pass++;
    if (inTop3) top3Pass++;

    const icon = inTop3 ? PASS : FAIL;
    const top1Label = inTop1 ? " [top-1]" : "";
    console.log(`      ${icon} ${inTop3 ? "PASS" : "FAIL"}${top1Label} — αναμενόμενο: ${tc.expected}`);

    if (!inTop3) {
      console.log(`      ${DIM}top-3 που επέστρεψε:${RST}`);
      pages.slice(0, 3).forEach((p, i) => {
        const score = results[i]?.score?.toFixed(3) ?? "?";
        console.log(`        ${DIM}${i + 1}. ${p} (score: ${score})${RST}`);
      });
    } else {
      const rank = pages.indexOf(tc.expected) + 1;
      const score = results[rank - 1]?.score?.toFixed(3) ?? "?";
      console.log(`      ${DIM}rank: #${rank}, score: ${score}${RST}`);
    }
  } catch (err) {
    errors++;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`      ${FAIL} ERROR — ${msg}`);
  }
  console.log();
}

// ─── Summary ───────────────────────────────────────────────────────────────

const total = TESTS.length;
console.log("══════════════════════════════════════════════");
console.log("  Αποτελέσματα");
console.log("══════════════════════════════════════════════");
console.log(`  Top-1: ${top1Pass}/${total}  (στόχος ≥6)`);
console.log(`  Top-3: ${top3Pass}/${total}  (στόχος ≥8)`);
if (errors > 0) console.log(`  Σφάλματα: ${errors}`);
console.log();

const top1Ok = top1Pass >= 6;
const top3Ok = top3Pass >= 8;

if (top1Ok && top3Ok) {
  console.log(`${PASS} PASS — Φάση 8 ολοκληρώθηκε επιτυχώς.\n`);
  process.exit(0);
} else {
  console.log(`${FAIL} FAIL — Δεν πληρούνται τα κριτήρια αποδοχής.`);
  if (!top3Ok) console.log(`   → Δοκίμασε να μειώσεις το chunk size ή να αυξήσεις το context prefix.`);
  if (!top1Ok) console.log(`   → Δοκίμασε text-embedding-3-large για καλύτερη ποιότητα.`);
  console.log();
  process.exit(1);
}
