# Project Architecture

*Read this in [Spanish](ARCHITECTURE-es.md).*

**Desplaza** is architected around the principles of simplicity, zero backend footprint (100% Client-Side), strict domain logic decoupling, and high performance.

## Directory Structure

### 1. Services Layer (`src/services/`)
Handles communication with external open APIs and data sources:
- **`miteco.ts`**: Client for the Spanish Ministry for Ecological Transition (MITECO) public open data API. Retrieves the list of Spanish provinces and computes average daily fuel prices for gasoline, diesel, and alternative fuels.
- **`routing.ts`**: Geocoding and routing provider integration:
  - Connects to **Photon** (OpenStreetMap) for address searching and bounding coordinates.
  - Connects to **OSRM (Open Source Routing Machine)** for driving route calculation, returning distance (km), estimated duration, and vector polyline coordinates.
- **`transitCalculator.ts` / `public_transit_es.json`**: Pre-indexed regional public transport fare definitions across Spain (Madrid, Barcelona, Valencia, Seville, etc.) used to provide instant commuter cost comparisons.
- **`shareUrl.ts`**: State encoder/decoder to allow users to share configured commutes via URL search parameters without storing any state remotely.

### 2. Utilities & Math Domain Layer (`src/utils/`)
Pure, framework-agnostic business logic and algorithmic computations:
- **`costMath.ts`**: Pure functions for commuter economics:
  - Cost per trip based on distance, fuel consumption ($l/100km$ or $kWh/100km$), and current price per unit.
  - Daily round-trip, monthly (working days), and annual commuting projections.
  - Total Cost of Ownership (TCO) wear-and-tear calculations ($0.08€$/km for tires, service, insurance, and depreciation).
- **`mercator.ts`**: Mathematical projection algorithms (Spherical / Web Mercator EPSG:3857) enabling custom SVG vector mapping, viewport bounding boxes, and tile alignment without heavy third-party map dependencies.
- **`theme.ts`**: Helper module for system dark/light theme detection and localStorage theme persistence.

### 3. Presentation & UI Layer (`src/components/`)
Modular, single-responsibility Vue 3 components:
- **`App.vue`**: Root component coordinating application state, API calls, and layout transitions.
- **`AppHeader.vue`**: Top navigation bar featuring brand identity, language switcher, and settings modal trigger.
- **`RouteForm.vue`**: Origin and destination input fields with predictive debounced geocoding dropdowns.
- **`VehicleConfig.vue`**: Interactive controls for fuel type selection, consumption rates, MITECO automated pricing or custom manual price inputs, and TCO wear toggles.
- **`NativeMap.vue`**: Ultra-lightweight (~4KB) SVG-based interactive map renderer supporting route polyline display and origin/destination markers.
- **`PersonalizationCard.vue`**: Commute frequency configuration and detailed cost breakdown summary.
- **`SourcesModal.vue`**: Transparent data audit modal citing all official sources (MITECO, OpenStreetMap, OSRM).
- **`SettingsView.vue`**: Application settings dialog.
- **`LangSelector.vue` / `FlagIcon.vue` / `CustomSelect.vue`**: Accessible, keyboard-navigable UI primitives adhering to the shared Sober UI design system.
- **`AppFooter.vue`**: Footer displaying version number, license terms, and privacy notice.

### 4. Internationalization (`src/i18n/`)
- Multilingual dictionaries (`en.json`, `es.json`, `fr.json`, `de.json`, `it.json`, `pt.json`) powered by `vue-i18n`.
- Complete localization across all input labels, tooltips, units, and data source disclaimers.

### 5. Privacy & Data Guarantees
- **Local-First Processing**: 100% of user inputs, selected routes, and calculation results remain in memory inside the client's browser.
- **Zero Tracking**: No analytical beacons, tracking pixels, or identifying cookies.
- **Open Public APIs**: All API requests (MITECO, Photon, OSRM) query public, free-access endpoints without API keys or user identification.

### 6. Automated Testing (`src/utils/__tests__/`)
- Unit tests written with **Vitest** validating the exactness of fuel calculations, wear multipliers, rounding formulas, and Mercator coordinate transformations.
