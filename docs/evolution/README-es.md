# Evolución

*Leer esto en [Inglés](README.md).*

Cómo Desplaza pasó de su primer commit a hoy, con las capturas para verlo.

![Desplaza en tres etapas, escritorio](desplaza-evolution-desktop.png)

## Cronología

| Cuándo | Qué pasó |
| --- | --- |
| Agosto de 2026 | Primer commit y primera versión pública: un coche, los precios del MITECO, una ruta en un mapa y el coste mensual y anual. Una rama con trabajo de accesibilidad y usabilidad se quedó sin integrar. |
| Octubre de 2026 | Software libre (AGPL-3.0), sin Google Analytics ni banner de cookies, documentación honesta de los servicios de terceros, un sistema de diseño compartido con las otras dos herramientas y CI que condiciona cada despliegue. Se integró la rama de accesibilidad: la búsqueda de direcciones pasó a ser un combobox accesible con teclado y la ventana de fuentes un diálogo de verdad. |
| Octubre de 2026 | Comparativa de varias opciones sobre el mismo trayecto: coches, una moto, un coche eléctrico y transporte público, ordenadas por coste, tiempo o equilibrio, editadas en un modal y mostradas como tabla en pantallas anchas. Primera versión estable. |

## En cifras

| | Antes (agosto de 2026) | Ahora |
| --- | --- | --- |
| Tests automáticos | 3 | 69 |
| Licencia | Todos los derechos reservados | AGPL-3.0 |
| Analítica | Google Analytics y banner de cookies | Ninguna |
| Despliegue | Sin ningún test ni comprobación | Solo si pasan lint, formato, componentes compartidos, tests y build |
| Avisos de dependencias (npm audit) | Gravedad alta (vue-i18n) | Ninguno |

La columna "antes" es el estado del proyecto el 28 de agosto de 2026, justo antes de la ronda de trabajo que se describe arriba.

## Imágenes

Todas las imágenes están en esta carpeta y en [`../screenshots`](../screenshots); usan datos de ejemplo y no muestran las teselas del mapa porque se capturaron sin conexión.

- [`desplaza-evolution-desktop.png`](desplaza-evolution-desktop.png): Antes y ahora, en escritorio
- [`desplaza-evolution-mobile.png`](desplaza-evolution-mobile.png): Antes y ahora, en el móvil
- [`desplaza-editor.png`](../screenshots/desplaza-editor.png): El modal para crear o editar una opción

## Cómo se ha construido

Diseñado y dirigido por [Javier Nicolás Pérez Mesa](https://github.com/jnfire): el producto, la arquitectura y las decisiones de diseño son suyos. Buena parte de la implementación se ha escrito con ayuda de IA ([Claude Code](https://claude.com/claude-code)), trabajando bajo su dirección y mediante pull requests que él revisa; los commits hechos así llevan un `Co-Authored-By`.
