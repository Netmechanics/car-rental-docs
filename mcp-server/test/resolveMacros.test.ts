import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveMacros } from "../src/ingest/resolveMacros.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

let tmpDir: string;
let partialsDir: string;
let examplesDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-test-"));
  partialsDir = path.join(tmpDir, "partials");
  examplesDir = path.join(tmpDir, "examples");
  await fs.mkdir(partialsDir);
  await fs.mkdir(examplesDir);
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("resolveMacros", () => {
  it("removes Kroki plantuml blocks with .... delimiter", async () => {
    const src = `= Title\n\n[plantuml]\n....\nA -> B\n....\n\nSome text`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).not.toContain("plantuml");
    expect(result).not.toContain("A -> B");
    expect(result).toContain("Some text");
  });

  it("removes Kroki mermaid blocks with ---- delimiter", async () => {
    const src = `= Title\n\n[mermaid]\n----\ngraph TD\n----\n\nAfter`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).not.toContain("mermaid");
    expect(result).not.toContain("graph TD");
    expect(result).toContain("After");
  });

  it("inlines partial$ includes", async () => {
    await fs.writeFile(path.join(partialsDir, "caution.adoc"), "Προσοχή!", "utf-8");
    const src = `= Title\n\ninclude::partial$caution.adoc[]\n\nMore text`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).toContain("Προσοχή!");
    expect(result).not.toContain("include::partial$");
  });

  it("skips nav_*.adoc partials", async () => {
    await fs.writeFile(path.join(partialsDir, "nav_admin.adoc"), "* Admin nav", "utf-8");
    const src = `= Title\n\ninclude::partial$nav_admin.adoc[]\n\nContent`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).not.toContain("nav_admin");
    expect(result).not.toContain("Admin nav");
    expect(result).toContain("Content");
  });

  it("inlines example$ includes as code fence", async () => {
    await fs.writeFile(path.join(examplesDir, "Rental.java"), "public class Rental {}", "utf-8");
    const src = `= Title\n\ninclude::example$Rental.java[]\n\nAfter`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).toContain("public class Rental {}");
    expect(result).not.toContain("include::example$");
    expect(result).toContain("After");
  });

  it("replaces xref with link text", async () => {
    const src = `= Title\n\nΔείτε xref:booking/discounts.adoc[Εκπτώσεις] για λεπτομέρειες.`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).toContain("Εκπτώσεις");
    expect(result).not.toContain("xref:");
  });

  it("removes xref when link text is empty", async () => {
    const src = `= Title\n\nΔείτε xref:booking/discounts.adoc[] για λεπτομέρειες.`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).not.toContain("xref:");
    expect(result).not.toContain("booking/discounts");
  });

  it("replaces image:: with alt text", async () => {
    const src = `= Title\n\nimage::screenshot.png[Στιγμιότυπο οθόνης]`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).toContain("Στιγμιότυπο οθόνης");
    expect(result).not.toContain("image::");
  });

  it("drops image:: with empty alt", async () => {
    const src = `= Title\n\nimage::screenshot.png[]`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).not.toContain("image::");
    expect(result).not.toContain("screenshot.png");
  });

  it("handles recursive partial includes up to max depth", async () => {
    await fs.writeFile(path.join(partialsDir, "outer.adoc"), "include::partial$inner.adoc[]", "utf-8");
    await fs.writeFile(path.join(partialsDir, "inner.adoc"), "Εσωτερικό περιεχόμενο", "utf-8");
    const src = `= Title\n\ninclude::partial$outer.adoc[]`;
    const result = await resolveMacros(src, partialsDir, examplesDir);
    expect(result).toContain("Εσωτερικό περιεχόμενο");
  });
});
