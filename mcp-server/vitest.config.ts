import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DOCS_ROOT: "/tmp/docs",
      PARTIALS_ROOT: "/tmp/partials",
      EXAMPLES_ROOT: "/tmp/examples",
      DATA_DIR: "/tmp/data",
      EMBEDDING_PROVIDER: "openrouter",
      OPENROUTER_API_KEY: "sk-or-test",
      OPENAI_API_KEY: "sk-test",
      MCP_AUTH_TOKEN: "test",
    },
  },
});
