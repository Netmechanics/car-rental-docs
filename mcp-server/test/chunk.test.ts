import { describe, it, expect } from "vitest";
import { chunkPage } from "../src/ingest/chunk.js";
import type { RenderedPage } from "../src/ingest/render.js";

function makePage(title: string, text: string): RenderedPage {
  return { relPath: "test/page.adoc", title, text };
}

describe("chunkPage", () => {
  it("produces at least one chunk for any non-empty page", () => {
    const page = makePage("Εκπτώσεις", "Κείμενο σελίδας με πληροφορίες.");
    const chunks = chunkPage(page);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("each chunk has a unique id", () => {
    const text = "Παράγραφος 1.\n\nΠαράγραφος 2.\n\nΠαράγραφος 3.\n\nΠαράγραφος 4.";
    const page = makePage("Test", text);
    const chunks = chunkPage(page);
    const ids = chunks.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("context prefix contains page title", () => {
    const page = makePage("Ρόλοι Χρηστών", "Περιεχόμενο.");
    const chunks = chunkPage(page);
    expect(chunks[0].text).toContain("Ρόλοι Χρηστών");
  });

  it("no chunk exceeds ~1000 tokens (4000 chars)", () => {
    // Generate a long text
    const longPara = "Αυτή είναι μια μακριά παράγραφος. ".repeat(50);
    const text = Array.from({ length: 10 }, (_, i) => `Ενότητα ${i + 1}\n\n${longPara}`).join("\n\n\n");
    const page = makePage("Μεγάλη Σελίδα", text);
    const chunks = chunkPage(page);
    for (const c of chunks) {
      // 1000 tokens * 4 chars/token = 4000 chars (with some buffer)
      expect(c.tokensApprox).toBeLessThanOrEqual(1100);
    }
  });

  it("tokensApprox is consistent with text length", () => {
    const page = makePage("Τιμολόγηση", "Κείμενο με αρκετούς χαρακτήρες για να ελεγχθεί.");
    const chunks = chunkPage(page);
    for (const c of chunks) {
      expect(c.tokensApprox).toBeGreaterThan(0);
      expect(c.tokensApprox).toBe(Math.ceil(c.text.length / 4));
    }
  });

  it("chunk relPath matches input page relPath", () => {
    const page = makePage("Test", "Περιεχόμενο.");
    const chunks = chunkPage(page);
    for (const c of chunks) {
      expect(c.relPath).toBe("test/page.adoc");
    }
  });
});
