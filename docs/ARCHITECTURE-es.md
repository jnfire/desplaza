# Arquitectura del Proyecto

*Leer esto en [Inglés](ARCHITECTURE.md).*

**Desplaza** está diseñado bajo los principios de simplicidad, ausencia total de backend (100% Client-Side), desacoplamiento estricto de la lógica de dominio y máximo rendimiento.

## Principios Arquitectónicos Fundamentales
- **Ejecución 100% en Cliente:** Todos los cálculos, peticiones de rutas y transformaciones de estado ocurren íntegramente en el navegador del usuario.
- **Núcleo Agnóstico del Framework:** Las matemáticas financieras y geográficas residen en módulos puros de TypeScript, independientes de la reactividad de Vue.
- **Rendimiento y Peso Mínimo:** El motor cartográfico SVG propio elimina dependencias pesadas como Leaflet o Mapbox del bundle crítico.

---

## Estructura del Directorio y Capas

### 1. Capa de Servicios (`src/services/`)
Gestiona la integración con APIs públicas abiertas y la serialización de datos:
- **`miteco.ts`**: Cliente para la API REST oficial de Datos Abiertos del Ministerio para la Transición Ecológica (MITECO). Consulta las estaciones de servicio provinciales y calcula la media aritmética diaria de precios para gasolina (95/98), diésel, GLP y electricidad.
- **`routing.ts`**: Geocodificación y cálculo de trayectos:
  - **Photon (OpenStreetMap)**: Búsqueda predictiva de direcciones con debounce y geocodificación inversa.
  - **OSRM (Open Source Routing Machine)**: Cálculo de distancias por carretera, duración estimada y decodificación de polilíneas vectoriales.
- **`transitCalculator.ts` / `public_transit_es.json`**: Tarifario indexado de transporte público en las principales áreas metropolitanas de España (Madrid, Barcelona, Valencia, Sevilla, etc.) para comparativas de coste.
- **`shareUrl.ts`**: Codificador y decodificador de estado en la URL que permite compartir escenarios de desplazamiento mediante parámetros sin necesidad de base de datos en servidor.

### 2. Capa de Utilidades y Dominio Matemático (`src/utils/`)
Modelos de dominio puros, fórmulas económicas y proyecciones de coordenadas:
- **`costMath.ts`**: Funciones puras para la economía del transporte:
  - Coste base de combustible por trayecto según distancia, consumo ($l/100km$ o $kWh/100km$) y precio por unidad.
  - Modos de trayecto granulares: **Solo Ida** (`ida`), **Ida y Vuelta** (`idavuelta`) y **Desplazamiento Recurrente** (cálculo mensual por días laborables y anual por meses activos).
  - Recargo de Coste Total de Propiedad (TCO) por desgaste ($0,08€$/km en concepto de neumáticos, mantenimiento, amortización y seguro).
- **`mercator.ts`**: Algoritmos de proyección Web Mercator (EPSG:3857) que transforman coordenadas geográficas (latitud/longitud) en el espacio normalizado de coordenadas SVG para mapas vectoriales ligeros.
- **`theme.ts`**: Gestor de temas con detección de preferencias del sistema (`prefers-color-scheme`) y conmutación manual claro/oscuro guardada en `localStorage`.

### 3. Capa de Presentación e Interfaz (`src/components/`)
Componentes modulares de Vue 3 con Composition API y responsabilidad única:
- **`App.vue`**: Orquestador principal que gestiona el estado reactivo, la distribución responsiva, el cálculo de rutas y la acción de compartir.
- **`AppHeader.vue`**: Barra superior de navegación con identidad de marca, acción de "Compartir Enlace Mágico", botón de ajustes y selector de idioma.
- **`RouteForm.vue`**: Formulario de origen y destino con autocompletado predictivo y debounce.
- **`VehicleConfig.vue`**: Panel de control del vehículo (tipo de combustible, consumo medio, precio oficial MITECO vs. manual, modo de viaje y recargo por desgaste).
- **`NativeMap.vue`**: Componente de mapa vectorial SVG ultra-ligero (~4KB) con marcadores interactivos, polilínea de ruta y emisión bidireccional de coordenadas (`@update:origin`, `@update:destination`).
- **`PersonalizationCard.vue`**: Desglose configurable de días laborables por semana y meses activos de trabajo al año.
- **`SettingsView.vue`**: Vista modal de configuración y personalización del perfil de desplazamiento.
- **`SourcesModal.vue`**: Modal de transparencia con detalle de metodología y citación de fuentes oficiales.
- **`LangSelector.vue` / `FlagIcon.vue` / `CustomSelect.vue`**: Primitivas de UI accesibles y navegables por teclado siguiendo el sistema de diseño *Sober UI*.
- **`AppFooter.vue`**: Pie de página estandarizado con versión en vivo, enlace a metodología, repositorio de código y licencia.

### 4. Internacionalización (`src/i18n/`)
- Soporte multi-idioma completo mediante `vue-i18n` con diccionarios para:
  - Español (`es.json`)
  - Inglés (`en.json`)
  - Francés (`fr.json`)
  - Alemán (`de.json`)
  - Italiano (`it.json`)
  - Portugués (`pt.json`)

### 5. Diseño Responsivo y Experiencia de Usuario
- **Diseño Adaptativo:**
  - **Escritorio (≥900px):** Disposición en dos columnas en paralelo (Formulario y Parámetros a la izquierda, Mapa en vivo y Tarjeta de Coste a la derecha).
  - **Móvil (<900px):** Disposición en columna única con botón colapsable/expandible para el mapa nativo.
- **Compartir Nativo:** Integración con la Web Share API (`navigator.share`) con respaldo automático mediante copia al portapapeles.

### 6. Pruebas Automatizadas (`src/utils/__tests__/`)
- Suite de pruebas unitarias con **Vitest** cubriendo:
  - Fórmulas de cálculo de coste en modos ida, ida y vuelta y recurrente mensual/anual.
  - Multiplicadores de desgaste TCO.
  - Transformaciones matemáticas de proyección Mercator y acotado de coordenadas límite.
