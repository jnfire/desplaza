# Arquitectura del Proyecto

*Leer esto en [Inglés](ARCHITECTURE.md).*

**Desplaza** es una aplicación de una sola página, estática y sin backend propio. Los cálculos de costes se hacen en el navegador; la búsqueda de direcciones, las rutas, los mapas y los precios del combustible vienen de servicios públicos de terceros.

## Principios Fundamentales
- **Sin backend ni cuentas:** No se guarda nada en un servidor. Las preferencias viven en `localStorage` y un escenario compartido viaja en la URL.
- **Lógica de dominio pura:** Las matemáticas de costes son TypeScript sin dependencias de Vue, en `src/utils/`, y tienen tests unitarios.
- **Clientes de servicios mínimos:** Cada API externa tiene un único módulo en `src/services/` que devuelve datos tipados y, si falla, un resultado vacío, para que la interfaz siga funcionando sin red.

## Servicios de Terceros

| Servicio | Para qué se usa | Qué recibe |
| --- | --- | --- |
| [Photon](https://photon.komoot.io) (datos de OpenStreetMap) | Búsqueda y autocompletado de direcciones | El texto escrito en los campos de origen y destino |
| Servidor público de demostración de [OSRM](https://project-osrm.org) | Distancia por carretera y trazado de la ruta | Las coordenadas de origen y destino |
| [Esri](https://www.esri.com) World Light/Dark Gray Base | Teselas del mapa | La zona del mapa que se está viendo |
| API REST de precios de carburantes del [MITECO](https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/) | Precios diarios del combustible por provincia | El identificador de la provincia |

---

## Estructura del Directorio y Capas

### 1. Capa de Servicios (`src/services/`)
- **`miteco.ts`**: Cliente de la API REST de precios de carburantes del MITECO. Lista las provincias y calcula la media aritmética del día entre las estaciones de servicio de una provincia para el combustible elegido (gasolina 95 y 98, diésel, diésel premium y GLP), redondeada a tres decimales.
- **`routing.ts`**:
  - `geocodeAddress()` consulta **Photon**, priorizando resultados en España, y construye una etiqueta legible con calle, número, ciudad y región.
  - `getRouteData()` pide a **OSRM** una ruta en coche y devuelve la distancia en kilómetros y las coordenadas del trazado.
- **`shareUrl.ts`**: Codifica el origen, el destino y la configuración del vehículo en parámetros de la URL y los decodifica, limitando días y meses a rangos válidos y usando valores por defecto cuando un valor no es reconocido.

### 2. Capa de Dominio (`src/utils/`)
- **`costMath.ts`**: `calculateCarCosts()` devuelve el coste por viaje, al mes y al año a partir de la distancia, el consumo, el precio del combustible, los días por semana y los meses activos, para trayectos de solo ida (`ida`), ida y vuelta (`idavuelta`) o recurrentes (`ciclo`). Un recargo opcional por kilómetro (0,08 €/km en la interfaz) cubre desgaste, mantenimiento, seguro y depreciación.
- **`theme.ts`**: Tema claro, oscuro o del sistema, guardado en `localStorage`.

### 3. Capa de Presentación (`src/components/`)
- **`App.vue`**: Guarda el estado de la app. Restaura un escenario compartido desde la URL, asocia el origen a una provincia del MITECO (Madrid si no encuentra ninguna), carga precios y rutas, calcula los costes y alterna entre la vista de escritorio y la de móvil.
- **`AppHeader.vue`**: Marca, botón de compartir y acceso a la configuración.
- **`VehicleConfig.vue`**: Tipo de trayecto, días por semana, meses activos, origen del precio (automático o manual), tipo de combustible, consumo y recargo por desgaste. Incluye `RouteForm`.
- **`RouteForm.vue`**: Campos de origen y destino con sugerencias de Photon con retardo (debounce).
- **`NativeMap.vue`**: Mapa de Leaflet con marcadores de origen y destino arrastrables, la línea de la ruta y teselas de Esri que siguen el tema.
- **`SettingsView.vue` / `PersonalizationCard.vue`**: Pantalla de configuración con idioma y tema.
- **`SourcesModal.vue`**: Metodología y fuentes de datos.
- **`LangSelector.vue` / `CustomSelect.vue` / `FlagIcon.vue` / `SettingsIcon.vue`**: Controles accesibles por teclado con el mismo estilo que el resto de herramientas del portafolio.
- **`AppFooter.vue`**: Versión (enlazada a su release), metodología, código fuente y licencia.

### 4. Internacionalización (`src/i18n/`)
- `vue-i18n` en modo composición con diccionarios en inglés, español, francés, alemán, italiano y portugués. El idioma se detecta del navegador o de la preferencia guardada, y `<html lang>` lo sigue.

### 5. Diseño Adaptativo
- **Escritorio (≥900px):** Dos columnas: el formulario a la izquierda y el mapa con los resultados a la derecha.
- **Móvil (<900px):** Una columna con el mapa plegable.

### 6. Comprobaciones de Calidad
- Los tests de **Vitest** en `src/**/__tests__/` cubren las matemáticas de costes, los tres clientes de servicios (con `fetch` simulado, sin llamar a las APIs reales), el viaje de ida y vuelta de la URL compartida y la paridad de los seis diccionarios.
- **ESLint**, **Prettier** y **vue-tsc** se ejecutan en el CI junto con los tests y el build de producción; el despliegue a GitHub Pages solo se lanza si todo pasa.
