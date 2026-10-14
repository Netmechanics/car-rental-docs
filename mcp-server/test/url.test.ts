import { describe, it, expect } from "vitest";
import { getDocUrl } from "../src/tools/url.js";

describe("getDocUrl", () => {
  it("builds correct URL for standard page", () => {
    const url = getDocUrl("fleet/vehicle_groups.adoc");
    expect(url).toBe("http://carrental-docs.nmlabs.gr/nmecar/3.0/fleet/vehicle_groups/");
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
