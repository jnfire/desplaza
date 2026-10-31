/**
 * Cost and time of each travel option for the same trip, and their ranking.
 * Framework-agnostic: no Vue imports.
 */
import type { FuelKey, TravelOption, TripSettings } from './travelOptions';

/** Average weeks per month, used since the first version of the app. */
export const WEEKS_PER_MONTH = 4.33;

export interface RouteFacts {
  /** One-way road distance. */
  distanceKm: number;
  /** One-way driving time, or null when the routing service did not provide it. */
  durationMinutes: number | null;
}

export interface PriceContext {
  /** Province average price per fuel, from MITECO; missing when unavailable. */
  fuelPrices: Partial<Record<FuelKey, number>>;
}

export interface OptionResult {
  optionId: string;
  /** Cost of one journey: a one-way leg, a round trip, or a commuting day. */
  perJourney: number;
  /** Monthly cost; only meaningful for recurring commutes. */
  monthly: number;
  /** Yearly cost over the active months. */
  annual: number;
  /** Minutes of one journey, or null when unknown. */
  minutesPerJourney: number | null;
  /** Price per unit of energy actually used (€/L or €/kWh), when it applies. */
  energyPrice: number | null;
  /** False when a needed price is missing, so the cost cannot be trusted. */
  complete: boolean;
}

export type SortKey = 'cost' | 'time' | 'balance';

/** One-way legs per journey for each trip mode. */
export const legsPerJourney = (trip: TripSettings): number => (trip.tripMode === 'ida' ? 1 : 2);

export const journeysPerMonth = (trip: TripSettings): number =>
  trip.tripMode === 'ciclo' ? trip.daysPerWeek * WEEKS_PER_MONTH : 1;

const vehicleExtrasPerJourney = (
  option: Exclude<TravelOption, { kind: 'transit' }>,
  journeyKm: number,
  legs: number,
): number =>
  (option.includeWear ? option.wearPerKm * journeyKm : 0) +
  option.tollPerLeg * legs +
  option.parkingPerDay;

export const calculateOption = (
  option: TravelOption,
  trip: TripSettings,
  route: RouteFacts,
  prices: PriceContext,
): OptionResult => {
  const legs = legsPerJourney(trip);
  const journeys = journeysPerMonth(trip);
  const journeyKm = route.distanceKm * legs;
  const vehicleMinutes = route.durationMinutes === null ? null : route.durationMinutes * legs;
  const isRecurring = trip.tripMode === 'ciclo';

  let perJourney: number;
  let monthly: number;
  let minutesPerJourney: number | null;
  let energyPrice: number | null = null;
  let complete = true;

  if (option.kind === 'transit') {
    minutesPerJourney = option.minutesPerLeg === null ? null : option.minutesPerLeg * legs;
    if (option.fareType === 'ticket') {
      perJourney = option.price * legs;
      monthly = perJourney * journeys + option.otherMonthly;
    } else {
      // A pass is paid monthly whatever the number of journeys.
      monthly = option.price + option.otherMonthly;
      perJourney = isRecurring ? monthly / journeys : monthly;
    }
  } else {
    minutesPerJourney = vehicleMinutes;
    if (option.kind === 'electric') {
      const publicShare = option.publicSharePct / 100;
      energyPrice = option.homePrice * (1 - publicShare) + option.publicPrice * publicShare;
    } else if (option.priceSource === 'manual') {
      energyPrice = option.manualPrice;
    } else {
      const automatic = prices.fuelPrices[option.fuelType];
      energyPrice = automatic && automatic > 0 ? automatic : null;
      complete = energyPrice !== null;
    }
    const energyCost = (journeyKm / 100) * option.consumption * (energyPrice ?? 0) || 0;
    perJourney = energyCost + vehicleExtrasPerJourney(option, journeyKm, legs);
    monthly = perJourney * journeys;
  }

  return {
    optionId: option.id,
    perJourney,
    monthly,
    annual: isRecurring ? monthly * trip.activeMonths : perJourney,
    minutesPerJourney,
    energyPrice,
    complete,
  };
};

/** The cost compared between options: monthly for commutes, per journey otherwise. */
export const comparableCost = (result: OptionResult, trip: TripSettings): number =>
  trip.tripMode === 'ciclo' ? result.monthly : result.perJourney;

/**
 * Cost plus time valued at `hourValue` €/h, over the same period as
 * comparableCost. Null when the time is unknown.
 */
export const balanceScore = (
  result: OptionResult,
  trip: TripSettings,
  hourValue: number,
): number | null => {
  if (result.minutesPerJourney === null) return null;
  const journeys = trip.tripMode === 'ciclo' ? journeysPerMonth(trip) : 1;
  const hours = (result.minutesPerJourney / 60) * journeys;
  return comparableCost(result, trip) + hours * hourValue;
};

/**
 * Results ordered by the chosen criterion. Incomplete results, and results
 * with no value for the criterion, go last in their original order.
 */
export const rankResults = (
  results: OptionResult[],
  trip: TripSettings,
  sortKey: SortKey,
  hourValue: number,
): OptionResult[] => {
  const valueOf = (result: OptionResult): number | null => {
    if (!result.complete) return null;
    if (sortKey === 'cost') return comparableCost(result, trip);
    if (sortKey === 'time') return result.minutesPerJourney;
    return balanceScore(result, trip, hourValue);
  };
  return results
    .map((result, index) => ({ result, index, value: valueOf(result) }))
    .sort((left, right) => {
      if (left.value === null && right.value === null) return left.index - right.index;
      if (left.value === null) return 1;
      if (right.value === null) return -1;
      return left.value - right.value || left.index - right.index;
    })
    .map((entry) => entry.result);
};
