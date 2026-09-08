---
type: docs-content-map
title: nmecar Documentation Corpus
description: Maps the nmecar AsciiDoc corpus by section — Fleet, Booking, Admin, Reporting, Technical, Release Notes — and locates supporting reference material in specs/ and examples/ so contributors can find the right page to edit or search.
tags: [docs-corpus, antora, asciidoc, content-map, specs, nmecar]
verified:
  - by: openwiki/0.4.3
    at: 2026-09-04T12:40:12.458Z
sources:
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-c6004ea2ff6e6cc978fdccb5
    resource: repo://docs/antora.yml
  - id: openwiki-source-bc217da4d18cc8968149d0a7
    resource: repo://docs/modules/ROOT/examples/Rental.java
  - id: openwiki-source-3035cf1c1d7e348aa3d47ef7
    resource: repo://docs/modules/ROOT/pages/admin/index.adoc
  - id: openwiki-source-e90a9ad32a4b5b4a7a14d41e
    resource: repo://docs/modules/ROOT/pages/booking/index.adoc
  - id: openwiki-source-02c88b7205da8ba5df08f8d7
    resource: repo://docs/modules/ROOT/pages/fleet/index.adoc
  - id: openwiki-source-d35fd6afa68479acc7fd7174
    resource: repo://docs/modules/ROOT/pages/index.adoc
  - id: openwiki-source-cc562436bbcf5e38f19c5c50
    resource: repo://docs/modules/ROOT/pages/release-notes/index.adoc
  - id: openwiki-source-702467fc744f4ef581f5f45e
    resource: repo://docs/modules/ROOT/pages/reporting/index.adoc
  - id: openwiki-source-27362e127b3c12e2bbf5fbff
    resource: repo://docs/modules/ROOT/pages/technical/index.adoc
  - id: openwiki-source-2c644a8e7e9204ca0261267a
    resource: repo://docs/modules/ROOT/pages/technical/rental-search-logic.adoc
  - id: openwiki-source-ed22c5a08bb5bc8d571db799
    resource: repo://docs/modules/ROOT/pages/technical/rest-api.adoc
  - id: openwiki-source-f08cd2e6c47f0701e23dbd50
    resource: repo://SPECS.md
  - id: openwiki-source-cbd5ab8770e20edb164e00f1
    resource: repo://specs/locales.adoc
  - id: openwiki-source-9e3fe3e8b3b90e64d2fe2ab2
    resource: repo://specs/notes.adoc
  - id: openwiki-source-ecf1674434f35247c47cd9a2
    resource: repo://specs/payments.adoc
  - id: openwiki-source-e3fdba9173cff36fc0d27a03
    resource: repo://specs/specs.adoc
generated: { by: "openwiki/0.4.3", at: "2026-09-04T12:40:12.458Z" }
---

# nmecar Documentation Corpus

This repository is the documentation site for **nmecar**, a car-rental platform. The authoritative, human-readable content is an AsciiDoc corpus published by Antora (see [Antora Site Structure & Conventions](../concepts/antora-site.md)). This page is the *content map*: it names every major section, states what each section covers, and points to the supporting reference material (`specs/`, `examples/*.java`) that sits alongside the published pages. Use it to locate the right page before editing, or to confirm where a new topic belongs.

> **Source of truth for content.** The implementation source of truth is the sibling car-rental application repository, not this docs repo. This repo documents that application; when behavior is ambiguous, consult the app and the `specs/` reference notes (see [Sibling Application & Specs Integration](../integrations/sibling-app.md)).

## The authoritative inventory: SPECS.md

`SPECS.md` (repository root) is the curated inventory of the corpus: it lists the Antora structure, the navigation tree, a per-section content summary, the reusable partials, the documentation examples, and the build notes. Per `AGENTS.md`, contributors must consult `SPECS.md` before starting work and **update it whenever content structure changes** — adding, moving, renaming, or deleting pages, navigation partials, examples, images, or other structure-affecting assets. It is the single file that keeps the content map synchronized with the actual page tree.

