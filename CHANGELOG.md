# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/). The version
number lives in a single place, `package.json`, and is shown live in the app
footer.

## [1.1.0] - 2026-10-31

Desplaza now compares the real cost and time of several ways of making the
same trip in Spain, not just one car, and it is brought up to the standard of
the other portfolio tools.

### Added
- Comparison of up to five options on the same trip (combustion car,
  motorbike, electric car and public transport), each with its own name,
  ranked by cost, time or a balance of both with the hour valued in €/h; the
  best option is highlighted with what the others cost more per year. A
  table on wide screens and cards on phones.
- A dialog to create and edit each option, with the fields of its type, a
  live preview, validation and undo for deletion.
- Driving time from OSRM, and every MITECO fuel price from a single request.
- The comparison is kept on the device and can be shared as a link; links
  from the first version still open.
- Address search as an accessible combobox (arrow keys, Enter, Escape,
  announced status), and an accessible dialog for the sources.
- Credit to the author in the footer and the README, with a link to his GitHub.
- A design system shared byte for byte with the other portfolio tools
  (header, footer, selects, settings card, icons and theme), with a script
  that fails the build if a copy drifts (`npm run check:shared`) and a
  document that explains it (`docs/DESIGN-SYSTEM.md`).
- Screenshots in the README, a roadmap, a page on how the project evolved
  (`docs/evolution/`) and a preview image for shared links.
- ESLint and Prettier, and a CI that runs lint, formatting, the shared
  components check, tests and the build before every deploy.
- Tests that check the six languages define the same keys, including the
  keys the shared components need.
- A release workflow: pushing a `v*` tag creates the GitHub release from
  this changelog (`docs/RELEASING.md`).

### Changed
- License: GNU Affero General Public License v3.0 (`AGPL-3.0-only`).
- Dependencies aligned with the other tools: Vue 3.5, vue-i18n 11, Vite 7,
  Vitest 4 and TypeScript 5.9.
- The header shows a one-line description beside the app name (hidden on
  phones) and the footer states checkable facts: no cookies, no accounts,
  open source. The hero block with its badges is gone.
- The language selector has the same height as the theme selector, and the
  footer keeps the version together when the line wraps on a phone.
- Documentation describes what the app really does, including which third
  parties receive which data.
- Header buttons, the sources dialog and the search status are translated in
  all six languages.

### Removed
- Google Analytics and the cookie-consent banner: the app uses no cookies,
  analytics or tracking.
- Dead code and internal notes that were not part of the product.

### Fixed
- `<html lang>` follows the interface language.
- A high-severity advisory in vue-i18n (`@intlify/core-base`).
- The sources dialog was covered by the sticky header.

## [1.0.1] - 2026-08-27

### Fixed
- Fuel prices update immediately and empty prices are handled.

### Added
- The state of the app can be restored from the URL.

## [1.0.0] - 2026-08-27

First public release: one car, daily MITECO fuel prices by province, address
search with Photon, route and driving time with OSRM, real cost including
wear (0.08 €/km), comparison with public transport passes, a lightweight SVG
map, six languages and light and dark themes.
