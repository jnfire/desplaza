/**
 * Domain model for the trip and the travel options compared on it.
 * Framework-agnostic: no Vue imports.
 */

export type TripMode = 'ida' | 'idavuelta' | 'ciclo';

export interface TripSettings {
  tripMode: TripMode;
  daysPerWeek: number;
  activeMonths: number;
}

export type OptionKind = 'combustion' | 'motorbike' | 'electric' | 'transit';

export const OPTION_KINDS: OptionKind[] = ['combustion', 'motorbike', 'electric', 'transit'];

/** MITECO price fields offered for combustion vehicles. */
export const FUEL_KEYS = [
  'Precio Gasolina 95 E5',
  'Precio Gasolina 98 E5',
  'Precio Gasoleo A',
  'Precio Gasoleo Premium',
  'Precio Gases licuados del petróleo',
] as const;

export type FuelKey = (typeof FUEL_KEYS)[number];

export const MAX_OPTIONS = 5;

/** €/km used by the wear surcharge since the first version of the app. */
export const DEFAULT_WEAR_PER_KM = 0.08;

interface BaseOption {
  id: string;
  name: string;
  kind: OptionKind;
}

/** Costs every private vehicle can add on top of its energy. */
export interface VehicleExtras {
  includeWear: boolean;
  wearPerKm: number;
  /** € paid in tolls on each one-way leg. */
  tollPerLeg: number;
  /** € paid for parking on each day the trip is made. */
  parkingPerDay: number;
}

export interface CombustionOption extends BaseOption, VehicleExtras {
  kind: 'combustion' | 'motorbike';
  fuelType: FuelKey;
  priceSource: 'auto' | 'manual';
  /** €/L used when priceSource is manual. */
  manualPrice: number;
  /** L/100 km. */
  consumption: number;
}

export interface ElectricOption extends BaseOption, VehicleExtras {
  kind: 'electric';
  /** kWh/100 km. */
  consumption: number;
  /** €/kWh when charging at home. */
  homePrice: number;
  /** €/kWh at public chargers. */
  publicPrice: number;
  /** Share of the energy charged at public chargers, 0–100. */
  publicSharePct: number;
}

export interface TransitOption extends BaseOption {
  kind: 'transit';
  fareType: 'pass' | 'ticket';
  /** Monthly pass price, or the price of one one-way ticket. */
  price: number;
  /** Door-to-door minutes of one one-way leg; null when unknown. */
  minutesPerLeg: number | null;
  /** Other monthly costs (e.g. parking at the station). */
  otherMonthly: number;
}

export type TravelOption = CombustionOption | ElectricOption | TransitOption;

export const DEFAULT_TRIP: TripSettings = { tripMode: 'ciclo', daysPerWeek: 5, activeMonths: 12 };

/**
 * Reference values for fields with no automatic source. They are starting
 * points the user is expected to adjust, and the UI labels them as such.
 */
export const REFERENCE_VALUES = {
  homeElectricityPrice: 0.15,
  publicElectricityPrice: 0.45,
  combustionManualPrice: 1.55,
};

let idCounter = 0;
export const createOptionId = (): string => {
  idCounter += 1;
  return `opt-${Date.now().toString(36)}-${idCounter}`;
};

const vehicleExtras = (): VehicleExtras => ({
  includeWear: true,
  wearPerKm: DEFAULT_WEAR_PER_KM,
  tollPerLeg: 0,
  parkingPerDay: 0,
});

/** A new option of the given kind with sensible defaults. */
export const createOption = (kind: OptionKind, name: string): TravelOption => {
  const id = createOptionId();
  switch (kind) {
    case 'combustion':
    case 'motorbike':
      return {
        id,
        name,
        kind,
        fuelType: 'Precio Gasolina 95 E5',
        priceSource: 'auto',
        manualPrice: REFERENCE_VALUES.combustionManualPrice,
        consumption: kind === 'motorbike' ? 4 : 6.5,
        ...vehicleExtras(),
      };
    case 'electric':
      return {
        id,
        name,
        kind,
        consumption: 16,
        homePrice: REFERENCE_VALUES.homeElectricityPrice,
        publicPrice: REFERENCE_VALUES.publicElectricityPrice,
        publicSharePct: 20,
        ...vehicleExtras(),
      };
    case 'transit':
      return {
        id,
        name,
        kind,
        fareType: 'pass',
        price: 40,
        minutesPerLeg: null,
        otherMonthly: 0,
      };
  }
};

/**
 * Turns an option into another kind, keeping its id, its name and the
 * fields both kinds share.
 */
