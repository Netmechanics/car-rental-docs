import fs from "fs/promises";
import path from "path";

export interface AdocFile {
  path: string;     // absolute
  relPath: string;  // relative to DOCS_ROOT, e.g. "booking/discounts.adoc"
  raw: string;
}

async function walk(dir: string, base: string): Promise<AdocFile[]> {
  const results: AdocFile[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(full, base)));
    } else if (entry.isFile() && entry.name.endsWith(".adoc")) {
      const raw = await fs.readFile(full, "utf-8");
      const relPath = path.relative(base, full);
      // skip stub files: < 50 non-whitespace chars after the first heading line
      const bodyAfterTitle = raw.replace(/^=\s+.+\n/m, "").replace(/\s/g, "");
      if (bodyAfterTitle.length < 50) continue;
      results.push({ path: full, relPath, raw });
    }
  }
  return results;
}

export async function loadAdoc(docsRoot: string): Promise<AdocFile[]> {
  return walk(path.resolve(docsRoot), path.resolve(docsRoot));
}
