---
type: sibling-repo-integration
title: Sibling Application & Specs Integration
description: Explains how the nmecar docs repo relates to the external nmecar car-rental app repo (implementation source of truth) and the in-repo specs/ reference materials — the two complementary sources authors consult to keep documentation accurate.
tags: [sibling-repo, specs, car-rental, implementation-truth, release-discovery, nmecar]
verified:
  - by: openwiki/0.4.3
    at: 2026-09-04T12:40:12.458Z
sources:
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-4f023c807033aa9f84babd76
    resource: repo://antora-playbook.yml
  - id: openwiki-source-f08cd2e6c47f0701e23dbd50
    resource: repo://SPECS.md
  - id: openwiki-source-7fc5d1ad849c43e78a656618
    resource: repo://specs/diagrams/rental_activity_diagram.adoc
  - id: openwiki-source-1fe458af758c0e1575b94a5f
    resource: repo://specs/diagrams/uml_class_diagram.adoc
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

# Sibling Application & Specs Integration

The `nmecar` documentation repository does not contain the application it documents. It describes a separate car-rental platform that lives in a **sibling application repository**, and it keeps a parallel `specs/` directory of reference materials inside this repo. Authors enrich the published AsciiDoc by consulting these two sources together: `specs/` first for requirements, locale, payment, and design intent, then the sibling app repo for how the code actually behaves. This page maps both sources and the workflow that ties them to the docs.

> **See also.** The published corpus itself is mapped in [nmecar Documentation Corpus](../concepts/docs-corpus.md); the Antora structure that publishes it in [Antora Site Structure & Conventions](../concepts/antora-site.md); and how diagrams from `specs/diagrams/` are rendered in [Kroki & Diagrams Integration](../integrations/kroki-and-diagrams.md).

## Two sources, one workflow

`AGENTS.md` fixes the relationship between the two sources and the order in which authors should consult them:

- **`specs/` (in-repo reference)** — requirements, locales, payment notes, diagrams, and brand assets. These are the *intent* documents: what the system is supposed to do, written by the product/specs author. They live inside this repo so the docs build is self-contained.
- **Sibling app repo (`/home/maravelias/repos/car-rental/`)** — the *implementation source of truth*. The code that actually runs is the final arbiter of behavior. Its `docs/` folder carries product, reporting, business, release-process, and branding notes that capture the evolving state of the product.

The practical rule from `AGENTS.md` is: when enriching documentation, **consult `specs/` first**, then the sibling app repo for implementation details. The `specs/` files are smaller, localized to the docs context, and stable; the app repo is large and authoritative but slower to navigate. For ambiguous behavior, the app wins.

## The sibling application repository

`AGENTS.md` names the sibling repository and its role explicitly:

> The sibling application repository `/home/maravelias/repos/car-rental/` is a primary source for implementation truth and release-change discovery.

Two parts of that repo matter to documentation work:

### Implementation truth

The repository root holds the running application. When the docs and the app disagree, the app is correct and the docs must be corrected. This is a **content-author dependency, not a build dependency**: the docs repo has no code-level coupling to the app repo. The Antora playbook (`antora-playbook.yml`) declares a single content source — this repository's own `docs/` at `HEAD` — and never fetches or aggregates the sibling repo. Nothing in the build reads from `/home/maravelias/repos/car-rental/`. The dependency exists only in the author's head and workflow: a human opens the app repo to verify behavior, then edits AsciiDoc here.

### Release-change discovery

The sibling repo's `docs/` folder is where new releases are described before they reach the public docs site. `AGENTS.md` lists what lives there:

> The sibling application docs folder `/home/maravelias/repos/car-rental/docs/` contains product, reporting, business, release-process, and branding notes that should be consulted when enriching the documentation site.

When a new feature release is planned, authors mine this folder for the changes, then translate them into the docs repo's release-notes and feature pages — following the versioning policy in `AGENTS.md` (feature-level releases like `1.1`, `2.0`; map each product change to both a release-summary page and the affected feature pages).

### The v0-1 historical baseline

A specific subfolder preserves the earliest release's planning artifacts:

> Historical implementation details for the baseline release live under `/home/maravelias/repos/car-rental/docs/v0-1/`, including `brief.md`, `plan.md`, `stakeholder-release-note.md`, `tasks/**`, and `implementation/**`.

This is the baseline against which later releases (`1.1`, `2.0`) are described. It is consulted for original intent and for understanding what changed between releases, not for current behavior.

## The in-repo `specs/` reference directory

`specs/` is the docs repo's own reference shelf. `AGENTS.md` summarizes it as "requirements, locales, payment notes, diagrams," and `SPECS.md` calls it the home of "supporting reference materials for domain knowledge." Its contents map to specific authoring concerns:

