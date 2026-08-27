/**
 * Servicio para conectarse a la API de carburantes del MITECO
 */

export interface Province {
  IDPovincia: string;
  Provincia: string;
}

export interface Station {
  'Precio Gasolina 95 E5': string;
  'Precio Gasoleo A': string;
  'Precio Gases licuados del petróleo': string;
  [key: string]: string; // Fallback para otros campos
}

const MITECO_BASE_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';

/**
 * Obtiene la lista de provincias.
 */
export async function getProvinces(): Promise<Province[]> {
  try {
    const response = await fetch(`${MITECO_BASE_URL}/Listados/Provincias/`);
    if (!response.ok) throw new Error('Error al obtener provincias');
    return await response.json();
  } catch (error) {
    console.error('MITECO API Error:', error);
    return [];
  }
}

/**
 * Calcula el precio medio provincial para un tipo de combustible.
 * @param provinceId ID de la provincia
 * @param fuelKey Clave del precio en la respuesta JSON (ej. 'Precio Gasolina 95 E5')
 * @returns Precio medio en euros por litro (o 0 si falla)
 */
export async function getAverageFuelPriceByProvince(provinceId: string, fuelKey: keyof Station): Promise<number> {
  try {
    const response = await fetch(`${MITECO_BASE_URL}/EstacionesTerrestres/FiltroProvincia/${provinceId}`);
    if (!response.ok) throw new Error('Error al obtener estaciones');
    
    const data = await response.json();
    const stations: Station[] = data.ListaEESSPrecio || [];
    
    let total = 0;
    let count = 0;
    
    for (const station of stations) {
      const priceString = station[fuelKey];
      if (priceString) {
        // MITECO devuelve los decimales con coma
        const priceNumber = parseFloat(priceString.replace(',', '.'));
        if (!isNaN(priceNumber)) {
          total += priceNumber;
          count++;
        }
      }
    }
    
    if (count === 0) return 0;
    return Number((total / count).toFixed(3));
  } catch (error) {
    console.error(`Error calculando media provincial para combustible: ${String(fuelKey)}`, error);
    return 0;
  }
}