export const changeOptionKind = (option: TravelOption, kind: OptionKind): TravelOption => {
  if (option.kind === kind) return option;
  const fresh = createOption(kind, option.name);
  const merged = { ...fresh, id: option.id } as TravelOption;
  if (merged.kind !== 'transit' && option.kind !== 'transit') {
    const { includeWear, wearPerKm, tollPerLeg, parkingPerDay } = option;
    Object.assign(merged, { includeWear, wearPerKm, tollPerLeg, parkingPerDay });
  }
  if (
    (merged.kind === 'combustion' || merged.kind === 'motorbike') &&
    (option.kind === 'combustion' || option.kind === 'motorbike')
  ) {
    const { fuelType, priceSource, manualPrice } = option;
    Object.assign(merged, { fuelType, priceSource, manualPrice });
  }
  return merged;
};

/** A copy with a new id and the given name. */
export const duplicateOption = (option: TravelOption, name: string): TravelOption => ({
  ...option,
  id: createOptionId(),
  name,
});

/**
 * Returns `base` if no option uses it, otherwise "base (2)", "base (3)"...
 */
export const uniqueName = (base: string, options: TravelOption[]): string => {
  const taken = new Set(options.map((option) => option.name.trim().toLowerCase()));
  if (!taken.has(base.trim().toLowerCase())) return base;
  let suffix = 2;
  while (taken.has(`${base} (${suffix})`.toLowerCase())) suffix += 1;
  return `${base} (${suffix})`;
};

const clamp = (value: unknown, min: number, max: number, fallback: number): number => {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
};

export const sanitizeTrip = (trip: Partial<TripSettings> | undefined): TripSettings => ({
  tripMode:
    trip?.tripMode === 'ida' || trip?.tripMode === 'idavuelta' || trip?.tripMode === 'ciclo'
      ? trip.tripMode
      : DEFAULT_TRIP.tripMode,
  daysPerWeek: Math.round(clamp(trip?.daysPerWeek, 1, 7, DEFAULT_TRIP.daysPerWeek)),
  activeMonths: Math.round(clamp(trip?.activeMonths, 1, 12, DEFAULT_TRIP.activeMonths)),
});

/**
 * Validates an option read from storage or a shared URL. Unknown kinds are
 * dropped; missing or invalid fields fall back to the defaults of the kind.
 */
export const sanitizeOption = (raw: unknown): TravelOption | null => {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Record<string, unknown>;
  const kind = input.kind as OptionKind;
  if (!OPTION_KINDS.includes(kind)) return null;
  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : '';
  const base = createOption(kind, name.slice(0, 40));
  const id = typeof input.id === 'string' && input.id ? input.id : base.id;

  if (base.kind === 'transit') {
    return {
      ...base,
      id,
      fareType: input.fareType === 'ticket' ? 'ticket' : 'pass',
      price: clamp(input.price, 0, 10000, base.price),
      minutesPerLeg:
        input.minutesPerLeg === null ||
        input.minutesPerLeg === undefined ||
        input.minutesPerLeg === ''
          ? null
          : clamp(input.minutesPerLeg, 1, 1440, 30),
      otherMonthly: clamp(input.otherMonthly, 0, 10000, 0),
    };
  }

  const extras: VehicleExtras = {
    includeWear: typeof input.includeWear === 'boolean' ? input.includeWear : true,
    wearPerKm: clamp(input.wearPerKm, 0, 5, DEFAULT_WEAR_PER_KM),
    tollPerLeg: clamp(input.tollPerLeg, 0, 1000, 0),
    parkingPerDay: clamp(input.parkingPerDay, 0, 1000, 0),
  };

  if (base.kind === 'electric') {
    return {
      ...base,
      ...extras,
      id,
      consumption: clamp(input.consumption, 1, 100, base.consumption),
      homePrice: clamp(input.homePrice, 0, 5, base.homePrice),
      publicPrice: clamp(input.publicPrice, 0, 5, base.publicPrice),
      publicSharePct: clamp(input.publicSharePct, 0, 100, base.publicSharePct),
    };
  }

  return {
    ...base,
    ...extras,
    id,
    fuelType: FUEL_KEYS.includes(input.fuelType as FuelKey)
      ? (input.fuelType as FuelKey)
      : base.fuelType,
    priceSource: input.priceSource === 'manual' ? 'manual' : 'auto',
    manualPrice: clamp(input.manualPrice, 0, 10, base.manualPrice),
    consumption: clamp(input.consumption, 0.5, 50, base.consumption),
  };
};
