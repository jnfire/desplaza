# Desplaza 🚗

*Leer esto en [Español](README-es.md).*

A fast, lightweight web app that compares the real cost and time of your commute in Spain: several cars, a motorbike, an electric car or public transport, on the same trip, using official daily fuel prices.

Costs are calculated in your browser, with no account, no cookies and no analytics. Built with **Vue 3 (Composition API)** and **TypeScript**.

**▶ [Try it: desplaza.jnfire.dev/](https://desplaza.jnfire.dev/)**

![Desplaza on desktop and mobile](docs/screenshots/desplaza-hero.png)

## ✨ Key Features
- **Compare Options:** Add up to five ways of making the same trip, each with its own name (for example two cars you are choosing between), and rank them by cost, time or a balance of both with your hour valued in €/h. The best option is highlighted with what the others cost more per year.
- **Option Types:** Combustion car or motorbike (MITECO or manual fuel price), electric car (home and public charging prices and their share) and public transport (monthly pass or single tickets, door-to-door time). Tolls, parking and wear can be added to any vehicle.
- **Live Fuel Prices (MITECO):** Uses the daily average price in the origin's province, from the official open data of Spain's Ministry for the Ecological Transition. You can enter your own price instead.
- **Routing & Distance:**
  - Address search with autocompletion via **Photon (OpenStreetMap)**.
  - Road distance, driving time and route geometry via **OSRM (Open Source Routing Machine)**.
  - Origin and destination markers can be dragged on the map to fine-tune the route.
- **Real Commute Cost:** Cost per trip, per month and per year for one-way, round-trip or recurring commutes, with an optional wear-and-tear surcharge (€0.08/km) for maintenance, tyres, insurance and depreciation.
- **Interactive Map:** **Leaflet** with Esri light and dark grey basemaps that follow the app theme.
- **Saved and Shareable:** Your comparison is kept on your device between visits, and the whole comparison can be shared as a link with the Web Share API or the clipboard. No server stores it.
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

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Design system](docs/DESIGN-SYSTEM.md), shared with the other portfolio tools
- [Roadmap](docs/ROADMAP.md)
- [Evolution](docs/evolution/README.md): how the project has changed, with screenshots

## 🤝 Development

Designed and directed by [Javier Nicolás Pérez Mesa](https://github.com/jnfire): the product, the architecture and the design decisions are his. Much of the implementation was written with AI assistance ([Claude Code](https://claude.com/claude-code)), working under his direction and through pull requests he reviews; the commits made that way carry a `Co-Authored-By` trailer.

## 📄 License
Copyright (C) 2026 Javier Nicolás Pérez Mesa.

This project is free software released under the [GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`). You may use, study, modify and share it. If you distribute a modified version, or offer it to users over a network, you must make its source code available under the same license.

---
Made by [Javier Nicolás Pérez Mesa](https://github.com/jnfire), 2026.
