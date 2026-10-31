import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VehicleState } from '../../components/VehicleConfig.vue';
import { decodeUrlToState, encodeStateToUrl, type AppState } from '../shareUrl';

const BASE_URL = 'https://desplaza.jnfire.dev/';

const useLocation = (href: string) => {
  const url = new URL(href);
  vi.stubGlobal('window', { location: { href: url.href, search: url.search } });
};

const vehicle: VehicleState = {
  fuelType: 'Precio Gasoleo A',
  consumption: 5.2,
  tripMode: 'idavuelta',
  daysPerWeek: 4,
  activeMonths: 11,
  includeWear: true,
  priceSource: 'manual',
  manualPrice: 1.479,
};

describe('shareUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips origin, destination and vehicle settings through the URL', () => {
    const state: AppState = {
      origin: { lat: 40.416775, lon: -3.70379, label: 'Puerta del Sol, Madrid' },
      destination: { lat: 40.4531, lon: -3.68835, label: 'Estadio, Madrid' },
      vehicleConfig: vehicle,
    };
    useLocation(BASE_URL);

    const shared = encodeStateToUrl(state);
    useLocation(shared);

    expect(decodeUrlToState()).toEqual({
      origin: { lat: 40.41678, lon: -3.70379, label: 'Puerta del Sol, Madrid' },
      destination: { lat: 40.4531, lon: -3.68835, label: 'Estadio, Madrid' },
      vehicleConfig: vehicle,
    });
  });

  it('returns null for a URL without shared state', () => {
    useLocation(`${BASE_URL}?utm_source=newsletter`);

    expect(decodeUrlToState()).toBeNull();
  });

  it('clamps days and months to valid ranges', () => {
    useLocation(`${BASE_URL}?vc_t=ciclo&vc_d=9&vc_m=0`);

    const state = decodeUrlToState();

    expect(state?.vehicleConfig?.daysPerWeek).toBe(7);
    expect(state?.vehicleConfig?.activeMonths).toBe(1);
  });

  it('falls back to defaults for unknown or missing values', () => {
    useLocation(`${BASE_URL}?vc_t=teleport&vc_s=guess&vc_d=abc`);

    expect(decodeUrlToState()?.vehicleConfig).toEqual({
      tripMode: 'ciclo',
      fuelType: 'Precio Gasolina 95 E5',
      consumption: 6.5,
      includeWear: false,
      daysPerWeek: 5,
      activeMonths: 12,
      priceSource: 'auto',
      manualPrice: 1.55,
    });
  });
});
