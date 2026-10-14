import config from "../config.js";

/**
 * Generates an Asciidoctor-compliant section anchor from a section heading.
 *
 * Asciidoctor default rules:
 * - strip inline markup (backticks, asterisks, brackets, formatting)
 * - lowercase
 * - replace non-alphanumeric chars (including spaces and punctuation) with underscores
 * - collapse consecutive underscores
 * - prefix with "_"
 *
 * Examples:
 * "2. Μέτρηση Πινακίδων (FLEET - Προεπιλογή)" -> "_2_μέτρηση_πινακίδων_fleet_προεπιλογή"
 * "Επιχειρησιακός Σκοπός"                    -> "_επιχειρησιακός_σκοπός"
 */
export function toSectionAnchor(heading?: string): string {
  if (!heading || !heading.trim()) return "";

  const clean = heading.replace(/[`*_~^]/g, "").trim().toLowerCase();
  const slug = clean
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");

  return slug ? `_${slug}` : "";
}

/**
 * Constructs the canonical Antora site URL for a given .adoc relative path and optional section.
 *
 * Antora URL rules (with html_extension_style: indexify):
 * - "fleet/vehicle_groups.adoc" -> "http://carrental-docs.nmlabs.gr/nmecar/3.0/fleet/vehicle_groups/"
 * - with section "Availability Modes" -> ".../fleet/vehicle_groups/#_availability_modes"
 * - "fleet/index.adoc"          -> "http://carrental-docs.nmlabs.gr/nmecar/3.0/fleet/"
 * - "index.adoc"                -> "http://carrental-docs.nmlabs.gr/nmecar/3.0/"
 */
export function getDocUrl(relPath: string, section?: string): string {
  const base = config.DOCS_BASE_URL.replace(/\/+$/, "");
  const normalized = relPath.replace(/\\/g, "/").replace(/\.adoc$/, "");

  let urlPath: string;
  if (normalized === "index") {
    urlPath = `/${config.DOCS_COMPONENT}/${config.DOCS_VERSION}/`;
  } else if (normalized.endsWith("/index")) {
    urlPath = `/${config.DOCS_COMPONENT}/${config.DOCS_VERSION}/${normalized.slice(0, -6)}/`;
  } else {
    urlPath = `/${config.DOCS_COMPONENT}/${config.DOCS_VERSION}/${normalized}/`;
  }

  const anchor = toSectionAnchor(section);
  return anchor ? `${base}${urlPath}#${anchor}` : `${base}${urlPath}`;
}
