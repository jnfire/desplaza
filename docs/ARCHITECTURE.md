# Project Architecture

*Read this in [Spanish](ARCHITECTURE-es.md).*

**Desplaza** is a static single-page app with no backend of its own. Cost calculations run in the browser; address search, routing, map tiles and fuel prices come from public third-party services.

## Core Principles
- **No backend, no accounts:** Nothing is stored on a server. Preferences live in `localStorage`, and a shared scenario travels in the URL.
- **Pure domain logic:** Cost math is plain TypeScript in `src/utils/`, independent of Vue, and unit-tested.
- **Thin service clients:** Each external API has one small module in `src/services/` that returns typed data and degrades to an empty result on failure, so the UI keeps working without network access.

## Third-Party Services

| Service | Used for | What it receives |
| --- | --- | --- |
| [Photon](https://photon.komoot.io) (OpenStreetMap data) | Address search and autocompletion | The text typed in the origin and destination fields |
| [OSRM](https://project-osrm.org) public demo server | Road distance and route geometry | Origin and destination coordinates |
| [Esri](https://www.esri.com) World Light/Dark Gray Base | Map tiles | The map area being viewed |
| [MITECO](https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/) fuel-price REST API | Daily fuel prices per province | The province id |

---

## Directory & Layer Structure

### 1. Services Layer (`src/services/`)
- **`miteco.ts`**: Client for the MITECO fuel-price REST API. Lists provinces and computes the day's arithmetic mean price across a province's service stations for the selected fuel (95 and 98 gasoline, diesel, premium diesel, LPG), rounded to three decimals.
- **`routing.ts`**:
  - `geocodeAddress()` queries **Photon**, biased to Spain, and builds a readable label from street, number, city and region.
  - `getRouteData()` queries **OSRM** for a driving route and returns the distance in kilometres and the route's coordinates.
- **`shareUrl.ts`**: Encodes origin, destination and vehicle settings into URL query parameters and decodes them back, clamping days and months to valid ranges and falling back to defaults for unknown values.

### 2. Domain Layer (`src/utils/`)
- **`costMath.ts`**: `calculateCarCosts()` returns the cost per trip, per month and per year from distance, consumption, fuel price, days per week and active months, for one-way (`ida`), round-trip (`idavuelta`) or recurring (`ciclo`) trips. An optional per-kilometre surcharge (€0.08/km in the UI) covers wear, maintenance, insurance and depreciation.
- **`theme.ts`**: Light, dark or system theme, persisted in `localStorage`.

### 3. Presentation Layer (`src/components/`)
- **`App.vue`**: Holds the app state. Restores a shared scenario from the URL, matches the origin to a MITECO province (Madrid when no match is found), loads fuel prices and routes, computes costs and switches between the desktop and mobile layouts.
- **`AppHeader.vue`**: Brand, share button and settings toggle.
- **`VehicleConfig.vue`**: Trip type, days per week, active months, price source (automatic or manual), fuel type, consumption and the wear surcharge. Contains `RouteForm`.
- **`RouteForm.vue`**: Origin and destination fields with debounced Photon suggestions.
- **`NativeMap.vue`**: Leaflet map with draggable origin and destination markers, the route line and Esri tiles that follow the theme.
- **`SettingsView.vue` / `PersonalizationCard.vue`**: Settings screen with language and theme.
- **`SourcesModal.vue`**: Methodology and data sources.
- **`LangSelector.vue` / `CustomSelect.vue` / `FlagIcon.vue` / `SettingsIcon.vue`**: Keyboard-accessible controls shared in style with the other portfolio tools.
- **`AppFooter.vue`**: Version (linked to its release), methodology, source code and license links.

### 4. Internationalization (`src/i18n/`)
- `vue-i18n` in composition mode with English, Spanish, French, German, Italian and Portuguese dictionaries. The language is detected from the browser or the saved preference, and `<html lang>` follows it.

### 5. Layout
- **Desktop (≥900px):** Two columns, with the form on the left and the map and results on the right.
- **Mobile (<900px):** One column with a collapsible map.

### 6. Quality Checks
- **Vitest** tests in `src/**/__tests__/` cover the cost math, the three service clients (with `fetch` stubbed, so no real API is called), the share-URL round trip and the parity of the six dictionaries.
- **ESLint**, **Prettier** and **vue-tsc** run in CI together with the tests and the production build; the GitHub Pages deploy only runs when they pass.
