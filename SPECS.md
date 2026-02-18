# WheelRent Documentation Specs

This file captures the current structure and content summary of the WheelRent Antora documentation.
Keep it updated when documentation content or structure changes.

## Repository Purpose
This repository contains the Antora documentation site for WheelRent (car rental platform). It includes the Antora playbook, component descriptor, content pages, reusable partials, assets, and code examples used in documentation.

## Antora Structure
- Playbook: `antora-playbook.yml`
- Component descriptor: `docs/antora.yml` (component `wr`, ROOT module, nav at `modules/ROOT/nav.adoc`)
- Content pages: `docs/modules/ROOT/pages/**`
- Partials: `docs/modules/ROOT/partials/**`
- Images: `docs/modules/ROOT/images/**` (includes placeholder screenshots for roles UI steps)
- Examples: `docs/modules/ROOT/examples/**`
- UI overrides: `supplemental-ui/**`
- Theme source: `theme/site.scss` compiled to `theme/site.css`

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
  - `admin/settings-system.adoc`
  - `admin/settings-email.adoc`
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
- Extras: per-day or per-booking extras with calculation example.
- Rentals: read-only rental fields, statuses, customer info, cost breakdown, and internal notes.

### Admin
- Vehicle Models: makes and models.
- Vehicle Types: category taxonomy.
- Vehicle Features: equipment/feature taxonomy.
- Tags: labels used to surface groups/vehicles; regex validation.
- Roles: system roles (`system-full-access`, `basic-access-role`) and CRUD scope for business users.
- Payments: offline/online methods, provider mapping, fees, and deposit rules.
- System Settings: locales, rental code regex, dashboard embedding, Google API, extra hours, night hours, scheduled job settings, pricing rules, and limits.
- Email Settings: per-category sender/recipient/subject/copy rules (rental/contact/quote).

### Technical
- Rental Process: flow diagram with steps and decision points.
- Rental Search Logic: `/api/v1/booking/search` logic, duration rules, pricing bands, filters, and PlantUML workflows.
- Email Reports: Jmix Reports + FreeMarker templates; DTO examples.
- Scheduled Jobs: abandoned rentals, finish rentals, email send/cleanup, Google Place cache cleanup.
- Installation Config: DB, REST API, email, logging, and placeholder sections for TODOs.
- Dashboard: Superset integration and disable flag.
- Logging: Grafana Loki settings.
- Pricing Analysis: stub page.

## Reusable Partials
- Caution notice in `docs/modules/ROOT/partials/caution.adoc`.
- SonarQube badges in `docs/modules/ROOT/partials/sonarqube.adoc` and `sonarqube_badge.adoc`.
- Navigation partials under `docs/modules/ROOT/partials/nav_*.adoc`.

## Documentation Examples
- Java DTOs and model snippets in `docs/modules/ROOT/examples/*.java` used in technical email/report docs.
