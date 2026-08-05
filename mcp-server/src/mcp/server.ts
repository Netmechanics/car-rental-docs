import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { VectorStore } from "../indexing/store.js";
import type { Embedder } from "../indexing/embed.js";
import { searchDocs } from "../tools/searchDocs.js";
import { getPage } from "../tools/getPage.js";
import { listSections } from "../tools/listSections.js";

export function buildMcpServer(store: VectorStore, embedder: Embedder): McpServer {
  const server = new McpServer({ name: "nmecar-docs", version: "0.1.0" });

  server.registerTool(
    "search_nmecar_docs",
    {
      title: "Search nmecar documentation",
      description:
        "Semantic search στην τεκμηρίωση του nmecar. Επέστρεψε τα πιο σχετικά αποσπάσματα για την ερώτηση.",
      inputSchema: {
        query: z.string().min(1).describe("Η ερώτηση ή το θέμα προς αναζήτηση"),
        k: z.number().int().min(1).max(20).optional().describe("Αριθμός αποτελεσμάτων (default 5)"),
      },
    },
    async ({ query, k = 5 }) => {
      const result = await searchDocs(store, embedder, query, k);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.registerTool(
    "get_doc_page",
    {
      title: "Get documentation page",
      description: "Επέστρεψε το πλήρες κείμενο μιας σελίδας τεκμηρίωσης.",
      inputSchema: {
        path: z
          .string()
          .min(1)
          .describe("Σχετικό path της σελίδας, π.χ. 'booking/discounts.adoc'"),
      },
    },
    async ({ path }) => {
      try {
        const result = getPage(store, path);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text", text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "list_doc_sections",
    {
      title: "List documentation sections",
      description: "Επέστρεψε κατάλογο όλων των σελίδων και ενοτήτων της τεκμηρίωσης.",
      inputSchema: {},
    },
    async () => {
      const result = listSections(store);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  return server;
}
