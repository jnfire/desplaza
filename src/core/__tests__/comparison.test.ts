import { describe, expect, it } from 'vitest';
import {
  balanceScore,
  calculateOption,
  comparableCost,
  rankResults,
  WEEKS_PER_MONTH,
  type OptionResult,
} from '../comparison';
import {
  createOption,
  type CombustionOption,
  type ElectricOption,
  type TransitOption,
  type TripSettings,
} from '../travelOptions';

const commute: TripSettings = { tripMode: 'ciclo', daysPerWeek: 5, activeMonths: 12 };
const route = { distanceKm: 10, durationMinutes: 20 };
const prices = { fuelPrices: { 'Precio Gasolina 95 E5': 1.5 } };

const car = (overrides: Partial<CombustionOption> = {}): CombustionOption => ({
  ...(createOption('combustion', 'Car') as CombustionOption),
  consumption: 6,
  ...overrides,
});

describe('calculateOption', () => {
  it('matches the original cost formula for a combustion car', () => {
    // 20 km/day, 6 L/100 km, 1.5 €/L: 1.8 € fuel + 1.6 € wear = 3.4 €/day
    const result = calculateOption(car(), commute, route, prices);

    expect(result.perJourney).toBeCloseTo(3.4, 6);
    expect(result.monthly).toBeCloseTo(3.4 * 5 * WEEKS_PER_MONTH, 6);
    expect(result.annual).toBeCloseTo(result.monthly * 12, 6);
    expect(result.minutesPerJourney).toBe(40);
    expect(result.energyPrice).toBe(1.5);
    expect(result.complete).toBe(true);
  });

  it('counts one leg for a one-way trip and reports it per journey', () => {
    const oneWay: TripSettings = { ...commute, tripMode: 'ida' };
    const result = calculateOption(car(), oneWay, route, prices);

    expect(result.perJourney).toBeCloseTo(1.7, 6);
    expect(result.minutesPerJourney).toBe(20);
    expect(comparableCost(result, oneWay)).toBeCloseTo(1.7, 6);
  });

  it('adds tolls per leg and parking per day', () => {
    const result = calculateOption(
      car({ includeWear: false, tollPerLeg: 2, parkingPerDay: 5 }),
      commute,
      route,
      prices,
    );

    // 1.8 € fuel + 2 legs × 2 € toll + 5 € parking
    expect(result.perJourney).toBeCloseTo(10.8, 6);
  });

  it('uses the manual price when the option asks for it', () => {
    const result = calculateOption(
      car({ priceSource: 'manual', manualPrice: 2, includeWear: false }),
      commute,
      route,
      { fuelPrices: {} },
    );

    expect(result.energyPrice).toBe(2);
    expect(result.perJourney).toBeCloseTo(2.4, 6);
    expect(result.complete).toBe(true);
  });

  it('flags the result as incomplete when the automatic fuel price is missing', () => {
    const result = calculateOption(car(), commute, route, { fuelPrices: {} });

    expect(result.complete).toBe(false);
    expect(result.energyPrice).toBeNull();
  });

  it('blends home and public charging prices for an electric car', () => {
    const electric: ElectricOption = {
      ...(createOption('electric', 'EV') as ElectricOption),
      consumption: 15,
      homePrice: 0.1,
      publicPrice: 0.5,
      publicSharePct: 25,
      includeWear: false,
    };
    const result = calculateOption(electric, commute, route, prices);

    // 0.75 × 0.10 + 0.25 × 0.50 = 0.20 €/kWh; 20 km × 15 kWh/100 km = 3 kWh
    expect(result.energyPrice).toBeCloseTo(0.2, 6);
    expect(result.perJourney).toBeCloseTo(0.6, 6);
  });

  it('charges a monthly pass once a month, whatever the number of journeys', () => {
    const pass: TransitOption = {
      ...(createOption('transit', 'Bus') as TransitOption),
      fareType: 'pass',
      price: 40,
      otherMonthly: 10,
      minutesPerLeg: 35,
    };
    const result = calculateOption(pass, commute, route, prices);

    expect(result.monthly).toBe(50);
    expect(result.perJourney).toBeCloseTo(50 / (5 * WEEKS_PER_MONTH), 6);
    expect(result.minutesPerJourney).toBe(70);
  });

  it('multiplies a single ticket by legs and journeys', () => {
    const ticket: TransitOption = {
      ...(createOption('transit', 'Train') as TransitOption),
      fareType: 'ticket',
      price: 2,
    };
    const result = calculateOption(ticket, commute, route, prices);

    expect(result.perJourney).toBe(4);
    expect(result.monthly).toBeCloseTo(4 * 5 * WEEKS_PER_MONTH, 6);
    expect(result.minutesPerJourney).toBeNull();
  });

  it('leaves vehicle time unknown when the route has no duration', () => {
    const result = calculateOption(
      car(),
      commute,
      { distanceKm: 10, durationMinutes: null },
      prices,
    );

    expect(result.minutesPerJourney).toBeNull();
  });
});

describe('ranking', () => {
  const result = (
    optionId: string,
    monthly: number,
    minutesPerJourney: number | null,
    complete = true,
  ): OptionResult => ({
    optionId,
    perJourney: monthly / 20,
    monthly,
    annual: monthly * 12,
    minutesPerJourney,
    energyPrice: null,
    complete,
  });

  const cheapSlow = result('bus', 50, 70);
  const pricyFast = result('car', 150, 40);
  const middle = result('ev', 70, 40);

  it('orders by monthly cost', () => {
    const ranked = rankResults([pricyFast, cheapSlow, middle], commute, 'cost', 10);
    expect(ranked.map((entry) => entry.optionId)).toEqual(['bus', 'ev', 'car']);
  });

  it('orders by time and keeps the original order on ties', () => {
    const ranked = rankResults([pricyFast, cheapSlow, middle], commute, 'time', 10);
    expect(ranked.map((entry) => entry.optionId)).toEqual(['car', 'ev', 'bus']);
  });

  it('balances cost and time valued per hour', () => {
    // 21.65 journeys/month: bus adds 30 extra minutes per journey over the EV
    const lowHourValue = rankResults([cheapSlow, middle], commute, 'balance', 1);
    const highHourValue = rankResults([cheapSlow, middle], commute, 'balance', 30);

    expect(lowHourValue[0].optionId).toBe('bus');
    expect(highHourValue[0].optionId).toBe('ev');
    expect(balanceScore(cheapSlow, commute, 10)).toBeCloseTo(
      50 + (70 / 60) * 5 * WEEKS_PER_MONTH * 10,
      6,
    );
  });

  it('puts incomplete results and unknown times last', () => {
    const noPrice = result('no-price', 10, 10, false);
    const noTime = result('no-time', 20, null);

    expect(rankResults([noPrice, middle], commute, 'cost', 10).map((r) => r.optionId)).toEqual([
      'ev',
      'no-price',
    ]);
    expect(rankResults([noTime, middle], commute, 'time', 10).map((r) => r.optionId)).toEqual([
      'ev',
      'no-time',
    ]);
  });
});
