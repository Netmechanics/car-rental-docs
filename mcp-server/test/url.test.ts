import { describe, it, expect } from "vitest";
import { getDocUrl, toSectionAnchor } from "../src/tools/url.js";

describe("toSectionAnchor", () => {
  it("converts simple Greek heading to Asciidoctor anchor", () => {
    expect(toSectionAnchor("Επιχειρησιακός Σκοπός")).toBe("_επιχειρησιακός_σκοπός");
  });

  it("converts heading with numbers, parens and codes", () => {
    expect(toSectionAnchor("2. Μέτρηση Πινακίδων (FLEET - Προεπιλογή)")).toBe(
      "_2_μέτρηση_πινακίδων_fleet_προεπιλογή"
    );
  });

  it("strips formatting markup", () => {
    expect(toSectionAnchor("Κουμπί `[Stop Sale]`")).toBe("_κουμπί_stop_sale");
  });

  it("returns empty string for empty or whitespace heading", () => {
    expect(toSectionAnchor("")).toBe("");
    expect(toSectionAnchor("   ")).toBe("");
  });
});

describe("getDocUrl", () => {
  it("builds correct URL for standard page", () => {
    const url = getDocUrl("fleet/vehicle_groups.adoc");
    expect(url).toBe("http://carrental-docs.nmlabs.gr/nmecar/3.0/fleet/vehicle_groups/");
  });

  it("builds correct deep link URL when section heading is provided", () => {
    const url = getDocUrl("fleet/free-sale-plan.adoc", "Επιχειρησιακός Σκοπός");
    expect(url).toBe(
      "http://carrental-docs.nmlabs.gr/nmecar/3.0/fleet/free-sale-plan/#_επιχειρησιακός_σκοπός"
    );
  });

  it("builds correct deep link URL for section with numbers and code tags", () => {
    const url = getDocUrl("fleet/vehicle_groups.adoc", "2. Μέτρηση Πινακίδων (`FLEET` - Προεπιλογή)");
    expect(url).toBe(
      "http://carrental-docs.nmlabs.gr/nmecar/3.0/fleet/vehicle_groups/#_2_μέτρηση_πινακίδων_fleet_προεπιλογή"
    );
  });

  it("builds correct URL for root index.adoc", () => {
    const url = getDocUrl("index.adoc");
    expect(url).toBe("http://carrental-docs.nmlabs.gr/nmecar/3.0/");
  });

  it("builds correct URL for section index.adoc", () => {
    const url = getDocUrl("fleet/index.adoc");
    expect(url).toBe("http://carrental-docs.nmlabs.gr/nmecar/3.0/fleet/");
  });

  it("builds correct URL for nested pages", () => {
    const url = getDocUrl("release-notes/3.0.adoc");
    expect(url).toBe("http://carrental-docs.nmlabs.gr/nmecar/3.0/release-notes/3.0/");
  });

  it("handles path with or without .adoc extension", () => {
    const url = getDocUrl("booking/discounts");
    expect(url).toBe("http://carrental-docs.nmlabs.gr/nmecar/3.0/booking/discounts/");
  });
});
