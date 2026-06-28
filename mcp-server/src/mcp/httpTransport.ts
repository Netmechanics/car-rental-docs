import express, { type Request, type Response, type NextFunction } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import config from "../config.js";
import { logger } from "../logger.js";

const allowedOrigins = config.ALLOWED_ORIGINS === "*"
  ? null
  : config.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin ?? "";
  if (allowedOrigins === null || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!config.MCP_AUTH_TOKEN) {
    next();
    return;
  }
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (token !== config.MCP_AUTH_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// Factory type: creates a fresh McpServer per request (required for stateless mode)
type McpServerFactory = () => McpServer;

export function createHttpApp(serverFactory: McpServerFactory): express.Application {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.all("/mcp", authMiddleware, async (req: Request, res: Response) => {
    // New server+transport per request — required for stateless Streamable HTTP
    const mcpServer = serverFactory();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    try {
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err: unknown) {
      logger.error("MCP request error", { error: String(err) });
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  return app;
}
