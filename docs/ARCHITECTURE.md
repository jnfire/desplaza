# Project Architecture

*Read this in [Spanish](ARCHITECTURE-es.md).*

**Desplaza** is a static single-page app with no backend of its own. Cost calculations run in the browser; address search, routing, map tiles and fuel prices come from public third-party services.

## Core Principles
- **No backend, no accounts:** Nothing is stored on a server. Preferences and the current comparison live in `localStorage`, and a shared comparison travels in the URL.
- **Pure domain logic:** The trip, the travel options and their comparison are plain TypeScript in `src/core/`, independent of Vue, and unit-tested.
- **Thin service clients:** Each external API has one small module in `src/services/` that returns typed data and degrades to an empty result on failure, so the UI keeps working without network access.

## Third-Party Services

| Service | Used for | What it receives |
| --- | --- | --- |
| [Photon](https://photon.komoot.io) (OpenStreetMap data) | Address search and autocompletion | The text typed in the origin and destination fields |
| [OSRM](https://project-osrm.org) public demo server | Road distance, driving time and route geometry | Origin and destination coordinates |
| [Esri](https://www.esri.com) World Light/Dark Gray Base | Map tiles | The map area being viewed |
| [MITECO](https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/) fuel-price REST API | Daily fuel prices per province | The province id |

Electricity prices and public transport fares and times have no official source the app can query; the user enters them, starting from editable reference values.

---

## Directory & Layer Structure

### 1. Domain Layer (`src/core/`)
- **`travelOptions.ts`**: The shared trip settings (trip type, days per week, active months) and four kinds of travel option, each with a user-chosen name: combustion car, motorbike, electric car and public transport. Creates options with sensible defaults, duplicates them, changes their kind keeping shared fields, gives unique names and sanitizes data read from storage or a shared link.
- **`comparison.ts`**: For each option on the same trip, the cost per journey, per month and per year, and the minutes per journey. Combustion cars use MITECO or a manual price; electric cars blend home and public charging prices; public transport is a monthly pass or single tickets; vehicles can add wear (€0.08/km by default), tolls per leg and parking per day. Ranks options by cost, time or balance (cost plus time valued at an editable €/h); results with a missing price or time go last.
- **`persistence.ts`**: Saves the trip and options in `localStorage` and loads them back, discarding corrupt or invalid data.

### 2. Services Layer (`src/services/`)
- **`miteco.ts`**: Client for the MITECO fuel-price REST API. Lists provinces and computes the day's arithmetic mean price of every fuel (95 and 98 gasoline, diesel, premium diesel, LPG) across a province's service stations from a single request, rounded to three decimals.
- **`routing.ts`**:
  - `geocodeAddress()` queries **Photon**, biased to Spain, and builds a readable label from street, number, city and region.
  - `getRouteData()` queries **OSRM** for a driving route and returns the distance in kilometres, the driving time in minutes and the route's coordinates.
- **`shareUrl.ts`**: Encodes origin, destination, the trip and every option into the URL (options as base64url JSON) and decodes them back. Links from the first version, with one vehicle, still open as a single combustion option.

### 3. Utilities (`src/utils/`)
- **`format.ts`**: Locale-aware numbers and durations.
- **`theme.ts`**: Light, dark or system theme, persisted in `localStorage`.

### 4. Presentation Layer (`src/components/`)
- **`App.vue`**: Holds the app state. Restores a shared comparison from the URL or the saved one, matches the origin to a MITECO province (Madrid when no match is found), loads fuel prices and routes, computes every option's result, opens the option editor and switches between the desktop and mobile layouts.
- **`AppHeader.vue`**: Brand, share button and settings toggle.
- **`TripCard.vue`**: What every option shares: `RouteForm`, trip type, days per week and active months.
- **`OptionsPanel.vue`**: With one option, the large cost summary; from two options, the ranked comparison with the sort selector, the best option highlighted, the extra cost of the others, and edit, duplicate and delete on every row.
- **`OptionEditorModal.vue`**: Dialog to create or edit an option: name, type and only the fields of that type, validation, and a live preview of cost and time.
- **`BaseModal.vue`**: Accessible dialog shell (focus trap, Escape, focus return, scroll lock, full screen on phones) used by the editor and the sources modal.
- **`RouteForm.vue`**: Origin and destination fields with debounced Photon suggestions.
- **`NativeMap.vue`**: Leaflet map with draggable origin and destination markers, the route line and Esri tiles that follow the theme.
- **`SettingsView.vue` / `PersonalizationCard.vue`**: Settings screen with language and theme.
- **`SourcesModal.vue`**: Methodology and data sources.
- **`LangSelector.vue` / `CustomSelect.vue` / `FlagIcon.vue` / `SettingsIcon.vue`**: Keyboard-accessible controls shared in style with the other portfolio tools.
- **`AppFooter.vue`**: Version (linked to its release), methodology, source code and license links.

### 5. Internationalization (`src/i18n/`)
- `vue-i18n` in composition mode with English, Spanish, French, German, Italian and Portuguese dictionaries. The language is detected from the browser or the saved preference, and `<html lang>` follows it.

### 6. Layout
- **Desktop (≥900px):** Two columns: the trip on the left; the map and the options on the right.
- **Mobile (<900px):** One column with a collapsible map.

### 7. Quality Checks
- **Vitest** tests in `src/**/__tests__/` cover the travel options and their comparison, local saving, the three service clients (with `fetch` stubbed, so no real API is called), share links in both versions and the parity of the six dictionaries.
- **ESLint**, **Prettier** and **vue-tsc** run in CI together with the tests and the production build; the GitHub Pages deploy only runs when they pass.

### Shared components

The header, footer, selects, settings card, icons and theme util are shared byte for byte with the other portfolio tools. What differs per app (repository and author) lives in `src/app.config.ts`. See [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).
