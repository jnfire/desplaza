# Desplaza 🚗 💨

> **Calcula y compara el coste real de tu movilidad.**

**Desplaza** (`desplaza.jnfire.dev`) es una aplicación web estática, ultra-ligera y minimalista diseñada para estimar de forma precisa y transparente el coste real mensual y anual de tus desplazamientos en vehículo privado en España.

## 🌟 Características Principales

- **Sin Servidor (100% Client-Side)**: Privacidad total. Los cálculos se realizan en tu navegador. No hay bases de datos ni registro.
- **Datos Reales en Tiempo Real (API MITECO)**: Obtiene los precios medios provinciales del combustible diarios gracias a la API del Ministerio para la Transición Ecológica de España.
- **Enrutamiento Preciso**: 
  - Geocodificación inteligente y tolerante a fallos usando **Photon (OpenStreetMap)**.
  - Cálculo de distancias y polilíneas vectoriales a través del motor **OSRM**.
- **Coste de Desgaste (TCO)**: Permite añadir una cuota de desgaste estandarizada ($0,08€$/km) que prorratea neumáticos, seguro, revisiones y amortización del vehículo.
- **Ultra-Ligero**: 
  - Sin pesadas librerías de mapas (Leaflet o Mapbox). Utiliza un `<NativeMap>` propio de ~4KB basado en matemáticas *Web Mercator* para dibujar las *tiles* cartográficas y la ruta en un SVG.
  - Peso total de la aplicación construida: ~33 KB (Gzipped).

## 🛠 Arquitectura y Tecnologías

El proyecto sigue una estricta filosofía de *Clean Code* y rendimiento *Mobile-First*.

- **Framework**: Vue 3 + Vite
- **Lenguaje**: TypeScript
- **Estilos**: CSS Puro con Sistema de Diseño Minimalista (Proto-Librería compartida del ecosistema `jnfire`).
- **Tests**: Vitest
- **CI/CD**: GitHub Actions desplegando directamente en Cloudflare Pages.

### Estructura del Código

```text
src/
├── assets/
│   └── styles/main.css      # Sistema de diseño, tokens de color (Dark/Light mode)
├── components/              # Componentes de UI modulares
│   ├── AppHeader.vue        # Cabecera de la aplicación
│   ├── AppFooter.vue        # Pie de página y enlaces
│   ├── RouteForm.vue        # Autocompletado de origen y destino
│   ├── VehicleConfig.vue    # Separación visual de Viaje y Vehículo
│   ├── NativeMap.vue        # Motor de renderizado cartográfico custom
│   └── SourcesModal.vue     # Auditoría de datos y fuentes
├── services/
│   ├── miteco.ts            # Cliente para la API del Gobierno de España
│   ├── routing.ts           # Cliente para Photon y OSRM
│   └── shareUrl.ts          # Gestión de estado por URL (Pendiente de integrar UI)
├── utils/
│   ├── costMath.ts          # Lógica pura y agnóstica de costes
│   └── mercator.ts          # Proyección matemática de coordenadas
└── App.vue                  # Orquestador del estado principal
```

## 🚀 Instalación y Desarrollo Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/jnfire/desplaza.git
   cd desplaza
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Levanta el entorno de desarrollo:
   ```bash
   npm run dev
   ```

4. Ejecuta los tests unitarios:
   ```bash
   npm test
   ```

5. Construye para producción:
   ```bash
   npm run build
   ```

## ☁️ Despliegue (CI/CD)

El proyecto incluye un pipeline automatizado `.github/workflows/deploy.yml` para desplegar automáticamente la rama `main` en **GitHub Pages**.

### Configuración del entorno de Despliegue

Para que el despliegue automático funcione, solo necesitas configurar tu repositorio en GitHub:

1. Ve a tu repositorio en GitHub y entra en **Settings**.
2. En el menú lateral, selecciona **Pages**.
3. En el apartado *Build and deployment > Source*, asegúrate de seleccionar **GitHub Actions**.

¡Y ya está! No necesitas tokens externos. Al hacer `git push` a la rama `main`, GitHub Actions se encargará de testear, construir la aplicación y subir la carpeta `dist` automáticamente.

> **Nota para dominios personalizados**: Si vas a usar un dominio como `desplaza.jnfire.dev`, asegúrate de añadir tu dominio en las opciones de GitHub Pages y configurar tu proveedor de DNS (CNAME apuntando a `jnfire.github.io`).

---
*Construido con paciencia y Clean Code por el equipo pro Javi & Gema.*
