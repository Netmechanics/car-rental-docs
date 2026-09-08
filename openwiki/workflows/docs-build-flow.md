---
type: build-workflow
title: Antora Build Flow
description: Traces the docs site build from Sass theme compile through the Antora run (local HEAD content, vendored UI bundle, Kroki build-time fetch, bilingual Lunr index) to the build/site output and local preview, covering the two build variants and their network requirements.
tags: [antora, build, sass, kroki, lunr, ui-bundle, npm, nmecar]
verified:
  - by: openwiki/0.4.3
    at: 2026-09-04T12:40:12.458Z
sources:
  - id: openwiki-source-4f023c807033aa9f84babd76
    resource: repo://antora-playbook.yml
  - id: openwiki-source-c6004ea2ff6e6cc978fdccb5
    resource: repo://docs/antora.yml
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
  - id: openwiki-source-8d797ce9506a895e4497de26
    resource: repo://supplemental-ui/partials/footer-scripts.hbs
  - id: openwiki-source-2e5aef4779fa12a2d0d29e62
    resource: repo://theme/site.scss
  - id: openwiki-source-25017c61bb937cc24ceaf844
    resource: repo://vendor/antora-ui-default.zip
generated: { by: "openwiki/0.4.3", at: "2026-09-04T12:40:12.458Z" }
---

# Antora Build Flow

The documentation site is produced by a two-phase npm script chain: a Sass theme compile that writes CSS into the supplemental UI overlay, and an Antora run that reads the local working tree, the vendored UI bundle, the Kroki-rendered diagrams, and the bilingual Lunr index, and writes static HTML to `build/site`. This page traces that flow end to end — the scripts, the playbook inputs Antora consumes, the two build variants and their network requirements, and the local preview server — so a reader can predict what each command touches and when the build needs the network.

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
flowchart TD
  theme["build:theme<br/>sass --no-source-map<br/>theme/site.scss<br/>→ supplemental-ui/css/site.css"]
  antora["antora antora-playbook.yml"]
  fetch["antora --fetch antora-playbook.yml"]
  head["content source<br/>url: . branches: HEAD<br/>start_path: docs<br/>(uncommitted edits included)"]
  bundle["vendored UI bundle<br/>vendor/antora-ui-default.zip"]
  supp["supplemental-ui overlay<br/>partials, fonts, img, site.css"]
  kroki["Kroki server<br/>https://kroki.nmlabs.gr<br/>kroki-fetch-diagram: true"]
  lunr["lunr-extension<br/>languages: en, el<br/>index_latest_only: true"]
  out["build/site<br/>(static HTML)"]
  preview["preview<br/>python3 http.server<br/>:8081"]

  theme --> antora
  theme --> fetch
  head --> antora
  head --> fetch
  bundle --> antora
  bundle --> fetch
  supp --> antora
  supp --> fetch
  kroki --> antora
  kroki --> fetch
  lunr --> antora
  lunr --> fetch
  antora --> out
  fetch --> out
  out --> preview
