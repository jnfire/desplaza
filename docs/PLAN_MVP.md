# Especificación y Propuesta de Arquitectura: Desplaza (MVP - España)

## 1. Visión General del Producto

**Desplaza** (`desplaza.jnfire.dev`) es una aplicación web estática, ultra-ligera y de estética minimalista orientada al mercado español. Su objetivo es ayudar a los usuarios a calcular de forma precisa y transparente el coste real mensual y anual de sus desplazamientos habituales en vehículo privado y compararlo directamente con las alternativas de transporte público disponibles.

## 2. Principios de Diseño y Experiencia de Usuario (UX/UI)

### 2.1. Sistema de Diseño (Proto-Librería Propietaria)
*   **Estética Minimalista**: Interfaz coherente con la ecosfera de proyectos (time-tracker, base64-to-file), con alto contraste, tipografía limpia, bordes sutiles y micro-interacciones eficientes sin elementos superfluos.
*   **Mobile-First**: Diseño pensado para pantallas táctiles. El mapa se integra mediante vistas compactas colapsables o pestañas alternables para no obstaculizar el flujo del formulario.
*   **Mapa Minimalista en Escala de Grises**: Uso de Leaflet.js con capas vectoriales/raster monocolor (CartoDB Positron en modo claro / CartoDB Dark Matter en modo oscuro) para integrarse visualmente con el sistema de diseño propio.

### 2.2. "Magia con Transparencia" (Data Provenance)
*   **Automatización Máxima**: La app resuelve el cálculo con el mínimo de clics mediante geolocalización/enrutado automático y precios en tiempo real.
*   **Transparencia Activa**: Badge visible explicativo con la procedencia de cada dato (ej. "Gasolina 95: 1,59 €/L · Media provincial (MITECO)").
*   **Override Total**: Todos los datos calculados de forma automática (precio del carburante, consumo estimado, billetes de transporte) pueden ser editados manualmente por el usuario.

## 3. Requerimientos del MVP

### 3.1. Funcionalidad Principal (User Flow)
*   **Definición de Ruta**:
    *   Selección de Origen y Destino mediante autocompletado rápido o entrada manual de distancia en kilómetros ($km$).
    *   Trazado de ruta visual y distancia calculada por carretera.
*   **Frecuencia del Trayecto**:
    *   Días a la semana (ej. 5 días/semana) o desplazamientos mensuales.
    *   Ajuste de periodos lectivos/vacacionales (ej. 11 meses laborables).
*   **Parámetros del Vehículo**:
    *   Tipo de combustible (Gasolina 95/98, Diésel A, Eléctrico, Híbrido, GLP).
    *   Carga automática del precio medio diario según provincia de origen (API MITECO).
    *   Consumo medio ($l/100\text{ km}$ o $kWh/100\text{ km}$).
    *   **Opcional (Costes Ocultos / Indirectos)**: Toggle para incluir mantenimiento, seguro proporcional y desgaste de neumáticos ($\approx 0,08\text{ €/km}$).
*   **Comparativa con Transporte Público (Ámbito España)**:
    *   Motor de reglas regional por distancia (abonos de transporte metropolitano, Cercanías o Media Distancia Renfe) con presets configurables.
    *   Opción de ajuste manual del coste de billete/abono.
*   **Panel de Resultados e Impacto**:
    *   Desglose visual sencillo: Coste mensual y anual (Coche vs. Transporte Público).
    *   Ahorro neto estimado a 1 y 5 años.
    *   Reducción estimada de emisiones de $CO_2$.
*   **Compartición Dinámica (URL Shareable)**:
    *   Codificación instantánea del estado de la simulación en la dirección web (URLSearchParams hash/query string), permitiendo copiar y enviar la URL para que cualquier persona vea el cálculo exacto de esa ruta con un solo clic sin necesidad de backend.

### 3.2. Requerimientos No Funcionales
*   **100% Anónimo**: Sin registro, sin backend. Persistencia local en `localStorage`.
*   **Despliegue Gratuito**: GitHub Pages (Bundle estático compilado con Vite) para el subdominio `desplaza.jnfire.dev`.
*   **Velocidad Extrema**: Tiempo de carga $< 1.0\text{ s}$, cero peso superfluo.
*   **Analítica Respetuosa**: Google Analytics 4 (GA4) configurado anónimamente sin rastrear datos personales.

## 4. Integración de APIs (España - Coste Cero & Bajo Mantenimiento)

