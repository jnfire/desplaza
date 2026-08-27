# Project Architecture

*Read this in [Spanish](ARCHITECTURE-es.md).*

**Desplaza** is architected around the principles of simplicity, zero backend footprint (100% Client-Side), strict domain logic decoupling, and high performance.

## Core Architectural Principles
- **100% Client-Side Execution:** All calculations, routing requests, and state transformations occur directly in the user's browser.
- **Framework-Agnostic Core:** Financial and geographic math is kept in pure TypeScript utility modules independent of the Vue reactivity engine.
- **Ultra-Lightweight Footprint:** Custom native SVG map rendering eliminates heavy third-party mapping dependencies like Leaflet or Mapbox from the critical bundle path.

---

## Directory & Layer Structure

### 1. Services Layer (`src/services/`)
Handles integration with external open APIs and data serialization:
- **`miteco.ts`**: Client for the official Open Data REST API of the Spanish Ministry for Ecological Transition (MITECO). Queries provincial service stations and computes daily arithmetic average fuel prices for gasoline (95/98), diesel, LPG, and electric tariffs.
- **`routing.ts`**: Geocoding and route calculation:
  - **Photon (OpenStreetMap)**: Debounced address search and reverse geocoding with bounding box support.
  - **OSRM (Open Source Routing Machine)**: Driving distance, travel time, and polyline coordinate decoding.
- **`transitCalculator.ts` / `public_transit_es.json`**: Pre-indexed fare structures for public transit systems across major Spanish metropolitan areas (Madrid, Barcelona, Valencia, Seville, etc.).
- **`shareUrl.ts`**: URL state encoder and decoder allowing users to create and share custom commute scenarios via query parameters without any server-side database.

### 2. Utilities & Math Domain Layer (`src/utils/`)
Pure domain models, mathematical formulas, and coordinate transformations:
- **`costMath.ts`**: Pure functions for commuting economics:
  - Base fuel cost per trip based on distance, consumption rate ($l/100km$ or $kWh/100km$), and fuel price.
  - Granular trip modes: **One-Way** (`ida`), **Round-Trip** (`idavuelta`), and **Recurrent Commute** (monthly working days and active annual months).
  - Total Cost of Ownership (TCO) wear & maintenance surcharge ($0.08€$/km for tires, service, depreciation, and insurance).
- **`mercator.ts`**: Web Mercator (EPSG:3857) projection math that converts geographic coordinates (latitude/longitude) into normalized SVG coordinate space for custom vector mapping and tile bounding.
- **`theme.ts`**: Theme manager supporting system preferences (`prefers-color-scheme`) and manual dark/light toggle persisted in `localStorage`.

### 3. Presentation & UI Layer (`src/components/`)
Modular, single-responsibility Vue 3 components with Composition API:
- **`App.vue`**: Root orchestrator managing reactive application state, responsive layout switching, route calculations, and share actions.
- **`AppHeader.vue`**: Top navigation containing branding, "Share Magic Link" action, settings toggle, and language selector.
- **`RouteForm.vue`**: Origin and destination input fields with predictive debounced geocoding dropdowns.
- **`VehicleConfig.vue`**: Vehicle and fuel parameter controls (fuel type, consumption, MITECO live price vs. manual override, trip mode, and wear surcharge).
- **`NativeMap.vue`**: High-performance SVG-based map component (~4KB) with interactive marker placement, polyline rendering, and bidirectional coordinate updates (`@update:origin`, `@update:destination`).
- **`PersonalizationCard.vue`**: Detailed breakdown of working days per week and active commute months per year.
- **`SettingsView.vue`**: Modal view for user preferences and default commute profiles.
- **`SourcesModal.vue`**: Transparency modal providing methodology breakdowns and official source citations.
- **`LangSelector.vue` / `FlagIcon.vue` / `CustomSelect.vue`**: Accessible, keyboard-navigable UI components built with the shared *Sober UI* design system.
- **`AppFooter.vue`**: Standardized footer displaying live app version, methodology link, source repository, and license terms.

### 4. Internationalization (`src/i18n/`)
- Complete multilingual support via `vue-i18n` with dictionaries for:
  - English (`en.json`)
  - Spanish (`es.json`)
  - French (`fr.json`)
  - German (`de.json`)
  - Italian (`it.json`)
  - Portuguese (`pt.json`)

### 5. Responsive Design & User Experience
- **Adaptive Layout:**
  - **Desktop (≥900px):** Two-column side-by-side view (Form & Settings on the left, Live Map & Cost Summary on the right).
  - **Mobile (<900px):** Single-column stacked view with an expandable/collapsible native map toggle button.
- **Web Share Integration:** Seamless native sharing via the Web Share API (`navigator.share`) with automatic fallback to clipboard copy.

### 6. Automated Testing (`src/utils/__tests__/`)
- Unit test suite powered by **Vitest** covering:
  - Cost calculations under single-trip, round-trip, and monthly/annual modes.
  - TCO wear-and-tear multipliers.
  - Mercator projection math and edge-case coordinate clamping.
