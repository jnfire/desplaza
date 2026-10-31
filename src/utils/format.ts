/** Locale-aware number formatting for prices, distances and times. */

export const formatNumber = (value: number, locale: string, decimals = 2): string =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

/** "24 min" or "1 h 05 min". */
export const formatMinutes = (minutes: number): string => {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  return `${hours} h ${String(rounded % 60).padStart(2, '0')} min`;
};
