/**
 * Servicio para geocodificación (Photon) y enrutamiento (OSRM)
 */

export interface GeocodeResult {
  name: string;
  lat: number;
  lon: number;
  label: string;
}

export interface RouteData {
  distanceKm: number;
  coordinates: [number, number][]; // Array de [longitud, latitud] devuelto por GeoJSON
}

/**
 * Busca una dirección utilizando Photon (OSM).
 * Priorizamos resultados en España agregando "+spain".
 * 
 * @param query Texto a buscar
 * @returns Lista de resultados geocodificados
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  try {
    const encodedQuery = encodeURIComponent(`${query} spain`);
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodedQuery}&limit=5`);
    if (!response.ok) throw new Error('Error en Photon API');
    
    const data = await response.json();
    return data.features.map((feature: any) => {
      const { name, street, housenumber, city, state } = feature.properties;
      const [lon, lat] = feature.geometry.coordinates;
      
      const addressPrefix = street ? `${street}${housenumber ? ` ${housenumber}` : ''}` : name;
      const labelParts = [addressPrefix, city, state].filter(Boolean);
      const label = Array.from(new Set(labelParts)).join(', ');
      
      return { name: state || city || name, lat, lon, label };
    });
  } catch (error) {
    console.error('Error de geocodificación:', error);
    return [];
  }
}

/**
 * Calcula la distancia por carretera y obtiene la geometría de la ruta entre dos puntos usando OSRM.
 * 
 * @param originLon Longitud de origen
 * @param originLat Latitud de origen
 * @param destLon Longitud de destino
 * @param destLat Latitud de destino
 * @returns Objeto con la distancia en km y el array de coordenadas [lon, lat] para dibujar la ruta
 */
export async function getRouteData(
  originLon: number, 
  originLat: number, 
  destLon: number, 
  destLat: number
): Promise<RouteData | null> {
  try {
    const coordinates = `${originLon},${originLat};${destLon},${destLat}`;
    // Pedimos geometries=geojson para recibir un array de coordenadas y overview=simplified para aligerar el renderizado en SVG
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=simplified&geometries=geojson`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error en OSRM API');
    
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('Ruta no encontrada');
    }
    
    const route = data.routes[0];
    const distanceMeters = route.distance;
    
    return {
      distanceKm: distanceMeters / 1000,
      coordinates: route.geometry.coordinates
    };
  } catch (error) {
    console.error('Error calculando ruta:', error);
    return null;
  }
}
