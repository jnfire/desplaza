/**
 * Módulo de cálculos matemáticos puros para estimación de costes de desplazamiento.
 */

export interface CostCalculationResult {
  perTrip: number;
  monthly: number;
  annual: number;
}

/**
 * Calcula los costes de desplazamiento en vehículo privado en distintas frecuencias.
 * 
 * @param distanceKm Distancia de ida en kilómetros.
 * @param daysPerWeek Días laborables por semana que se realiza el trayecto.
 * @param consumptionPer100Km Consumo medio del vehículo cada 100km.
 * @param fuelPrice Precio actual por unidad de combustible.
 * @param extraCostPerKm Coste opcional de desgaste, mantenimiento y seguro por kilómetro.
 * @param activeMonths Número de meses al año de actividad.
 * @param tripMode El modo de cálculo: ida, idavuelta o ciclo.
 * @returns Objeto con los costes (por viaje, mensual, anual).
 */
export function calculateCarCosts(
  distanceKm: number,
  daysPerWeek: number,
  consumptionPer100Km: number,
  fuelPrice: number,
  extraCostPerKm: number = 0,
  activeMonths: number = 11,
  tripMode: 'ida' | 'idavuelta' | 'ciclo' = 'ciclo'
): CostCalculationResult {
  const averageWeeksPerMonth = 4.33;
  
  // Dependiendo del modo, el "viaje base" es ida (x1) o ida y vuelta (x2).
  // Para el ciclo repetitivo (ej: ir al trabajo), asumimos siempre ida y vuelta.
  const roundTripMultiplier = tripMode === 'ida' ? 1 : 2;
  
  // Coste de 1 Viaje (según modo)
  const singleTripDistanceKm = distanceKm * roundTripMultiplier;
  const singleTripFuelCost = (singleTripDistanceKm / 100) * consumptionPer100Km * fuelPrice;
  const singleTripExtraCost = singleTripDistanceKm * extraCostPerKm;
  const perTrip = singleTripFuelCost + singleTripExtraCost;
  
  // Coste Mensual (Solo aplica para ciclo)
  const monthlyTrips = daysPerWeek * averageWeeksPerMonth;
  const monthly = perTrip * monthlyTrips;
  
  // Coste Anual (Solo aplica para ciclo)
  const annual = monthly * activeMonths;
  
  return { perTrip, monthly, annual };
}
