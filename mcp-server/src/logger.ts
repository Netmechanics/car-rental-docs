import config from "./config.js";

type Level = "debug" | "info" | "warn" | "error";

const levels: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function log(level: Level, message: string, data?: Record<string, unknown>) {
  if (levels[level] < levels[config.LOG_LEVEL]) return;
  const entry: Record<string, unknown> = { ts: new Date().toISOString(), level, message };
  if (data) Object.assign(entry, data);
  const out = JSON.stringify(entry);
  if (level === "error" || level === "warn") {
    process.stderr.write(out + "\n");
  } else {
    process.stdout.write(out + "\n");
  }
}

export const logger = {
  debug: (msg: string, data?: Record<string, unknown>) => log("debug", msg, data),
  info: (msg: string, data?: Record<string, unknown>) => log("info", msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => log("warn", msg, data),
  error: (msg: string, data?: Record<string, unknown>) => log("error", msg, data),
};
