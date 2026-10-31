# Desplaza 🚗

*Leer esto en [Español](README-es.md).*

A fast, lightweight web app that calculates the real cost of commuting by car in Spain, using official daily fuel prices.

Costs are calculated in your browser, with no account, no cookies and no analytics. Built with **Vue 3 (Composition API)** and **TypeScript**.

## ✨ Key Features
- **Live Fuel Prices (MITECO):** Uses the daily average price in the origin's province, from the official open data of Spain's Ministry for the Ecological Transition. You can enter your own price instead.
- **Routing & Distance:**
  - Address search with autocompletion via **Photon (OpenStreetMap)**.
  - Road distance and route geometry via **OSRM (Open Source Routing Machine)**.
  - Origin and destination markers can be dragged on the map to fine-tune the route.
- **Real Commute Cost:** Cost per trip, per month and per year for one-way, round-trip or recurring commutes, with an optional wear-and-tear surcharge (€0.08/km) for maintenance, tyres, insurance and depreciation.
- **Interactive Map:** **Leaflet** with Esri light and dark grey basemaps that follow the app theme.
- **Shareable Links:** The route and vehicle settings are encoded in the URL and shared with the Web Share API or copied to the clipboard. No server stores them.
- **Privacy:** Costs are calculated in your browser. No cookies, no analytics, no sign-up and no database. Address search, routing and map tiles are requested from third-party services (Photon, OSRM and Esri), and fuel prices from MITECO.
- **Multi-language Support:** Full UI internationalization for English, Spanish, French, German, Italian, and Portuguese.
- **Adaptive Design:** Sober, responsive UI with light, dark and system themes.

## 🛠️ Built With
- **Vue.js 3** (Composition API) + **Vite**
- **TypeScript** in strict mode.
- **Vue-i18n** for multi-language support.
- **Leaflet** for the map.
- **Vanilla CSS** with custom design tokens, without UI frameworks.
- **Vitest**, **ESLint** and **Prettier**, run in CI before every deploy.

## 📁 Project Architecture
The project follows a clean, modular architecture separating external API services, pure mathematical domain logic, and presentation components. Detailed documentation is available in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 🚀 How to Run Locally

1. Clone the repository:
   ```sh
   git clone https://github.com/jnfire/desplaza.git
   cd desplaza
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

4. Run the checks (the same ones CI runs):
   ```sh
   npm run lint
   npm run format:check
   npm test
   ```

5. Type-check and build for production:
   ```sh
   npm run build
   ```

## 📄 License
Copyright (C) 2026 Javier Nicolás Pérez Mesa.

This project is free software released under the [GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`). You may use, study, modify and share it. If you distribute a modified version, or offer it to users over a network, you must make its source code available under the same license.

---
Made with :heart: 2026.
