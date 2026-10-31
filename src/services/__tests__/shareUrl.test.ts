import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createOption,
  type CombustionOption,
  type ElectricOption,
  type TransitOption,
} from '../../core/travelOptions';
import { decodeUrlToState, encodeStateToUrl, type AppState } from '../shareUrl';

const BASE_URL = 'https://desplaza.jnfire.dev/';

const useLocation = (href: string) => {
  const url = new URL(href);
  vi.stubGlobal('window', { location: { href: url.href, search: url.search } });
};

const withoutIds = (options: AppState['options']) => options?.map(({ id: _id, ...rest }) => rest);

describe('shareUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips the route, the trip and every option', () => {
    const car = {
      ...(createOption('combustion', 'Seat León') as CombustionOption),
      consumption: 5.8,
      tollPerLeg: 2.5,
    };
    const electric = { ...(createOption('electric', 'Coche eléctrico ⚡') as ElectricOption) };
    const bus = {
      ...(createOption('transit', 'Bus') as TransitOption),
      fareType: 'ticket' as const,
      price: 1.5,
      minutesPerLeg: 45,
    };
    const state: AppState = {
      origin: { lat: 40.416775, lon: -3.70379, label: 'Puerta del Sol, Madrid' },
      destination: { lat: 40.4531, lon: -3.68835, label: 'Estadio, Madrid' },
      trip: { tripMode: 'idavuelta', daysPerWeek: 4, activeMonths: 11 },
      options: [car, electric, bus],
    };
    useLocation(BASE_URL);

    useLocation(encodeStateToUrl(state));
    const decoded = decodeUrlToState();

    expect(decoded?.origin).toEqual({
      lat: 40.41678,
      lon: -3.70379,
      label: 'Puerta del Sol, Madrid',
    });
    expect(decoded?.trip).toEqual(state.trip);
    expect(withoutIds(decoded?.options)).toEqual(withoutIds(state.options));
    // Ids are regenerated locally, never taken from the link.
    expect(decoded?.options?.[0].id).not.toBe(car.id);
  });

  it('returns null for a URL without shared state', () => {
    useLocation(`${BASE_URL}?utm_source=newsletter`);

    expect(decodeUrlToState()).toBeNull();
  });

  it('ignores a corrupt options payload but keeps the rest', () => {
    useLocation(`${BASE_URL}?trip=ciclo-9-0&opts=not-base64-json`);

    expect(decodeUrlToState()).toEqual({
      origin: undefined,
      destination: undefined,
      trip: { tripMode: 'ciclo', daysPerWeek: 7, activeMonths: 1 },
    });
  });

  describe('version 1 links', () => {
    it('turns the single vehicle into a combustion option', () => {
      useLocation(
        `${BASE_URL}?o_lat=40.4&o_lon=-3.7&o_lbl=Madrid&vc_t=idavuelta&vc_f=Precio%20Gasoleo%20A&vc_c=5.2&vc_w=1&vc_d=4&vc_m=11&vc_s=manual&vc_p=1.479`,
      );

      const state = decodeUrlToState();

      expect(state?.origin).toEqual({ lat: 40.4, lon: -3.7, label: 'Madrid' });
      expect(state?.trip).toEqual({ tripMode: 'idavuelta', daysPerWeek: 4, activeMonths: 11 });
      expect(state?.options).toHaveLength(1);
      expect(state?.options?.[0]).toMatchObject({
        kind: 'combustion',
        fuelType: 'Precio Gasoleo A',
        consumption: 5.2,
        includeWear: true,
        priceSource: 'manual',
        manualPrice: 1.479,
      });
    });

    it('clamps days and months and falls back to defaults for unknown values', () => {
      useLocation(`${BASE_URL}?vc_t=teleport&vc_s=guess&vc_d=9&vc_m=0`);

      const state = decodeUrlToState();

      expect(state?.trip).toEqual({ tripMode: 'ciclo', daysPerWeek: 7, activeMonths: 1 });
      expect(state?.options?.[0]).toMatchObject({
        fuelType: 'Precio Gasolina 95 E5',
        consumption: 6.5,
        priceSource: 'auto',
        includeWear: false,
      });
    });
  });
});
