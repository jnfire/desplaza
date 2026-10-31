# Arquitectura del Proyecto

*Leer esto en [Inglés](ARCHITECTURE.md).*

**Desplaza** es una aplicación de una sola página, estática y sin backend propio. Los cálculos de costes se hacen en el navegador; la búsqueda de direcciones, las rutas, los mapas y los precios del combustible vienen de servicios públicos de terceros.

## Principios Fundamentales
- **Sin backend ni cuentas:** No se guarda nada en un servidor. Las preferencias y la comparativa actual viven en `localStorage`, y una comparativa compartida viaja en la URL.
- **Lógica de dominio pura:** El trayecto, las opciones de viaje y su comparación son TypeScript sin dependencias de Vue, en `src/core/`, y tienen tests unitarios.
- **Clientes de servicios mínimos:** Cada API externa tiene un único módulo en `src/services/` que devuelve datos tipados y, si falla, un resultado vacío, para que la interfaz siga funcionando sin red.

## Servicios de Terceros

| Servicio | Para qué se usa | Qué recibe |
| --- | --- | --- |
| [Photon](https://photon.komoot.io) (datos de OpenStreetMap) | Búsqueda y autocompletado de direcciones | El texto escrito en los campos de origen y destino |
| Servidor público de demostración de [OSRM](https://project-osrm.org) | Distancia por carretera, tiempo de conducción y trazado de la ruta | Las coordenadas de origen y destino |
| [Esri](https://www.esri.com) World Light/Dark Gray Base | Teselas del mapa | La zona del mapa que se está viendo |
| API REST de precios de carburantes del [MITECO](https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/) | Precios diarios del combustible por provincia | El identificador de la provincia |

Los precios de la electricidad y las tarifas y tiempos del transporte público no tienen una fuente oficial que la app pueda consultar: los introduce el usuario, partiendo de valores de referencia editables.

---

## Estructura del Directorio y Capas

### 1. Capa de Dominio (`src/core/`)
- **`travelOptions.ts`**: Los datos comunes del trayecto (tipo, días por semana, meses activos) y cuatro tipos de opción de viaje, cada una con un nombre elegido por el usuario: coche de combustión, moto, coche eléctrico y transporte público. Crea opciones con valores por defecto razonables, las duplica, cambia su tipo conservando los campos compartidos, asigna nombres únicos y valida los datos leídos del almacenamiento o de un enlace compartido.
- **`comparison.ts`**: Para cada opción sobre el mismo trayecto, el coste por viaje, al mes y al año, y los minutos por viaje. Los coches de combustión usan el precio del MITECO o uno manual; los eléctricos mezclan el precio de la recarga en casa y en puntos públicos; el transporte público es un abono mensual o billetes sueltos; los vehículos pueden sumar desgaste (0,08 €/km por defecto), peajes por trayecto y aparcamiento por día. Ordena las opciones por coste, tiempo o equilibrio (coste más el tiempo valorado a un €/h editable); los resultados sin precio o sin tiempo van al final.
- **`persistence.ts`**: Guarda el trayecto y las opciones en `localStorage` y los recupera, descartando datos corruptos o no válidos.

### 2. Capa de Servicios (`src/services/`)
- **`miteco.ts`**: Cliente de la API REST de precios de carburantes del MITECO. Lista las provincias y calcula, con una sola petición, la media aritmética del día de todos los combustibles (gasolina 95 y 98, diésel, diésel premium y GLP) entre las estaciones de servicio de una provincia, redondeada a tres decimales.
- **`routing.ts`**:
  - `geocodeAddress()` consulta **Photon**, priorizando resultados en España, y construye una etiqueta legible con calle, número, ciudad y región.
  - `getRouteData()` pide a **OSRM** una ruta en coche y devuelve la distancia en kilómetros, el tiempo de conducción en minutos y las coordenadas del trazado.
- **`shareUrl.ts`**: Codifica en la URL el origen, el destino, el trayecto y todas las opciones (estas como JSON en base64url) y los decodifica. Los enlaces de la primera versión, con un solo vehículo, siguen abriéndose como una única opción de combustión.

### 3. Utilidades (`src/utils/`)
- **`format.ts`**: Números y duraciones según el idioma.
- **`theme.ts`**: Tema claro, oscuro o del sistema, guardado en `localStorage`.

### 4. Capa de Presentación (`src/components/`)
- **`App.vue`**: Guarda el estado de la app. Restaura una comparativa compartida desde la URL o la guardada, asocia el origen a una provincia del MITECO (Madrid si no encuentra ninguna), carga precios y rutas, calcula el resultado de cada opción, abre el editor de opciones y alterna entre la vista de escritorio y la de móvil.
- **`AppHeader.vue`**: Marca, botón de compartir y acceso a la configuración.
- **`TripCard.vue`**: Lo que comparten todas las opciones: `RouteForm`, tipo de trayecto, días por semana y meses activos.
- **`OptionsPanel.vue`**: Con una opción, el resumen grande de costes; a partir de dos, la comparativa ordenada con el selector de orden, la mejor opción destacada, el sobrecoste de las demás y editar, duplicar y eliminar en cada fila.
- **`OptionEditorModal.vue`**: Diálogo para crear o editar una opción: nombre, tipo y solo los campos de ese tipo, validación y vista previa en vivo del coste y el tiempo.
- **`BaseModal.vue`**: Base de diálogo accesible (foco atrapado, Escape, devolución del foco, bloqueo del scroll, pantalla completa en móvil) que usan el editor y la ventana de fuentes.
- **`RouteForm.vue`**: Campos de origen y destino con sugerencias de Photon con retardo (debounce).
- **`NativeMap.vue`**: Mapa de Leaflet con marcadores de origen y destino arrastrables, la línea de la ruta y teselas de Esri que siguen el tema.
- **`SettingsView.vue` / `PersonalizationCard.vue`**: Pantalla de configuración con idioma y tema.
- **`SourcesModal.vue`**: Metodología y fuentes de datos.
- **`LangSelector.vue` / `CustomSelect.vue` / `FlagIcon.vue` / `SettingsIcon.vue`**: Controles accesibles por teclado con el mismo estilo que el resto de herramientas del portafolio.
- **`AppFooter.vue`**: Versión (enlazada a su release), metodología, código fuente y licencia.

### 5. Internacionalización (`src/i18n/`)
- `vue-i18n` en modo composición con diccionarios en inglés, español, francés, alemán, italiano y portugués. El idioma se detecta del navegador o de la preferencia guardada, y `<html lang>` lo sigue.

### 6. Diseño Adaptativo
- **Escritorio (≥900px):** Dos columnas: el trayecto a la izquierda; el mapa y las opciones a la derecha.
- **Móvil (<900px):** Una columna con el mapa plegable.

### 7. Comprobaciones de Calidad
- Los tests de **Vitest** en `src/**/__tests__/` cubren las opciones de viaje y su comparación, el guardado local, los tres clientes de servicios (con `fetch` simulado, sin llamar a las APIs reales), los enlaces compartidos en sus dos versiones y la paridad de los seis diccionarios.
- **ESLint**, **Prettier** y **vue-tsc** se ejecutan en el CI junto con los tests y el build de producción; el despliegue a GitHub Pages solo se lanza si todo pasa.
