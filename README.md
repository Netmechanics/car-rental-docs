# Manual Build Guide

## Prerequisites
- Node.js 18+ (the repo is tested with Node 20.18.1)
- npm (bundled with Node.js)
- Network access to npm registry and the configured Kroki server

Optional tools:
- `http-server` (for local preview)
- `sass`/`node-sass` (installed on-demand via `npx` in the commands below)

> Run all commands from the repository root (`/home/maravelias/repos/car-rental-docs`).

## 1. Install project dependencies

Install the Antora site generator, extensions, and supporting packages:

```shell
npm install
```

If you encounter network issues or partial installs, delete `node_modules` and retry the command.

## 2. Build the custom UI theme

Compile the Sass theme and stage it for Antora and the supplemental UI bundle:

```shell
npx node-sass ./theme/site.scss ./theme/site.css
cp ./theme/site.css ./supplemental-ui/css/site.css
```

Leave `./theme/site.css` in place for the next step; Antora will copy it into the build.

## 3. Generate the Antora site

```shell
npx antora --fetch antora-playbook.yml
```

The site output is written to `./build/site`. Re-running the command updates the existing build.

If you want to drop the freshly built CSS directly into the generated site without rebuilding Antora, copy it after the build completes:

```shell
cp ./theme/site.css ./build/site/_/css/site.css
```

## 4. Preview locally

Install a simple static server (one-time):

```shell
npm install -g http-server
```

Or use `npx http-server` if you prefer not to install globally.

Serve the generated site:

```shell
http-server build/site -c-1 -p 8081
```

Then visit `http://localhost:8081` in your browser.