| Path | Role |
|------|------|
| `specs/specs.adoc` | Full technical requirements spec (Greek, rev `1.0`, 2024-10-10). Defines the vocabulary, general capabilities, core entities (Locations, Seasons, Vehicle Groups, etc.), and includes the class and activity diagrams. The canonical "what the system should do" document. |
| `specs/notes.adoc` | Pricing model and payment-method notes: how `Rental Basic Price`, `Coupon Discount`, `Payment Cost`, and `Rental Total Price` compose; the offline/online payment methods and deposit rules. |
| `specs/payments.adoc` | Payment provider integration specifics (Cardlink for Alpha Bank / Eurobank, Piraeus epay, NBG, PayPal) — endpoints, merchant IDs, test credentials. |
| `specs/locales.adoc` | The supported UI locale list (21 languages, Albanian through Spanish), used to keep multilingual feature docs and `specs/locales.adoc` coordinated with the app. |
| `specs/diagrams/` | PlantUML sources: `uml_class_diagram.adoc` (entity/enum class diagram) and `rental_activity_diagram.adoc` (rental flow activity diagram). Included by `specs/specs.adoc` and reused for technical pages. |
| `specs/brand-guide/` | NMECAR brand assets and guide: `NMECAR-BRAND-GUIDE.md`, `nmecar-brand-guide.html`, logo SVGs (`nmecar.svg`, `nmecar_white.svg`, `nmecar_ALLwhite.svg`), favicon set (`favicon.svg`, `.ico`, PNG sizes, `site.webmanifest`), and `FAV_ICON_GUIDE.md`. Source for the rebrand applied in `supplemental-ui/`. |
| `specs/images/` | Supporting images for the specs AsciiDoc (e.g. `logo.svg` referenced by `specs/specs.adoc`). |
| `specs/cr_specs_draft_*.pdf`, `specs/specs-1.0.pdf`, `specs/notes_1.pdf`, `specs/payments.pdf` | PDF renderings / draft versions of the specs, notes, and payments documents — the published-form counterparts to the editable `.adoc` sources. |

### How `specs/` connects to the published docs

Several `specs/` files are direct ancestors of published content:

- **Pricing & payments** — `specs/notes.adoc` and `specs/payments.adoc` back the `admin/payments.adoc`, `booking/discounts.adoc`, and `booking/coupons.adoc` pages. The cost-composition table and provider mappings originate here.
- **Multilingual support** — `AGENTS.md` instructs authors to "coordinate translations with `specs/locales.adoc` when documenting multilingual features," and `SPECS.md` lists the CMS SEO multilingual fields that consume this locale set.
- **Diagrams** — `specs/diagrams/uml_class_diagram.adoc` and `rental_activity_diagram.adoc` are PlantUML sources rendered via Kroki (see [Kroki & Diagrams Integration](../integrations/kroki-and-diagrams.md)); the rental activity diagram underlies `technical/rental-process.adoc`.
- **Branding** — `specs/brand-guide/` is the source of the `nmecar` rebrand. `SPECS.md` records that the logo assets, favicon set, and NMECAR color/typography tokens were applied into `supplemental-ui/` from this guide.

### What `specs/` is not

`specs/` is **not** part of the Antora content source. The playbook's `start_path: docs` means only `docs/modules/ROOT/**` is published. `specs/` files are authoring references, not pages; they are never served on the site. Some are themselves authored in AsciiDoc (with their own document headers and `:stylesheet: fedora.css`) so they can be rendered standalone for review, but they sit outside the component tree.

## OpenWiki indexing boundary

OpenWiki indexes **this repository's `.adoc` pages**, not the sibling app repo. The sibling repository at `/home/maravelias/repos/car-rental/` lives outside this repo's tree and is not crawled; its content cannot be cited with `repo://` evidence because it is not part of this repository. Claims and evidence on OpenWiki pages therefore draw only from this docs repo — including `specs/` — while prose may still *describe* the sibling repo's role and quote the paths `AGENTS.md` assigns to it. The `specs/` `.adoc` files, by contrast, *are* in-repo and are indexable.

## Lifecycle and update discipline

Both sources carry update obligations recorded in `AGENTS.md`:

- **`SPECS.md`** must be updated whenever documentation content or structure changes — adding, moving, renaming, or deleting pages, partials, examples, images, or other structure-affecting assets. It is the in-repo inventory that keeps the content map in sync with the actual page tree.
- **`AGENTS.md`** is where durable, project-specific rules (source-of-truth locations, versioning decisions) are persisted for future documentation work — including the sibling repo paths and the consult-`specs/`-first rule documented here.
- **`specs/`** is edited by the specs/product author; the docs author consumes it. When `specs/` and the app diverge, the app is the implementation truth and the docs should follow the app, with `specs/` consulted for intent.

The net effect: a documentation change touches this repo's `docs/` (published content), usually references `specs/` (intent), and is verified against the sibling app repo (behavior) — three locations, only the first two of which OpenWiki can see.