| Categoría | Servicio Recomendado | Características & Integración | Fallback / Control |
| :--- | :--- | :--- | :--- |
| **Precios de Carburante** | API REST MITECO (Gobierno de España) | • 100% Gratuita, sin API Key ni registros.<br>• Actualización diaria de precios oficiales por provincia.<br>• Consulta automática al seleccionar el origen. | Posibilidad de editar libremente el precio por litro/kWh si el usuario usa una estación low-cost. |
| **Geocodificación & Rutas** | Photon (OSM) + OSRM | • Autocompletado rápido de direcciones en España (`countrycodes=es`).<br>• Cálculo instantáneo de distancia por carretera en $km$. | Introducción directa y manual del valor numérico de distancia en $km$. |
| **Transporte Público** | Fichero de Reglas `public_transit_es.json` | • Datos estáticos preconfigurados para principales áreas urbanas (Madrid, Barcelona, Valencia, etc.) y Cercanías Renfe.<br>• Cero coste de mantenimiento de APIs complejas. | Modificación manual del abono o precio del billete por parte del usuario. |

## 5. Estrategia de Desarrollo y Repositorio

*   **Nombre de Proyecto / Repositorio**: `desplaza`
*   **Decisión**: Repositorio Privado con Despliegue Público a GitHub Pages (`desplaza.jnfire.dev`).
*   **Motivación**:
    *   Permite iterar de forma fluida sobre la proto-librería de componentes propietaria sin necesidad de empaquetarla o documentarla para externos.
    *   El despliegue a GitHub Pages publica únicamente el bundle HTML/JS/CSS minificado por Vite.
    *   La fiabilidad y transparencia ante el usuario no depende de ver el código en GitHub, sino de la claridad de la interfaz.

## 6. Arquitectura Técnica y Estructura del Proyecto

```text
desplaza/
├── assets/
│   └── styles/              # Variables CSS y tokens de diseño base
├── components/              # Componentes UI de la Proto-Librería
│   ├── MapViewer.vue        # Leaflet con tiles CartoDB Positron/Dark
│   ├── RouteForm.vue        # Formulario de origen, destino y frecuencia
│   ├── VehicleConfig.vue    # Selector de combustible y consumo
│   ├── CostSummary.vue      # Cuadro comparativo de costes (Mes / Año)
│   ├── ShareButton.vue      # Generador de URL dinámicas compartibles
│   └── SourceBadge.vue      # Distintivo explicativo de fuente de datos (MITECO)
├── services/
│   ├── miteco.ts            # Servicio de consulta a la API MITECO
│   ├── routing.ts           # Servicio de geocodificación y ruta (OSRM/Photon)
│   ├── shareUrl.ts          # Serialización / Deserialización de URLSearchParams
│   └── transitCalculator.ts # Motor de estimación de abonos de transporte
└── utils/
    └── costMath.ts          # Fórmulas puras para cálculos de consumo y amortización
```

## 7. Fórmulas de Cálculo

**Coste del Coche ($C_{coche}$)**

El coste mensual ($C_{mes}$) considerando combustible y desgaste opcional se define como:

$$C_{mes} = \left( \frac{D \times 2 \times F_{semana} \times 4.33}{100} \right) \times C_{100km} \times P_{combustible} + (D \times 2 \times F_{semana} \times 4.33 \times D_{extra})$$

Donde:
*   $D$: Distancia de ida en km.
*   $F_{semana}$: Días laborables/semana de viaje.
*   $4.33$: Promedio de semanas por mes.
*   $C_{100km}$: Consumo medio ($l/100\text{ km}$ o $kWh/100\text{ km}$).
*   $P_{combustible}$: Precio medio por litro o kWh (provincial MITECO u optativo).
*   $D_{extra}$: Coste opcional de desgaste/mantenimiento por km ($\approx 0,08\text{ €/km}$).

El coste anual ajustado a los meses lectivos/laborables trabajados ($M_{trabajo}$):

$$C_{año} = C_{mes} \times M_{trabajo}$$

## 8. Roadmap de Desarrollo (v1 España)

### Fase 1: Configuración & Proto-Librería
*   Inicialización del repo `desplaza` con Vue 3 + Vite.
*   Integración de la proto-librería de componentes en el proyecto.
*   Implementación del módulo de cálculo (`costMath.ts`).

### Fase 2: Integración de APIs Gratuitas de España
*   Conexión con la API del MITECO para recuperar la media provincial de carburantes.
*   Integración de Leaflet con mapa minimalista (CartoDB Positron/Dark) y OSRM para distancias.

### Fase 3: Comparativa de Transporte Público, UX & Compartición
*   Sistema de presets de abono de transporte según distancia.
*   Tooltips/Badges de procedencia de datos (Transparencia).
*   Módulo `shareUrl.ts` (URLSearchParams) para copiar y compartir cálculos exactos mediante enlace web, manteniendo persistencia en localStorage.

### Fase 4: Despliegue y Analítica
*   Integración de GA4.
*   Automatización del despliegue en GitHub Pages (`desplaza.jnfire.dev`) vía GitHub Actions.
