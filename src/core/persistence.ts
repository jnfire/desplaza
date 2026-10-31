/**
 * Saves the trip settings and the travel options on this device, so a
 * comparison survives a reload. Nothing leaves the browser.
 */
import {
  MAX_OPTIONS,
  sanitizeOption,
  sanitizeTrip,
  type TravelOption,
  type TripSettings,
} from './travelOptions';

export const STORAGE_KEY = 'desplaza-comparison-v1';

export interface SavedComparison {
  trip: TripSettings;
  options: TravelOption[];
}

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const loadComparison = (storage: KeyValueStorage | undefined): SavedComparison | null => {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { trip?: unknown; options?: unknown };
    const options = Array.isArray(parsed.options)
      ? parsed.options
          .map(sanitizeOption)
          .filter((option): option is TravelOption => option !== null)
          .slice(0, MAX_OPTIONS)
      : [];
    if (options.length === 0) return null;
    return { trip: sanitizeTrip(parsed.trip as Partial<TripSettings>), options };
  } catch {
    // Corrupt or unreadable data is treated as nothing saved.
    return null;
  }
};

export const saveComparison = (
  storage: KeyValueStorage | undefined,
  comparison: SavedComparison,
): void => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(comparison));
  } catch {
    // Storage full or blocked (private mode): the comparison just isn't kept.
  }
};
