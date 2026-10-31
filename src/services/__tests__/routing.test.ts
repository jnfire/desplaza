import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { geocodeAddress, getRouteData } from '../routing';

const jsonResponse = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;

const photonFeature = (properties: Record<string, string>, lon = -3.7, lat = 40.4) => ({
  geometry: { coordinates: [lon, lat] },
  properties,
});

describe('routing', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('geocodeAddress', () => {
    it('biases the search to Spain and limits it to five results', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ features: [] }));

      await geocodeAddress('Plaza Mayor');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://photon.komoot.io/api/?q=Plaza%20Mayor%20spain&limit=5',
      );
    });

    it('builds the label from street, number, city and region', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          features: [
            photonFeature(
              {
                street: 'Calle Mayor',
                housenumber: '5',
                city: 'Madrid',
                state: 'Comunidad de Madrid',
              },
              -3.71,
              40.41,
            ),
          ],
        }),
      );

      await expect(geocodeAddress('Calle Mayor 5')).resolves.toEqual([
        {
          name: 'Comunidad de Madrid',
          lat: 40.41,
          lon: -3.71,
          label: 'Calle Mayor 5, Madrid, Comunidad de Madrid',
        },
      ]);
    });

    it('uses the place name when there is no street and drops repeated parts', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ features: [photonFeature({ name: 'Valencia', city: 'Valencia' })] }),
      );

      const [result] = await geocodeAddress('Valencia');

      expect(result.label).toBe('Valencia');
      expect(result.name).toBe('Valencia');
    });

    it('returns an empty list when Photon fails', async () => {
      fetchMock.mockResolvedValue(jsonResponse(null, false));

      await expect(geocodeAddress('anything')).resolves.toEqual([]);
    });
  });

  describe('getRouteData', () => {
    it('requests a driving route and converts metres and seconds', async () => {
      const coordinates = [
        [-3.7, 40.4],
        [-3.6, 40.5],
      ];
      fetchMock.mockResolvedValue(
        jsonResponse({
          code: 'Ok',
          routes: [{ distance: 12345, duration: 1260, geometry: { coordinates } }],
        }),
      );

      await expect(getRouteData(-3.7, 40.4, -3.6, 40.5)).resolves.toEqual({
        distanceKm: 12.345,
        durationMinutes: 21,
        coordinates,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://router.project-osrm.org/route/v1/driving/-3.7,40.4;-3.6,40.5?overview=simplified&geometries=geojson',
      );
    });

    it('leaves the duration unknown when OSRM omits it', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ code: 'Ok', routes: [{ distance: 1000, geometry: { coordinates: [] } }] }),
      );

      await expect(getRouteData(0, 0, 1, 1)).resolves.toMatchObject({ durationMinutes: null });
    });

    it('returns null when OSRM finds no route', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ code: 'NoRoute', routes: [] }));

      await expect(getRouteData(0, 0, 1, 1)).resolves.toBeNull();
    });

    it('returns null when the request fails', async () => {
      fetchMock.mockRejectedValue(new Error('network down'));

      await expect(getRouteData(0, 0, 1, 1)).resolves.toBeNull();
    });
  });
});
