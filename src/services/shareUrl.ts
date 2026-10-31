/**
 * Shareable links: the route, the trip and every travel option travel in
 * the query string, so no server stores them.
 *
 * Version 2 stores the options as base64url JSON in `opts`. Links from
 * version 1 (one vehicle in `vc_*` parameters) are still decoded and become
 * a single combustion option.
 */
import {
  createOption,
  sanitizeOption,
  sanitizeTrip,
  type CombustionOption,
  type TravelOption,
  type TripSettings,
} from '../core/travelOptions';

export interface SharedPlace {
  lat: number;
  lon: number;
  label: string;
}

export interface AppState {
  origin?: SharedPlace;
  destination?: SharedPlace;
  trip?: TripSettings;
  options?: TravelOption[];
}

const toBase64Url = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (encoded: string): string => {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
};

const setPlace = (params: URLSearchParams, prefix: 'o' | 'd', place?: SharedPlace) => {
  if (!place) return;
  params.set(`${prefix}_lat`, place.lat.toFixed(5));
  params.set(`${prefix}_lon`, place.lon.toFixed(5));
  params.set(`${prefix}_lbl`, place.label);
};

const getPlace = (params: URLSearchParams, prefix: 'o' | 'd'): SharedPlace | undefined => {
  const lat = parseFloat(params.get(`${prefix}_lat`) ?? '');
  const lon = parseFloat(params.get(`${prefix}_lon`) ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
  return { lat, lon, label: params.get(`${prefix}_lbl`) || '' };
};

export const encodeStateToUrl = (state: AppState): string => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();

  setPlace(params, 'o', state.origin);
  setPlace(params, 'd', state.destination);

  if (state.trip) {
    params.set(
      'trip',
      `${state.trip.tripMode}-${state.trip.daysPerWeek}-${state.trip.activeMonths}`,
    );
  }

  if (state.options?.length) {
    // Ids are local; they are regenerated when the link is opened.
    const options = state.options.map(({ id: _id, ...option }) => option);
    params.set('opts', toBase64Url(JSON.stringify(options)));
  }

  url.search = params.toString();
  return url.toString();
};

const decodeOptions = (encoded: string): TravelOption[] => {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((raw) => sanitizeOption({ ...(raw as object), id: undefined }))
      .filter((option): option is TravelOption => option !== null);
  } catch {
    return [];
  }
};

/** Version 1 links: one vehicle described by vc_* parameters. */
const decodeLegacyVehicle = (
  params: URLSearchParams,
): { trip: TripSettings; option: TravelOption } => {
  const trip = sanitizeTrip({
    tripMode: params.get('vc_t') as TripSettings['tripMode'],
    daysPerWeek: parseInt(params.get('vc_d') || '', 10),
    activeMonths: parseInt(params.get('vc_m') || '', 10),
  });
  const base = createOption('combustion', '') as CombustionOption;
  const option =
    sanitizeOption({
      ...base,
      fuelType: params.get('vc_f') ?? base.fuelType,
      consumption: parseFloat(params.get('vc_c') ?? ''),
      includeWear: params.get('vc_w') === '1',
      priceSource: params.get('vc_s') === 'manual' ? 'manual' : 'auto',
      manualPrice: parseFloat(params.get('vc_p') ?? ''),
    }) ?? base;
  return { trip, option };
};

export const decodeUrlToState = (): AppState | null => {
  const params = new URLSearchParams(window.location.search);
  const hasPlace = params.has('o_lat') || params.has('d_lat');
  const isV2 = params.has('opts') || params.has('trip');
  const isLegacy = params.has('vc_t');

  if (!hasPlace && !isV2 && !isLegacy) return null;

  const state: AppState = {
    origin: getPlace(params, 'o'),
    destination: getPlace(params, 'd'),
  };

  if (isV2) {
    const [tripMode, days, months] = (params.get('trip') ?? '').split('-');
    state.trip = sanitizeTrip({
      tripMode: tripMode as TripSettings['tripMode'],
      daysPerWeek: parseInt(days, 10),
      activeMonths: parseInt(months, 10),
    });
    const options = decodeOptions(params.get('opts') ?? '');
    if (options.length) state.options = options;
  } else if (isLegacy) {
    const legacy = decodeLegacyVehicle(params);
    state.trip = legacy.trip;
    state.options = [legacy.option];
  }

  return state;
};
