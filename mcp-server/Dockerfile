# Build context: repo root  (docker build -f mcp-server/Dockerfile .)
# ---- builder ----
FROM node:22-slim AS builder
WORKDIR /app
COPY mcp-server/package*.json ./
RUN npm ci
COPY mcp-server/tsconfig.json ./
COPY mcp-server/src/ ./src/
RUN npm run build

# ---- runtime ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY mcp-server/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Baked content (read-only): .adoc pages + examples + partials
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

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
  CMD node -e "fetch('http://localhost:8765/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
