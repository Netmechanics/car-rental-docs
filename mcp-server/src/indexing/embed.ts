import config from "../config.js";
import { logger } from "../logger.js";

export interface Embedder {
  readonly model: string;
  readonly dims: number;
  embed(texts: string[]): Promise<number[][]>;
}

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;

async function retry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number }).status ?? 0;
      if (status === 429 || status >= 500) {
        const delay = Math.pow(2, i) * 1000;
        logger.warn("Embedding API error, retrying", { attempt: i + 1, status, delay });
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

function createOpenAIEmbedder(): Embedder {
  const { OPENAI_API_KEY, OPENAI_EMBED_MODEL } = config;
  const model = OPENAI_EMBED_MODEL;

  return {
    model,
    dims: 1536,
    async embed(texts: string[]): Promise<number[][]> {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: OPENAI_API_KEY });
      const results: number[][] = [];

      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        logger.debug("Embedding batch", { from: i, count: batch.length });

        const response = await retry(
          () => client.embeddings.create({ model, input: batch }),
          MAX_RETRIES
        );
        results.push(...response.data.map((d) => d.embedding));
      }

      return results;
    },
  };
}

export function createEmbedder(): Embedder {
  if (config.EMBEDDING_PROVIDER === "openai") {
    return createOpenAIEmbedder();
  }
  throw new Error(`Embedding provider '${config.EMBEDDING_PROVIDER}' not yet implemented`);
}