> **Note on versions.** `SPECS.md` records the documented line as `1.1` and describes the `1.1` reporting scope, but the live component descriptor `docs/antora.yml` now declares version `2.0` and the home/release-notes pages describe a `2.0` feature release (AI assistant, chat widget, offline inventory, audit logging, rental reactivation, extras max quantity). When the corpus moved to `2.0`, `SPECS.md`'s version narrative lagged; treat `docs/antora.yml` as the authoritative version marker and update `SPECS.md` to match the current structure.

## Corpus layout

All published pages live under `docs/modules/ROOT/pages/`, organized into six section subdirectories that mirror the navigation tree:

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
flowchart LR
  root["docs/modules/ROOT/pages"]
  root --> fleet["Fleet<br/>vehicle_groups, vehicles"]
  root --> booking["Booking<br/>locations, routes, seasons,<br/>coupons, insurances, discounts,<br/>extras, rentals, search logic, offline-inventory"]
  root --> admin["Admin<br/>models/types/features, tags, roles,<br/>payments, driver-age, rounding,<br/>settings (system/email/ai),<br/>cms-seo, ai-assistant, chat-widget, audit-logs"]
  root --> reporting["Reporting<br/>lite-dashboard, dashboards, reports"]
  root --> technical["Technical<br/>rental-process, search logic,<br/>REST API, email reports, jobs,<br/>dashboard, logging, config"]
  root --> release["Release Notes<br/>2.0, 1.1"]
