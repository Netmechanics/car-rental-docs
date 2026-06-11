# nmecar Documentation Specs

This file captures the current structure and content summary of the nmecar Antora documentation.
Keep it updated when documentation content or structure changes.

## Repository Purpose
This repository contains the Antora documentation site for nmecar (car rental platform). It includes the Antora playbook, component descriptor, content pages, reusable partials, assets, and code examples used in documentation.

## Antora Structure
- Playbook: `antora-playbook.yml` (site title `nmecar Documentation`)
- Component descriptor: `docs/antora.yml` (display title `nmecar`, component id `nmecar`, current documentation version `1.1`, ROOT module, nav at `modules/ROOT/nav.adoc`)
- Content pages: `docs/modules/ROOT/pages/**`
- Partials: `docs/modules/ROOT/partials/**`
- Images: `docs/modules/ROOT/images/**` (includes placeholder screenshots for roles UI steps)
- Examples: `docs/modules/ROOT/examples/**`
- UI overrides: `supplemental-ui/**`
- Vendored UI bundle: `vendor/antora-ui-default.zip`
- Theme source: `theme/site.scss` compiled to `supplemental-ui/css/site.css`

## Branding Notes
- The project branding and active Antora component id are `nmecar`.
- Project logo assets live in `supplemental-ui/img/nmecar.svg`, `nmecar_white.svg`, and `nmecar_ALLwhite.svg`.
- Favicon assets live in `supplemental-ui/` (`favicon.svg`, `favicon.ico`, PNG sizes, `apple-touch-icon.png`, `android-chrome-*.png`, `site.webmanifest`) and are wired from `supplemental-ui/partials/head-icons.hbs`.
- The footer keeps the company logo `supplemental-ui/img/nm_logo.svg` for NETMECHANICS branding and it is not part of the project rebrand.
- The theme uses NMECAR color tokens and typography (`Space Grotesk`, `Inter`, `JetBrains Mono`) loaded via `supplemental-ui/partials/head-styles.hbs`.

## Navigation Tree (ROOT)
- Home
  - `index.adoc` (welcome, caution notice, main nav)
- Fleet
  - `fleet/index.adoc`
  - `fleet/vehicle_groups.adoc`
  - `fleet/vehicles.adoc`
- Booking
  - `booking/index.adoc`
  - `booking/locations.adoc`
  - `booking/routes.adoc`
  - `booking/rental-search-logic.adoc`
  - `booking/seasons.adoc`
  - `booking/coupons.adoc`
  - `booking/insurances.adoc`
  - `booking/discounts.adoc`
  - `booking/extras.adoc`
  - `booking/rentals.adoc`
- Admin
  - `admin/index.adoc`
  - `admin/vehicle_models.adoc`
  - `admin/vehicle_types.adoc`
  - `admin/vehicle_features.adoc`
  - `admin/tags.adoc`
  - `admin/roles.adoc`
  - `admin/payments.adoc`
  - `admin/driver-age-charges.adoc`
  - `admin/price-rounding.adoc`
  - `admin/settings-system.adoc`
  - `admin/settings-email.adoc`
  - `admin/cms-seo-fields.adoc`
- Reporting
  - `reporting/index.adoc`
  - `reporting/lite-dashboard.adoc`
  - `reporting/dashboards.adoc`
  - `reporting/reports.adoc`
- Technical
  - `technical/index.adoc`
  - `technical/rental-process.adoc`
  - `technical/rental-search-logic.adoc`
  - `technical/reports_email.adoc`
  - `technical/scheduled-jobs.adoc`
  - `technical/config_installation.adoc`
  - `technical/dashboard.adoc`
  - `technical/logging.adoc`
  - `technical/pricing_analysis.adoc`
- Release Notes
  - `release-notes/index.adoc`
  - `release-notes/1.1.adoc`

## Content Summary
### Home
- Welcome page with caution banner and main navigation.

### Fleet
- Vehicle Groups: pricing by season, availability, tags, per-group pricing tools, and non-availability periods.
- Vehicles: vehicle details, filters, locations, tags, images, and plate-level status.

