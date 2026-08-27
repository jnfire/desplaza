import { describe, it, expect } from 'vitest';
import { calculateCarCosts } from '../costMath';

describe('costMath', () => {
  it('calculates costs correctly for Solo Ida', () => {
    // 10km distance, 6L/100km, fuel 1.5€/L, 0.08 extra/km
    const result = calculateCarCosts(10, 5, 6, 1.5, 0.08, 11, 'ida');
    
    // perTrip: Fuel = (10/100) * 6 * 1.5 = 0.9. Extra = 10 * 0.08 = 0.8. Total = 1.7
    expect(result.perTrip).toBeCloseTo(1.7, 2);
  });

  it('calculates costs correctly for Ida y Vuelta', () => {
    // 10km distance, 6L/100km, fuel 1.5€/L, 0.08 extra/km
    const result = calculateCarCosts(10, 5, 6, 1.5, 0.08, 11, 'idavuelta');
    
    // perTrip: Distance = 20. Fuel = (20/100) * 6 * 1.5 = 1.8. Extra = 20 * 0.08 = 1.6. Total = 3.4
    expect(result.perTrip).toBeCloseTo(3.4, 2);
  });

  it('calculates costs correctly for Ciclo Repetitivo', () => {
    const result = calculateCarCosts(10, 5, 6, 1.5, 0.08, 11, 'ciclo');
    
    // perTrip = 3.4
    expect(result.perTrip).toBeCloseTo(3.4, 2);
    
    // monthly: 5 days/week * 4.33 weeks/month = 21.65 trips/month
    // 3.4 * 21.65 = 73.61
    expect(result.monthly).toBeCloseTo(73.61, 2);
    
    // annual: 73.61 * 11 months = 809.71
    expect(result.annual).toBeCloseTo(809.71, 2);
  });
});
