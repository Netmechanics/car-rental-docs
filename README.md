# Manual Build Guide

## Prerequisites
- Node.js 18+ (the repo is tested with Node 20.18.1)
- npm (bundled with Node.js)
- Network access to npm registry and the configured Kroki server

Optional tools:
- Python 3 (for local preview)

> Run all commands from the repository root (`/home/maravelias/repos/car-rental-docs`).

## 1. Install project dependencies

Install the Antora toolchain and supporting packages:

```shell
npm install
```

If you encounter network issues or partial installs, delete `node_modules` and retry the command.

## 2. Generate the site

For a standard local build:

```shell
npm run build:site
```

To rebuild after intentionally refreshing external Antora assets, use:

```shell
npm run build:site:fetch
```

The build script compiles the custom Sass theme into `supplemental-ui/css/site.css` and then runs Antora.
The generated site is written to `./build/site`.
The playbook reads content from the currently checked out `HEAD`, so local documentation edits are included without committing to `master` first.
The deployment URL is configured in the playbook as `http://carrental-docs.nmlabs.gr`.

## 3. Preview locally

```shell
npm run preview
```

Then visit `http://localhost:8081` in your browser.

## 4. Notes

- The repository vendors the Antora UI bundle in `vendor/antora-ui-default.zip` so builds do not depend on downloading the default UI from GitLab on every run.
- Kroki diagrams are fetched during the build because `kroki-fetch-diagram` is enabled. Local or CI builds therefore still need network access to `https://kroki.nmlabs.gr`.
- The generated site now uses `http://carrental-docs.nmlabs.gr` as its published site URL for deployment metadata.