```

*The build pipeline: theme compile feeds the supplemental UI overlay, which Antora layers over the vendored bundle; both build variants read the same local `HEAD` content and Kroki/Lunr inputs and write to `build/site`.*

## The npm script chain

The build is defined entirely in the repository root `package.json`. There are three relevant scripts, and their composition is the key to understanding the flow:

```json
"build:theme": "sass --no-source-map theme/site.scss supplemental-ui/css/site.css",
"build:site": "npm run build:theme && antora antora-playbook.yml",
"build:site:fetch": "npm run build:theme && antora --fetch antora-playbook.yml"
```

`build:site` and `build:site:fetch` both **run `build:theme` first**, then run Antora. The theme compile is not optional and is not invoked independently in the normal workflow — it is a prerequisite step chained before Antora via `&&`. The only difference between the two site scripts is the `--fetch` flag passed to Antora; everything else — the theme compile, the playbook, the inputs — is identical.

### Phase 1 — Sass theme compile (`build:theme`)

`build:theme` runs the `sass` compiler (declared as `sass` `^1.93.2` in `devDependencies`) with `--no-source-map`, reading `theme/site.scss` and writing `supplemental-ui/css/site.css`. The entrypoint is a pure `@use` aggregator: it pulls in `vars`, `base`, `body`, `nav`, `main`, `toolbar`, `breadcrumbs`, `page-versions`, `toc`, `doc`, `pagination`, `header`, `footer`, `print`, `search`, and three component partials (`cards`, `troubleshooting`, `colors`). The compiled output lands in the **supplemental UI directory**, not the theme directory — the theme source lives in `theme/`, but the CSS Antora actually ships is the compiled file in `supplemental-ui/css/site.css`.

This is why the theme compile must run *before* Antora: Antora packages `supplemental-ui/` into the site, so the CSS has to exist on disk first. A stale or missing `supplemental-ui/css/site.css` means the site ships the previous theme (or the bundle's default) until `build:theme` re-runs.

### Phase 2 — Antora run (`build:site` / `build:site:fetch`)

After the theme is compiled, Antora runs against `antora-playbook.yml`. The playbook is the single configuration entry point that tells Antora what content to read, what UI to apply, what AsciiDoc extensions to load, and where to write the output. The generated site is written to `./build/site` (the conventional Antora output location; the playbook does not override it).

The two variants differ only in whether Antora refreshes remote assets before building:

- **`build:site`** — `antora antora-playbook.yml` with no `--fetch`. Uses whatever remote assets Antora has already cached locally. This is the standard local build.
- **`build:site:fetch`** — `antora --fetch antora-playbook.yml`. The `--fetch` flag tells Antora to re-download remote content sources and refresh cached assets before building. Use this when you intentionally want to pull updated remote dependencies.

In practice the network distinction that matters for this repository is **not** the `--fetch` flag — the content source is local — but the **Kroki fetch**, which runs on every build regardless of variant (see [Kroki build-time fetch](#kroki-build-time-fetch)).

## What Antora reads from the playbook

The playbook (`antora-playbook.yml`) feeds Antora five categories of input. Understanding which is local and which is remote determines when the build needs the network.

### Content source — local `HEAD`, uncommitted edits included

```yaml
content:
  sources:
    - url: .
      branches:
        - HEAD
      start_path: docs
```

The content source is the repository itself (`url: .`), built from the currently checked-out `HEAD` (`branches: HEAD`), starting from the `docs/` directory (`start_path: docs`). This has an important consequence: **the build reads the working tree, not a committed ref.** Uncommitted edits to files under `docs/` are included in the generated site without committing to `master` first. There is no `--fetch`-triggered remote content pull to worry about for the docs corpus, because the corpus is local. (`git.ensure_git_suffix: false` and `content.edit_url: false` round out the git/content options — the site exposes no edit links.)

### UI bundle — vendored, not downloaded

```yaml
ui:
  bundle:
    url: ./vendor/antora-ui-default.zip
  supplemental_files: ./supplemental-ui
