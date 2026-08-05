import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8765),
  DOCS_ROOT: z.string().min(1),
  PARTIALS_ROOT: z.string().min(1),
  EXAMPLES_ROOT: z.string().min(1),
  DATA_DIR: z.string().min(1).default("/data"),
  EMBEDDING_PROVIDER: z.enum(["openai", "gemini"]).default("openai"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_EMBED_MODEL: z.string().default("text-embedding-3-small"),
  GEMINI_API_KEY: z.string().optional(),
  MCP_AUTH_TOKEN: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default("*"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const config = parsed.data;

if (config.EMBEDDING_PROVIDER === "openai" && !config.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai");
  process.exit(1);
}
if (config.EMBEDDING_PROVIDER === "gemini" && !config.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is required when EMBEDDING_PROVIDER=gemini");
  process.exit(1);
}

export default config;
