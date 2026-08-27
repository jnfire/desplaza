/**
 * Motor de estimación de costes de transporte público (España)
 */
import transitRules from './public_transit_es.json';

export interface TransitPreset {
  id: string;
  name: string;
  monthlyPrice: number;
}

/**
 * Recomienda un abono de transporte basándose en la distancia del trayecto de ida.
 * El motor utiliza una aproximación por tramos kilométricos (Urbano, Metropolitano, Cercanías).
 * 
 * @param distanceKm Distancia de ida en kilómetros.
 * @returns El preset de transporte público recomendado.
 */
export function recommendTransitPreset(distanceKm: number): TransitPreset {
  const rule = transitRules.rules.find(r => distanceKm <= r.maxDistanceKm);
  
  if (rule) {
    return { 
      id: rule.id, 
      name: rule.name, 
      monthlyPrice: rule.monthlyPrice 
    };
  }
  
  // Fallback seguro a la última regla (larga distancia)
  const lastRule = transitRules.rules[transitRules.rules.length - 1];
  return { 
    id: lastRule.id, 
    name: lastRule.name, 
    monthlyPrice: lastRule.monthlyPrice 
  };
}
