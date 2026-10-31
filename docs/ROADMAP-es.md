# Roadmap

*Leer esto en [Inglés](ROADMAP.md).*

Lo que hace Desplaza hoy y hacia dónde podría ir. Las ideas están ordenadas por lo que ayudarían; son ideas, no compromisos ni fechas.

## Lo que hace hoy

- Comparar varias formas de hacer el mismo trayecto (coches, una moto, un coche eléctrico, transporte público), cada una con su nombre.
- Ordenarlas por coste, tiempo o un equilibrio de ambos con tu hora valorada en €/h; la mejor opción queda destacada.
- Precios diarios del combustible por provincia del MITECO, ruta, distancia y tiempo de conducción de OSRM, y una ruta que se ajusta arrastrando en el mapa.
- La comparativa se guarda en el dispositivo y se puede compartir como enlace.

## Ideas

1. **CO₂ por opción,** con factores de emisión oficiales (hay que verificar la tabla antes de mostrar cifras).
2. **Precio automático de la electricidad** (PVPC, de los datos abiertos de Red Eléctrica) si su API responde sin token; si no, sigue siendo manual.
3. **Peajes y aparcamiento más visibles;** hoy están en "Más ajustes".
4. **"Mi garaje":** guardar vehículos para reutilizarlos entre trayectos.
5. **Híbridos enchufables** y **tarifas de referencia del transporte público por ciudad,** editables.
6. **Preguntar antes de reemplazar** la comparativa guardada al abrir un enlace compartido.
7. **Un servicio de rutas con condiciones claras para producción** en lugar del servidor público de demostración de OSRM.
8. **Tests automáticos de la interfaz;** hoy se prueban la lógica del núcleo y los servicios, y las pantallas se comprueban a mano y con scripts de navegador.

## Fuera de alcance

- Cuentas, un backend o cualquier almacenamiento en un servidor: lo que escribes se queda en tu navegador, salvo las peticiones a los servicios públicos que se listan en [`ARCHITECTURE-es.md`](ARCHITECTURE-es.md).
- Publicidad y rastreo.
