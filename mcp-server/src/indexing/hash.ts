import crypto from "crypto";
import type { Chunk } from "../ingest/chunk.js";

export const PIPELINE_VERSION = "1";

export function contentHash(chunks: Chunk[], model: string): string {
  const sorted = [...chunks].sort((a, b) => a.id.localeCompare(b.id));
  const payload = sorted.map((c) => c.text).join("\x00") + "\x00" + PIPELINE_VERSION + "\x00" + model;
  return crypto.createHash("sha256").update(payload, "utf-8").digest("hex");
}