```

The UI bundle is **vendored** at `vendor/antora-ui-default.zip` (a ~300 KB committed zip). Because `ui.bundle.url` points at a local path rather than a GitLab URL, a standard `build:site` does **not** download the default Antora UI from the network on every run — the bundle is already in the repository. This is the single biggest reason a normal local build can succeed offline (modulo Kroki).

The `--fetch` variant exists precisely for the case where the bundle *were* remote: `--fetch` refreshes remote UI bundle and content assets. With a vendored local bundle and a local content source, `build:site:fetch` and `build:site` read the same local files; the difference is only material if a remote source is added later.

### Supplemental UI overlay

`ui.supplemental_files: ./supplemental-ui` layers the repository's own UI assets **on top of** the vendored bundle. The supplemental directory contains:

- **`css/site.css`** — the compiled theme (produced by `build:theme`), plus `site-ext.css`, `fonts.css`, and `tabs.css`.
- **`partials/*.hbs`** — Handlebars templates that override or extend the bundle's UI chrome: `head-styles.hbs` (adds the Google Fonts stylesheet link and the `site.css`/`tabs.css`/`site-ext.css` stylesheet links), `footer-scripts.hbs` (the site script and the conditional `search-scripts` partial, gated on `env.SITE_SEARCH_PROVIDER`), `header-content.hbs`, `nav-menu.hbs`, `footer-content.hbs`, `edit-this-page.hbs`, `head-icons.hbs`, `main.hbs`.
- **`js/tabs.js`**, **`fonts/`** (Open Sans and Roboto Mono woff/woff2), **`img/`** (logos, admonition SVGs, icons), **`site.webmanifest`**, and the favicon set.

The overlay is the mechanism by which the custom theme, fonts, partials, and icons reach the generated site. Because it overlays the bundle, an asset present in both wins from `supplemental-ui`; an asset only in the bundle still ships. The compiled `site.css` from phase 1 is the most important overlaid asset.

### Kroki build-time fetch

```yaml
asciidoc:
  attributes:
    kroki-server-url: https://kroki.nmlabs.gr
  extensions:
    - 'asciidoctor-kroki'
    - '@asciidoctor/tabs'
```

The `asciidoctor-kroki` extension (`^0.18.1`) is registered in the playbook, and `kroki-server-url` points at `https://kroki.nmlabs.gr`. The component descriptor `docs/antora.yml` sets `kroki-fetch-diagram: true`. Together these mean **diagrams are fetched from the Kroki server and rendered to local image files at build time**, so the generated HTML references a local image rather than calling Kroki on every page view.

This is the real network dependency of the build, and it applies to **both** `build:site` and `build:site:fetch` — the Kroki fetch is driven by the `kroki-fetch-diagram` attribute, not by Antora's `--fetch` flag. A local or CI build still needs network access to `https://kroki.nmlabs.gr` to render any page that contains a Kroki diagram block. See [Kroki & Diagrams](../integrations/kroki-and-diagrams.md) for the diagram authoring side and the full fetch mechanism.

### Lunr bilingual index

```yaml
antora:
  extensions:
    - require: '@antora/lunr-extension'
      languages: [en, el]
      index_latest_only: true
```

The `@antora/lunr-extension` (`^1.0.0-alpha.13`) builds a client-side search index at build time, configured for bilingual English/Greek (`languages: [en, el]`, backed by `lunr-languages` `1.14.0`) and `index_latest_only: true` so only the latest component version is indexed. The extension runs during the Antora generate phase and emits the index into `build/site` alongside the HTML; the generated site wires it up through the `SITE_SEARCH_PROVIDER`-gated `search-scripts` partial in `footer-scripts.hbs`. The bilingual configuration matches the Greek-localized UI chrome set in the same playbook (the `note`/`tip`/`important`/`caution`/`warning` captions and `page-toctitle`), so the site and its search index are localized consistently.

## Output and local preview

Antora writes the static site to `./build/site`. The `preview` script serves that directory over HTTP:

```json
"preview": "python3 -m http.server 8081 --directory build/site"
```

`npm run preview` runs a Python 3 stdlib HTTP server bound to `http://localhost:8081` serving `build/site`. Python 3 is therefore an optional prerequisite for local preview (but not for the build itself). The deployment site URL is configured separately in the playbook as `http://carrental-docs.nmlabs.gr` (`site.url`); that value populates the generated site's canonical metadata and is used by the CI publish workflow, not by the local preview server.

## Build variants and network requirements at a glance

| | `build:site` | `build:site:fetch` |
|---|---|---|
| Sass theme compile first | yes (`build:theme`) | yes (`build:theme`) |
| Antora `--fetch` flag | no | yes |
| Content source | local `HEAD` (`url: .`) | local `HEAD` (`url: .`) |
| UI bundle | vendored `vendor/antora-ui-default.zip` | vendored `vendor/antora-ui-default.zip` |
| Refresh remote assets | no | yes (no remote source to refresh here) |
| Kroki fetch (`kroki.nmlabs.gr`) | **yes** (every build with diagrams) | **yes** |
| Lunr index build | yes | yes |
| Output | `build/site` | `build/site` |

The practical takeaway: because the content source is local and the UI bundle is vendored, the `--fetch` flag is rarely the thing that makes a build need the network. The Kroki fetch is. A build with no diagram blocks can complete offline; a build that touches any Kroki-rendered page needs `https://kroki.nmlabs.gr` reachable. The CI publish workflow uses `build:site` (no `--fetch`) and adds a CNAME file before deploying to GitHub Pages — see [CI/CD](../operations/cicd.md).

## Common pitfalls

- **Stale theme CSS.** If `build:theme` is skipped or fails, `supplemental-ui/css/site.css` is the previous compile (or missing). The chained `build:site`/`build:site:fetch` scripts prevent this by running `build:theme` first, but running `antora` directly bypasses the compile.
- **Kroki offline failure.** A build behind a firewall without access to `https://kroki.nmlabs.gr` will fail (or produce unrendered diagram blocks) on any page containing a Kroki diagram, regardless of which build variant is used.
- **Partial `node_modules`.** A stale or partial install is the most common cause of a broken build; deleting `node_modules` and re-running `npm install` is the standard recovery step. See [Build & Preview](../operations/build-and-preview.md) for the full operations runbook.
