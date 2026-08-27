# Desplaza 🚗

*Leer esto en [Español](README-es.md).*

A fast, lightweight, and local-first web application designed to calculate and compare the real cost of commuting by private vehicle versus public transit in Spain.

All processing and calculations are performed locally in your web browser, ensuring **complete privacy and control** of your data (Local-First). Built with **Vue 3 (Composition API)** and **TypeScript**.

## ✨ Key Features
- **Live Fuel Prices (MITECO API):** Fetches official daily average fuel prices across all Spanish provinces directly from the Ministry for Ecological Transition.
- **Accurate Routing & Distance:**
  - Fast geocoding and address auto-completion via **Photon (OpenStreetMap)**.
  - Distance, duration, and vector polyline calculations via **OSRM (Open Source Routing Machine)**.
- **Real Commute Cost (TCO):** Includes an optional vehicle wear-and-tear factor ($0.08€$/km) covering maintenance, tires, insurance, and depreciation.
- **Public Transit Comparison:** Compares monthly private vehicle expenses against public transport passes across major Spanish metropolitan areas.
- **Ultra-Lightweight Native Map:** Custom lightweight SVG map (~4KB) using *Web Mercator* mathematical projections without heavy third-party mapping dependencies.
- **Local-First Privacy:** Zero tracking, no user registration, and no external database storage.
- **Multi-language Support:** Full UI internationalization for English, Spanish, French, German, Italian, and Portuguese.
- **Adaptive Design:** Sober, responsive UI with automatic dark/light theme switching.

## 🛠️ Built With
- **Vue.js 3** (Composition API) + **Vite**
- **TypeScript** for robust, strictly-typed code.
- **Vue-i18n** for seamless multi-language support.
- **Vanilla CSS** with custom design tokens for optimal performance without external UI frameworks.
- **Vitest** for unit test verification.

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

4. Run tests:
   ```sh
   npm test
   ```

5. Build for production:
   ```sh
   npm run build
   ```

## 📄 License
This project is proprietary and all rights are reserved by Javier Nicolás Pérez Mesa. It is published exclusively for portfolio review, code audit, and personal use. See the `LICENSE` file for details.

---
Made with :heart: 2026.
