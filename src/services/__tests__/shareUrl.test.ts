import { describe, it, expect, beforeEach } from 'vitest';
import { encodeStateToUrl, decodeUrlToState } from '../shareUrl';

describe('shareUrl', () => {
  beforeEach(() => {
    (globalThis as any).window = {
      location: new URL('https://desplaza.local/')
    };
  });

  it('encodes and decodes complete state accurately', () => {
    const originalState = {
      origin: { lat: 40.4168, lon: -3.7038, label: 'Madrid, Spain' },
      destination: { lat: 41.3879, lon: 2.16992, label: 'Barcelona, Spain' },
      vehicleConfig: {
        fuelType: 'Precio Gasolina 95 E5',
        consumption: 6.5,
        tripMode: 'ciclo' as const,
        daysPerWeek: 5,
        activeMonths: 11,
        includeWear: true,
        priceSource: 'auto' as const,
        manualPrice: 1.55
      }
    };

    const encodedUrl = encodeStateToUrl(originalState);
    expect(encodedUrl).toContain('https://desplaza.local/?');

    // Simulate navigating to the encoded URL
    (globalThis as any).window.location = new URL(encodedUrl);

    const decodedState = decodeUrlToState();
    expect(decodedState).not.toBeNull();
    expect(decodedState?.origin?.lat).toBeCloseTo(40.4168, 4);
    expect(decodedState?.origin?.lon).toBeCloseTo(-3.7038, 4);
    expect(decodedState?.origin?.label).toBe('Madrid, Spain');

    expect(decodedState?.destination?.lat).toBeCloseTo(41.3879, 4);
    expect(decodedState?.destination?.lon).toBeCloseTo(2.16992, 4);
    expect(decodedState?.destination?.label).toBe('Barcelona, Spain');

    expect(decodedState?.vehicleConfig?.fuelType).toBe('Precio Gasolina 95 E5');
    expect(decodedState?.vehicleConfig?.consumption).toBe(6.5);
    expect(decodedState?.vehicleConfig?.tripMode).toBe('ciclo');
    expect(decodedState?.vehicleConfig?.daysPerWeek).toBe(5);
    expect(decodedState?.vehicleConfig?.activeMonths).toBe(11);
    expect(decodedState?.vehicleConfig?.includeWear).toBe(true);
  });

  it('returns null when no data parameter is present', () => {
    (globalThis as any).window.location = new URL('https://desplaza.local/');
    const result = decodeUrlToState();
    expect(result).toBeNull();
  });
});
