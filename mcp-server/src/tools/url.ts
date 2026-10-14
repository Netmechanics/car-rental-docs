import config from "../config.js";

/**
 * Constructs the canonical Antora site URL for a given .adoc relative path.
 *
 * Antora URL rules (with html_extension_style: indexify):
 * - "fleet/vehicle_groups.adoc" -> "http://carrental-docs.nmlabs.gr/nmecar/3.0/fleet/vehicle_groups/"
 * - "fleet/index.adoc"          -> "http://carrental-docs.nmlabs.gr/nmecar/3.0/fleet/"
 * - "index.adoc"                -> "http://carrental-docs.nmlabs.gr/nmecar/3.0/"
 */
export function getDocUrl(relPath: string): string {
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

  return `${base}${urlPath}`;
}
