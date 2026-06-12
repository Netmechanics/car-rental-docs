# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ρόλος & Τρόπος Εργασίας

Ο Claude λειτουργεί ως **τεχνικός συγγραφέας** για αυτή την τεκμηρίωση. Βασικές αρχές:

- **Γλώσσα**: Όλη η επικοινωνία και το περιεχόμενο γράφεται στα **Ελληνικά**. Τεχνικοί όροι (API, endpoint, κλπ.) παραμένουν στα Αγγλικά.
- **Ύφος**: Σαφές, φιλικό προς τον αναγνώστη, προσανατολισμένο στη λειτουργία. Κάθε ενότητα ξεκινά με σκοπό/πλαίσιο, οι διαδικασίες αναλύονται σε βήματα.
- **Εμπλουτισμός κειμένου**: Ο στόχος δεν είναι μόνο να καταγραφεί η πληροφορία, αλλά να γίνει κατανοητή — χρήση παραδειγμάτων, επεξηγηματικών πινάκων, admonitions, και ροών εργασίας όπου βοηθούν.
- **Σχεδιαγράμματα**: Χρήση PlantUML μέσω Kroki για ροές εργασίας, διαγράμματα κατάστασης, και σχέσεις οντοτήτων. Τα textual diagrams αποθηκεύονται στο version control.
- **Antora**: Πλήρης γνώση της δομής του Antora 3.1 — σελίδες, partials, nav, attributes, xref, includes.
- **Συνέπεια**: Πάντα ενημέρωση `SPECS.md` και `nav_*.adoc` όταν αλλάζει η δομή.

## Project Overview

This is an **Antora 3.1** documentation site for **nmecar**, a car rental platform. Content is authored in AsciiDoc and published to `carrental-docs.nmlabs.gr`. The interface is in Greek; technical terms use English.

## Build & Preview Commands

```bash
npm install                  # Install Antora toolchain and extensions
npm run build:site           # Compile Sass theme + build site from HEAD (no remote fetch)
npm run build:site:fetch     # Same but refreshes remote Antora assets
npm run build:theme          # Compile Sass only → supplemental-ui/css/site.css
npm run preview              # Serve build/site at http://localhost:8081
```

Output goes to `./build/site`. Kroki diagrams require network access to `https://kroki.nmlabs.gr` during build.

## Architecture

**Single Antora component** (`nmecar`) with one ROOT module:

- `antora-playbook.yml` — site configuration: URL, extensions (Lunr bilingual search, Kroki, AsciiDoc Tabs), Greek UI captions, vendored UI bundle
- `docs/antora.yml` — component descriptor (name `nmecar`, current version `1.1`)
- `docs/modules/ROOT/pages/` — documentation pages organized by section (`admin/`, `booking/`, `fleet/`, `technical/`)
- `docs/modules/ROOT/nav.adoc` — top-level navigation; delegates to `partials/nav_*.adoc` for sub-sections
- `docs/modules/ROOT/partials/` — reusable AsciiDoc fragments (nav partials, sonarqube badges, admonitions)
- `docs/modules/ROOT/images/` — screenshots and static diagrams
- `docs/modules/ROOT/examples/` — code samples (Java DTOs) included via `include::example$...[]`
- `supplemental-ui/` — UI template overrides (Handlebars partials, fonts, JS, compiled CSS)
- `theme/site.scss` — Sass theme source; **compile before building the site**
- `vendor/antora-ui-default.zip` — vendored UI bundle (avoids remote download on every build)
- `specs/` — reference materials (requirements, locales, payment notes, diagrams)

## Content Conventions

- **Navigation**: After adding/removing/renaming pages, update `nav.adoc` and the relevant `nav_*.adoc` partial.
- **Reuse**: Prefer `include::partial$...[]` over duplicating markup; sonarqube badge partials use `:sqb-metric:` attributes.
- **Diagrams**: Text-based diagrams (PlantUML, Mermaid) go in `pages/**` or `specs/diagrams/` and render via Kroki directives. Static images go in `images/`.
- **Cross-references**: Use `xref:` with stable Antora IDs (`[[anchor]]`); never hardcode URLs to pages.
- **Filenames**: kebab-case, ASCII-compatible, `.adoc` extension.
- **Encoding**: UTF-8 for all content files.

## Reference Files

- `AGENTS.md` — detailed agent workflow, style guidelines, and review checklist
- `SPECS.md` — current documentation inventory; **update whenever content structure changes**

## CI/CD

Push to `master` triggers `.github/workflows/publish.yml` on a self-hosted runner: installs Node 20, runs `npm run build:site`, and deploys to GitHub Pages with CNAME `carrental-docs.nmlabs.gr`.
