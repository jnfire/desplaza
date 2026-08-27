# Desplaza 🚗

*Read this in [English](README.md).*

Una aplicación web rápida, ultra-ligera y local-first diseñada para calcular y comparar el coste real de los desplazamientos diarios en vehículo privado frente al transporte público en España.

Todo el procesamiento y los cálculos se realizan localmente en tu navegador web, garantizando un **control total y privacidad** de tus datos (Local-First). Construida con **Vue 3 (Composition API)** y **TypeScript**.

## ✨ Características Principales
- **Precios de Combustible en Tiempo Real (API MITECO):** Obtiene los precios medios diarios oficiales por provincia directamente del Ministerio para la Transición Ecológica y el Reto Demográfico de España.
- **Enrutamiento y Distancias Precisas:**
  - Geocodificación rápida y autocompletado de direcciones mediante **Photon (OpenStreetMap)**.
  - Cálculo de distancias, tiempos y polilíneas vectoriales a través del motor **OSRM (Open Source Routing Machine)**.
- **Coste Real de Desgaste (TCO):** Permite añadir un factor de desgaste y mantenimiento ($0,08€$/km) que prorratea seguro, revisiones, neumáticos y amortización del vehículo.
- **Comparativa con Transporte Público:** Compara el gasto mensual del vehículo privado frente a las tarifas de abonos de transporte en las principales áreas metropolitanas de España.
- **Mapa Nativo Ultra-Ligero:** Motor cartográfico propio en SVG (~4KB) basado en proyección matemática *Web Mercator*, sin librerías pesadas de terceros.
- **Privacidad Local-First:** Sin registro de usuarios, sin bases de datos remotas y sin cookies de rastreo.
- **Soporte Multi-Idioma:** Interfaz completamente traducida a Español, Inglés, Francés, Alemán, Italiano y Portugués.
- **Diseño Adaptativo:** Interfaz sobria y responsiva con soporte nativo para temas claro y oscuro.

## 🛠️ Tecnologías Utilizadas
- **Vue.js 3** (Composition API) + **Vite**
- **TypeScript** para un código robusto y estrictamente tipado.
- **Vue-i18n** para el soporte multi-idioma.
- **Vanilla CSS** con sistema de diseño propio basado en variables CSS, sin frameworks externos.
- **Vitest** para pruebas unitarias.

## 📁 Estructura del Proyecto
El proyecto sigue una arquitectura modular y limpia que separa los clientes de servicios externos, las matemáticas puras de dominio y los componentes visuales. Puedes ver los detalles en [`docs/ARCHITECTURE-es.md`](docs/ARCHITECTURE-es.md).

## 🚀 Cómo ejecutarlo localmente

1. Clona el repositorio:
   ```sh
   git clone https://github.com/jnfire/desplaza.git
   cd desplaza
   ```

2. Instala las dependencias:
   ```sh
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```

4. Ejecuta las pruebas:
   ```sh
   npm test
   ```

5. Compila para producción:
   ```sh
   npm run build
   ```

## 📄 Licencia
Este proyecto es propietario y tiene todos los derechos reservados por Javier Nicolás Pérez Mesa. Se publica exclusivamente con fines de revisión de portafolio, auditoría de código y uso estrictamente personal. Consulta [`LICENSE.md`](LICENSE.md) para más detalles.

---
Hecho con :heart: 2026.
