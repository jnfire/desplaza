# Arquitectura del Proyecto

*Leer esto en [Inglés](ARCHITECTURE.md).*

**Desplaza** está diseñado bajo los principios de simplicidad, ausencia total de backend (100% Client-Side), desacoplamiento estricto de la lógica de dominio y máximo rendimiento.

## Estructura del Directorio

### 1. Capa de Servicios (`src/services/`)
Gestiona la comunicación con APIs públicas abiertas y fuentes de datos:
- **`miteco.ts`**: Cliente para la API de datos abiertos del Ministerio para la Transición Ecológica (MITECO). Obtiene el listado de provincias y calcula los precios medios diarios de gasolina, diésel y combustibles alternativos.
- **`routing.ts`**: Integración con proveedores de geocodificación y cálculo de rutas:
  - Conexión con **Photon** (OpenStreetMap) para búsqueda predictiva de direcciones y coordenadas geográficas.
  - Conexión con **OSRM (Open Source Routing Machine)** para el cálculo del trayecto en coche, devolviendo distancia (km), duración estimada y coordenadas de polilínea vectorial.
- **`transitCalculator.ts` / `public_transit_es.json`**: Tarifario indexado de transporte público en las principales áreas metropolitanas de España (Madrid, Barcelona, Valencia, Sevilla, etc.) para ofrecer comparativas inmediatas.
- **`shareUrl.ts`**: Serializador/deserializador de estado mediante parámetros de URL para compartir rutas y configuraciones sin almacenamiento remoto.

### 2. Capa de Utilidades y Dominio Matemático (`src/utils/`)
Lógica de negocio pura, agnóstica de frameworks y totalmente comprobable:
- **`costMath.ts`**: Funciones matemáticas puras para la economía del desplazamiento:
  - Coste por trayecto según distancia, consumo ($l/100km$ o $kWh/100km$) y precio por unidad de combustible.
  - Proyecciones de trayecto diario de ida y vuelta, mensual (días laborables) y anual.
  - Cálculo del Coste Total de Propiedad (TCO) por desgaste ($0,08€$/km en concepto de neumáticos, mantenimiento, seguro y amortización).
- **`mercator.ts`**: Algoritmos matemáticos de proyección (Spherical / Web Mercator EPSG:3857) que permiten renderizar mapas interactivos vectoriales en SVG y alinear *tiles* sin librerías pesadas de terceros.
- **`theme.ts`**: Módulo para la detección automática del esquema de color del sistema y persistencia del tema claro/oscuro.

### 3. Capa de Presentación e Interfaz (`src/components/`)
Componentes modulares de Vue 3 con responsabilidad única:
- **`App.vue`**: Componente raíz orquestador del estado general, llamadas a servicios y transiciones de diseño.
- **`AppHeader.vue`**: Cabecera superior con logotipo, selector de idioma y botón de ajustes.
- **`RouteForm.vue`**: Formulario de origen y destino con autocompletado predictivo y debounce.
- **`VehicleConfig.vue`**: Panel de configuración del vehículo (tipo de combustible, consumo medio, precio oficial MITECO o manual, y conmutador de desgaste TCO).
- **`NativeMap.vue`**: Visor de mapas ligero en SVG (~4KB) que muestra la ruta vectorial calculada y los marcadores de origen y destino.
- **`PersonalizationCard.vue`**: Configuración de frecuencia de trayectos y tarjeta de resumen del desglose económico.
- **`SourcesModal.vue`**: Modal transparente de auditoría y citación de fuentes oficiales (MITECO, OpenStreetMap, OSRM).
- **`SettingsView.vue`**: Vista modal de configuración y ajustes.
- **`LangSelector.vue` / `FlagIcon.vue` / `CustomSelect.vue`**: Primitivas de UI accesibles, navegables por teclado y acordes al sistema de diseño Sober UI.
- **`AppFooter.vue`**: Pie de página con versión del aplicativo, enlaces a fuentes, licencia y nota de privacidad.

### 4. Internacionalización (`src/i18n/`)
- Diccionarios en formato JSON (`en.json`, `es.json`, `fr.json`, `de.json`, `it.json`, `pt.json`) gestionados con `vue-i18n`.
- Cobertura completa de traducciones para etiquetas, campos, descripciones y avisos de auditoría de datos.

### 5. Garantías de Privacidad y Seguridad
- **Procesamiento Local-First**: El 100% de los datos introducidos por el usuario, rutas calculadas y costes permanecen en la memoria local del navegador.
- **Cero Rastreo**: Sin balizas analíticas, píxeles de seguimiento ni cookies de terceros.
- **APIs Abiertas y Seguras**: Todas las consultas a MITECO, Photon y OSRM se realizan a endpoints públicos y gratuitos, sin requerir claves privadas ni credenciales del usuario.

### 6. Pruebas Automatizadas (`src/utils/__tests__/`)
- Pruebas unitarias desarrolladas con **Vitest** para garantizar la precisión de las fórmulas de coste, factores de desgaste y proyecciones de coordenadas Mercator.