```

Supporting reference material lives outside the published page tree:

- `specs/` — requirements, payment/provider notes, locale lists, PDF drafts, and textual diagrams (see [Reference material in specs/](#reference-material-in-specs)).
- `docs/modules/ROOT/examples/*.java` — Java DTO/entity snippets `include`d into technical pages (see [Code examples](#code-examples)).
- `docs/modules/ROOT/images/` — screenshots and static diagrams referenced from pages.

## Section taxonomy

Each section has a landing `index.adoc` that introduces the section and includes its navigation partial. The summaries below reflect the live page tree (which now exceeds the `SPECS.md` inventory for the `2.0` line).

### Fleet — `fleet/`

The fleet is organized into **vehicle groups** (e.g. "Small", "SUV", "Minivan"); each group owns its seasonal pricing logic, available extras, insurances, and discounts. Customers search and select by group, while the final assignment happens at the **license-plate** level.

- `fleet/vehicle_groups.adoc` — group creation, per-season pricing, non-availability periods, tags, images, per-group pricing tools.
- `fleet/vehicles.adoc` — vehicle registration by model, plate management, status, location, filters, tags, images.

### Booking — `booking/`

Booking holds every parameter that shapes the rental flow, from locations and routes to pricing rules, discounts, and availability. Correct configuration here is a prerequisite for the front-end search and reservation flow.

- `booking/locations.adoc` — pickup/dropoff locations, costs, grouping, Google place link, defaults, activation.
- `booking/routes.adoc` — location pairs with one-way route pricing and charge-policy integration.
- `booking/rental-search-logic.adoc` — **business-facing** summary of search: duration rules, extra-hours rules, pricing bands, mixed availability, and on-request outcomes.
- `booking/seasons.adoc` — calendar coverage requirement and minimum-duration rules.
- `booking/coupons.adoc` — discount codes, validity windows, regex validation.
- `booking/insurances.adoc` — per-day or per-period cost models with calculation examples.
- `booking/discounts.adoc` — discount types A/B, precedence rules, examples.
- `booking/extras.adoc` — per-day or per-booking extras with calculation examples, per-group availability rules, and (2.0) max-quantity limits.
- `booking/rentals.adoc` — read-only rental fields, statuses, customer info, cost breakdown, driver-age charge/payment details, internal notes, and (2.0) rental reactivation of cancelled bookings.
- `booking/offline-inventory.adoc` — (2.0) unified online/offline reservation inventory, availability blocks, locking, rollout, and deferred scope.

### Admin — `admin/`

Admin contains the system-wide configuration: reference data (models, types, features), access and payment rules, pricing algorithms, and integrations (email, Google, CMS, AI). The section landing page warns that changes here affect the whole application.

- `admin/vehicle_models.adoc`, `admin/vehicle_types.adoc`, `admin/vehicle_features.adoc` — fleet reference data (makes/models, category taxonomy, equipment/feature taxonomy).
- `admin/tags.adoc` — labels surfacing groups/vehicles; regex validation.
- `admin/roles.adoc` — system roles (`system-full-access`, `basic-access-role`) and CRUD scope for business users.
- `admin/payments.adoc` — offline/online methods, provider mapping, fees, bank-deposit confirmation flow.
- `admin/driver-age-charges.adoc` — age-zone setup, validation rules, FLAT/PERCENTAGE calculation, rental snapshot behavior.
- `admin/price-rounding.adoc` — configurable rounding scale (0.1/0.5/1.0) and decimal places; which cost components are affected, with step-by-step setup.
- `admin/settings-system.adoc` — locales, rental-code regex, dashboard embedding, on-request search toggle, Google API, extra/night hours, scheduled-job settings, bank-deposit reserve period, follow-up email settings, pricing rules, limits.
- `admin/settings-email.adoc` — per-category sender/recipient/subject/copy rules (rental/contact/quote/reminder/thank-you).
- `admin/cms-seo-fields.adoc` — multilingual SEO metadata for posts/pages and its use in the public API.
- `admin/ai-assistant.adoc` — (2.0) backoffice AI chat assistant with deterministic analytics templates.
- `admin/chat-widget.adoc` — (2.0) floating AI support chat widget for end users.
- `admin/settings-ai.adoc` — (2.0) AI integration configuration.
- `admin/audit-logs.adoc` — (2.0) full audit trail for rental status changes.

### Reporting — `reporting/`

Reporting documents the administrative-information layer. The `1.1` line organized this section around a first deliverable, the `LITE` dashboard, while explicitly deferring a fuller dashboard/report suite.

- `reporting/index.adoc` — overview of the current `LITE` scope, KPI logic, the Superset relationship, and future reporting direction.
- `reporting/lite-dashboard.adoc` — implementation-oriented description of the `Σύνοψη Επιχείρησης LITE` dashboard (scope, datasets, charts, filters, layout, screenshot placeholders).
- `reporting/dashboards.adoc` — clarifies that only the `LITE` dashboard is currently exposed; fuller suites remain future scope.
- `reporting/reports.adoc` — planned reporting categories documented as roadmap/future scope, not as exposed production functionality.

### Technical — `technical/`

Technical notes describe the rental process, the search algorithm, the REST API, email reports, scheduled jobs, the dashboard integration, logging, and installation configuration. These pages are the implementation-facing counterpart to the business-facing booking pages; they `include::example$` Java snippets from `examples/`.

- `technical/rental-process.adoc` — rental flow diagram with steps and decision points.
- `technical/rental-search-logic.adoc` — the **detailed** `/api/v1/booking/search` logic: `SearchService.search()` → `VehiclesSearchService.findVehicles()` → `VehiclesCostCalculatorService.calculateCosts()` / `GroupSeasonPricing.getDayPrice()`, duration rules, pricing bands, the availability contract, select/reserve guards, filters, and PlantUML workflows. This is the reference page for future search changes.
- `technical/rest-api.adoc` and `technical/rest-api-endpoints.adoc` — REST API (current version 2.0), OAuth2 Client Credentials auth, Swagger at `/api/docs`, the 2.0 changes (availabilityStatus/bookable fields, extras maxQuantity, chat-widget endpoints), and per-endpoint documentation.
- `technical/reports_email.adoc` — Jmix Reports + FreeMarker templates for contact, quote, rental confirmation, reminder, and thank-you emails; DTO examples.
- `technical/scheduled-jobs.adoc` — abandoned rentals, finish rentals, rental follow-up emails, email send/cleanup, Google Place cache cleanup.
- `technical/config_installation.adoc` — DB, REST API, email, logging, and placeholder TODO sections.
- `technical/dashboard.adoc` — Superset integration, relation to the reporting section, prerequisites, PlantUML integration flow, screenshot placeholders.
- `technical/logging.adoc` — Grafana Loki settings.
- `technical/pricing_analysis.adoc` — stub page.

### Release Notes — `release-notes/`

Release notes are versioned pages, one per feature release, surfaced through `nav_release_notes.adoc`. The landing page also notes it is the base for future Antora multi-version browsing once matching refs/tags are connected for previous documentation lines.

- `release-notes/2.0.adoc` — the 2.0 feature release (mixed availability/on-request, AI features, audit logging, offline inventory).
- `release-notes/1.1.adoc` — the 1.1 baseline.

## Reference material in specs/

`specs/` holds requirements and notes that enrich — but are not part of — the published Antora pages. Per `AGENTS.md`, supporting reference materials for domain knowledge live here.

- `specs/specs.adoc` — the full technical specification (Greek, version 1.0, dated 2024-10-10). Defines the vocabulary (Site vs Admin), general capabilities (minimum reservation duration, soonest reservation time, night-hours cost, time-picker intervals, extra-hours charging), and the detailed functional requirements. It is the broadest requirements source.
- `specs/notes.adoc` — pricing and payment-method notes: the price composition (`Rental Basic Price` = vehicle total + pickup/dropoff + night-hours + insurance + extras; coupon discount; payment cost as fixed or percentage; `Rental Total Price`), and the supported payment methods (PayPal, credit/debit card online, pay-on-arrival offline, bank deposit offline) with deposit/partial-payment rules.
- `specs/payments.adoc` — payment-provider integration notes (Cardlink covering Alpha Bank and Eurobank, Piraeus Bank epay, NBG, PayPal) with test endpoints, merchant IDs, and test credentials. **These are test/sandbox credentials committed for documentation; do not treat them as production secrets.**
- `specs/locales.adoc` — the list of supported UI locales (Albanian, Bulgarian, Croatian, Czech, Danish, Dutch, English, Estonian, French, German, Greek, Hungarian, Italian, Japanese, Maltese, Polish, Portuguese, Romanian, Russian, Serbian, Spanish). Used to coordinate multilingual feature documentation.
- `specs/diagrams/` — textual diagram sources: `rental_activity_diagram.adoc` and `uml_class_diagram.adoc`, rendered via Kroki (see [Kroki & Diagrams](../integrations/kroki-and-diagrams.md)).
- `specs/cr_specs_draft_1..5.pdf`, `specs/cr_specs-1.0.pdf`, `specs/notes_1.pdf`, `specs/payments.pdf` — historical PDF drafts of the specs and notes, kept for reference.
- `specs/brand-guide/`, `specs/images/logo.svg` — branding reference material.

## Code examples

`docs/modules/ROOT/examples/` holds Java DTO/entity snippets that technical pages include via `include::example$...[]` so the docs stay in sync with real class shapes:

- `Rental.java` — the booking rental entity (code, payment transaction id, customer, status, pickup/dropoff, vehicle/insurance/extras cost fields).
- `Customer.java`, `PickDropDetail.java`, `RentalExtra.java` — related entities.
- `ContactFormDto.java`, `QuoteFormDto.java` — form DTOs used in the email-reports documentation.

These examples carry the `gr.netmechanics.carrental` package path, reflecting the sibling application's package structure. When documenting DTOs or entities, prefer including these snippets over hand-writing code.

## How to use this map

1. **Before editing**, confirm the target section and page from the taxonomy above; check `SPECS.md` for the inventory and `docs/antora.yml` for the current version.
2. **For behavior questions**, cross-reference the business page (e.g. `booking/rental-search-logic.adoc`) with the technical page (`technical/rental-search-logic.adoc`) and the `specs/` notes; defer to the sibling application repo for implementation truth.
3. **When structure changes**, update the page, its `nav_<section>.adoc` partial, `nav_main.adoc` if a section is added/removed, and `SPECS.md` — and, for versioned changes, add/update the matching release-notes page.