### Booking
- Locations: pickup/dropoff locations, costs, grouping, Google place link, defaults, and activation.
- Routes: location pairs with route pricing and charge policy integration.
- Rental Search Logic (Business): business-focused summary of search, duration, extra-hours rules, pricing bands, and outcomes.
- Seasons: calendar coverage requirement and minimum duration rules.
- Coupons: discount codes, validity windows, and regex validation.
- Insurances: per-day or per-period cost models with calculation examples.
- Discounts: discount types (A/B), precedence rules, and examples.
- Extras: per-day or per-booking extras with calculation example plus availability rules per vehicle group.
- Rentals: read-only rental fields, statuses, customer info, cost breakdown, driver age charge/payment details, and internal notes.

### Admin
- Vehicle Models: makes and models.
- Vehicle Types: category taxonomy.
- Vehicle Features: equipment/feature taxonomy.
- Tags: labels used to surface groups/vehicles; regex validation.
- Roles: system roles (`system-full-access`, `basic-access-role`) and CRUD scope for business users.
- Payments: offline/online methods, provider mapping, fees, and bank deposit confirmation flow.
- Driver Age Charges: age-zone setup, validation rules, FLAT/PERCENTAGE calculation, and rental snapshot behavior.
- Price Rounding: configurable rounding scale (0.1/0.5/1.0) and decimal places; explains which cost components are affected, examples, and step-by-step setup.
- System Settings: locales, rental code regex, dashboard embedding, Google API, extra hours, night hours, scheduled job settings, bank deposit reserve period, follow-up email settings, pricing rules, and limits.
- Email Settings: per-category sender/recipient/subject/copy rules (rental/contact/quote/reminder/thank-you).
- CMS SEO Fields: multilingual SEO metadata for posts/pages and their use in the public API.

### Reporting
- Reporting landing page: overview of the current `LITE` scope, KPI logic, Superset relation, and future reporting direction for the `1.1` documentation line.
- LITE Dashboard: implementation-oriented description of the `Σύνοψη Επιχείρησης LITE` dashboard, including scope, datasets, charts, filters, layout, and screenshot placeholders.
- Dashboards: clarifies that only the `LITE` dashboard is currently exposed while fuller dashboard suites remain future scope.
- Reports: planned reporting categories documented as roadmap/future scope, not as already exposed production functionality.

### Technical
- Rental Process: flow diagram with steps and decision points.
- Rental Search Logic: `/api/v1/booking/search` logic, duration rules, pricing bands, filters, and PlantUML workflows.
- Email Reports: Jmix Reports + FreeMarker templates for contact, quote, rental confirmation, reminder, and thank-you emails; DTO examples.
- Scheduled Jobs: abandoned rentals, finish rentals, rental follow-up emails, email send/cleanup, Google Place cache cleanup.
- Installation Config: DB, REST API, email, logging, and placeholder sections for TODOs.
- Dashboard: Superset integration, relation to the reporting section, prerequisites, PlantUML integration flow, and screenshot placeholders.
- Logging: Grafana Loki settings.
- Pricing Analysis: stub page.

### Release Notes
- Release notes landing page and initial `1.1` page for version-oriented documentation and future multi-version navigation.

## Reusable Partials
- Caution notice in `docs/modules/ROOT/partials/caution.adoc`.
- SonarQube badges in `docs/modules/ROOT/partials/sonarqube.adoc` and `sonarqube_badge.adoc` without embedded access tokens.
- Navigation partials under `docs/modules/ROOT/partials/nav_*.adoc`.

## Documentation Examples
- Java DTOs and model snippets in `docs/modules/ROOT/examples/*.java` used in technical email/report docs.

## Build Notes
- The Antora UI bundle is stored locally in `vendor/antora-ui-default.zip` to avoid depending on a remote `HEAD` artifact during normal builds.
- The content source now builds from the checked-out `HEAD`, so local documentation edits are reflected without switching to `master`.
- The documented build flow uses npm scripts: `npm run build:theme`, `npm run build:site`, `npm run build:site:fetch`, and `npm run preview`.
- The playbook is configured with the deployment URL `http://carrental-docs.nmlabs.gr`.
- The component descriptor now marks the current documentation line as `1.1`; full Antora multi-version activation still requires a dedicated `1.0` docs ref/tag with its own matching component version metadata.
