import { describe, expect, it } from 'vitest';
import { loadComparison, saveComparison, STORAGE_KEY } from '../persistence';
import { createOption, MAX_OPTIONS } from '../travelOptions';

const memoryStorage = (initial: Record<string, string> = {}) => {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
};

describe('persistence', () => {
  it('saves and loads a comparison', () => {
    const storage = memoryStorage();
    const comparison = {
      trip: { tripMode: 'ciclo' as const, daysPerWeek: 3, activeMonths: 10 },
      options: [createOption('combustion', 'Seat León'), createOption('transit', 'Bus')],
    };

    saveComparison(storage, comparison);

    expect(loadComparison(storage)).toEqual(comparison);
  });

  it('returns nothing for missing, corrupt or empty data', () => {
    expect(loadComparison(memoryStorage())).toBeNull();
    expect(loadComparison(memoryStorage({ [STORAGE_KEY]: '{not json' }))).toBeNull();
    expect(loadComparison(memoryStorage({ [STORAGE_KEY]: '{"options":[]}' }))).toBeNull();
    expect(loadComparison(undefined)).toBeNull();
  });

  it('drops invalid options and keeps at most the maximum', () => {
    const options = [
      { kind: 'teleport' },
      ...Array.from({ length: MAX_OPTIONS + 2 }, (_, index) =>
        createOption('combustion', `Car ${index}`),
      ),
    ];
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ options }) });

    const loaded = loadComparison(storage);

    expect(loaded?.options).toHaveLength(MAX_OPTIONS);
    expect(loaded?.options[0].name).toBe('Car 0');
  });

  it('does not throw when storage refuses to write', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };

    expect(() =>
      saveComparison(storage, {
        trip: { tripMode: 'ida', daysPerWeek: 1, activeMonths: 1 },
        options: [],
      }),
    ).not.toThrow();
  });
});
