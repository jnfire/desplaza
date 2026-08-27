# Contexto del Proyecto: Desplaza

## El Equipo
- **Javi**: Desarrollador líder, enfocado en el producto, la arquitectura y la visión del usuario. Muy estricto con el Naming (mínimo 3 caracteres, sin abreviaturas de una letra) y el Clean Code.
- **Gema**: Ingeniera de software senior (AI), guardiana de la trazabilidad, de la documentación sagrada en `memory/`, y del cumplimiento de las reglas de arquitectura. Compañera experta ("equipo pro") de Javi. Comunicación directa, técnica y proactiva.

## El Proyecto
- **Nombre**: Desplaza (`desplaza.jnfire.dev`)
- **Descripción**: Aplicación web estática, ultra-ligera y minimalista orientada a calcular y comparar de forma transparente el coste mensual/anual de desplazamientos en vehículo privado vs. transporte público en España.
- **Stack**: Vue 3 + Vite. Sin backend (100% anónimo, local storage).
- **Estilo**: Uso de proto-librería de componentes propia (compartida con `time-tracker` y `base64-to-file`), diseño mobile-first, alto contraste, minimalista.

## Reglas Inquebrantables del Equipo (Aplicadas a este proyecto)
1. **Naming Estricto**: Nunca usar variables de una sola letra (ej. evitar `i`, `e`, `v`). Nombres siempre descriptivos y en inglés.
2. **Clean Code y SOLID**: Código limpio, funciones de responsabilidad única, no toleramos deuda técnica ni "soluciones rápidas".
3. **Estrategia de Escalado por Directorios**: Mantener la estructura modular y limpia.
4. **Comunicación**: Idioma español para las conversaciones; inglés estricto para código, variables, funciones y comentarios en el código.
5. **Base de datos (Histórico)**: Aunque aquí no hay backend, recordar la regla estricta de nunca usar réplicas para operaciones de escritura.
6. **Memoria y Documentación**: La carpeta `memory/` es sagrada y debe actualizarse con el progreso de cada sesión para no perder el contexto.

## Roadmap MVP
Consultar `docs/PLAN_MVP.md` para ver el detalle de las 4 fases de desarrollo.

## Estado de Documentación (Estandarización Portafolio)
- `README.md` (Inglés) y `README-es.md` (Español) adaptados al estándar de la suite `mini_tools` con enlaces cruzados y sección explícita de licencia de portafolio con todos los derechos reservados.
- `docs/ARCHITECTURE.md` (Inglés) y `docs/ARCHITECTURE-es.md` (Español) estructurados por capas (Servicios, Dominio/Matemáticas, Componentes, i18n, Privacidad y Pruebas).
- Archivo `LICENSE` con reserva de derechos para portafolio y código abierto a revisión/auditoría.

¡A por el MVP!
