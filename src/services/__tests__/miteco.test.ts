import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAverageFuelPriceByProvince, getProvinces } from '../miteco';

const jsonResponse = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;

describe('miteco', () => {
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

  describe('getProvinces', () => {
    it('returns the province list from the API', async () => {
      const provinces = [{ IDPovincia: '28', Provincia: 'MADRID' }];
      fetchMock.mockResolvedValue(jsonResponse(provinces));

      await expect(getProvinces()).resolves.toEqual(provinces);
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/Listados/Provincias/'));
    });

    it('returns an empty list when the API fails', async () => {
      fetchMock.mockResolvedValue(jsonResponse(null, false));

      await expect(getProvinces()).resolves.toEqual([]);
    });
  });

  describe('getAverageFuelPriceByProvince', () => {
    it('averages comma-decimal prices and rounds to three decimals', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          ListaEESSPrecio: [
            { 'Precio Gasoleo A': '1,459' },
            { 'Precio Gasoleo A': '1,500' },
            { 'Precio Gasoleo A': '1,512' },
          ],
        }),
      );

      await expect(getAverageFuelPriceByProvince('28', 'Precio Gasoleo A')).resolves.toBe(1.49);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/EstacionesTerrestres/FiltroProvincia/28'),
      );
    });

    it('skips stations without a valid price for that fuel', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          ListaEESSPrecio: [
            { 'Precio Gasolina 95 E5': '1,600' },
            { 'Precio Gasolina 95 E5': '' },
            { 'Precio Gasolina 95 E5': 'n/d' },
            { 'Precio Gasoleo A': '1,400' },
          ],
        }),
      );

      await expect(getAverageFuelPriceByProvince('46', 'Precio Gasolina 95 E5')).resolves.toBe(1.6);
    });

    it('returns 0 when no station sells that fuel', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ ListaEESSPrecio: [] }));

      await expect(
        getAverageFuelPriceByProvince('01', 'Precio Gases licuados del petróleo'),
      ).resolves.toBe(0);
    });

    it('returns 0 when the API fails', async () => {
      fetchMock.mockRejectedValue(new Error('network down'));

      await expect(getAverageFuelPriceByProvince('28', 'Precio Gasoleo A')).resolves.toBe(0);
    });
  });
});
