/**
 * Módulo de cálculos matemáticos puros para estimación de costes de desplazamiento.
 * Basado en las fórmulas especificadas en el MVP.
 */

/**
 * Calcula el coste mensual de desplazamiento en vehículo privado.
 * 
 * @param distanceKm Distancia de ida en kilómetros.
 * @param daysPerWeek Días laborables por semana que se realiza el trayecto.
 * @param consumptionPer100Km Consumo medio del vehículo cada 100km (litros o kWh).
 * @param fuelPrice Precio actual por unidad de combustible (litro o kWh).
 * @param extraCostPerKm Coste opcional de desgaste, mantenimiento y seguro por kilómetro.
 * @returns Coste mensual estimado en euros.
 */
export function calculateMonthlyCarCost(
  distanceKm: number,
  daysPerWeek: number,
  consumptionPer100Km: number,
  fuelPrice: number,
  extraCostPerKm: number = 0
): number {
  const averageWeeksPerMonth = 4.33;
  const roundTripMultiplier = 2;
  
  const totalMonthlyDistanceKm = distanceKm * roundTripMultiplier * daysPerWeek * averageWeeksPerMonth;
  
  const monthlyFuelCost = (totalMonthlyDistanceKm / 100) * consumptionPer100Km * fuelPrice;
  const monthlyExtraCost = totalMonthlyDistanceKm * extraCostPerKm;
  
  return monthlyFuelCost + monthlyExtraCost;
}

/**
 * Calcula el coste anual basado en los meses laborables o lectivos.
 * 
 * @param monthlyCost Coste mensual calculado previamente.
 * @param activeMonthsPerYear Número de meses al año que se realiza el desplazamiento.
 * @returns Coste anual estimado en euros.
 */
export function calculateAnnualCarCost(
  monthlyCost: number,
  activeMonthsPerYear: number
): number {
  return monthlyCost * activeMonthsPerYear;
}
