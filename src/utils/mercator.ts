/**
 * Utilidades matemáticas para proyecciones Web Mercator (EPSG:3857)
 * Permite renderizar mapas de tiles (XYZ) sin depender de librerías externas.
 */

export const TILE_SIZE = 256;

/**
 * Convierte coordenadas geográficas (Latitud, Longitud) a píxeles globales absolutos 
 * para un nivel de zoom determinado.
 */
export function latLonToGlobalPixels(lat: number, lon: number, zoom: number): { x: number, y: number } {
  const n = Math.pow(2, zoom);
  
  // X: Proyección lineal de longitud
  const xTile = (lon + 180) / 360 * n;
  
  // Y: Proyección de Mercator para latitud
  const latRad = lat * (Math.PI / 180);
  const yTile = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
  
  return { 
    x: xTile * TILE_SIZE, 
    y: yTile * TILE_SIZE 
  };
}

/**
 * Calcula qué mosaicos (tiles XYZ) deben cargarse basándose en el centro y las dimensiones del contenedor.
 */
export function calculateVisibleTiles(
  centerLat: number, 
  centerLon: number, 
  zoom: number, 
  containerWidth: number, 
  containerHeight: number
) {
  const centerPx = latLonToGlobalPixels(centerLat, centerLon, zoom);
  
  // Determinar los límites en píxeles de lo que se ve en pantalla
  const halfW = containerWidth / 2;
  const halfH = containerHeight / 2;
  
  const minPxX = centerPx.x - halfW;
  const maxPxX = centerPx.x + halfW;
  const minPxY = centerPx.y - halfH;
  const maxPxY = centerPx.y + halfH;
  
  // Convertir esos límites a coordenadas de tiles (índices XYZ)
  const minTileX = Math.floor(minPxX / TILE_SIZE);
  const maxTileX = Math.floor(maxPxX / TILE_SIZE);
  const minTileY = Math.floor(minPxY / TILE_SIZE);
  const maxTileY = Math.floor(maxPxY / TILE_SIZE);
  
  const tiles = [];
  
  for (let x = minTileX; x <= maxTileX; x++) {
    for (let y = minTileY; y <= maxTileY; y++) {
      tiles.push({
        x,
        y,
        z: zoom,
        // Posición CSS absoluta relativa a la capa global del mapa
        left: x * TILE_SIZE,
        top: y * TILE_SIZE
      });
    }
  }
  
  return {
    tiles,
    // El offset necesario para que el centerPx quede exactamente en el centro del div
    globalOffsetX: halfW - centerPx.x,
    globalOffsetY: halfH - centerPx.y,
    centerPx
  };
}
