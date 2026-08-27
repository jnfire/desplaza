/**
 * Módulo para la Compartición Dinámica (URL Shareable)
 * Permite codificar y decodificar el estado de la simulación en la URL
 * usando parámetros hash/query cortos para evitar URLs masivas.
 */

export interface AppState {
  origLat?: number;
  origLon?: number;
  destLat?: number;
  destLon?: number;
  fuelType?: string;
  consumption?: number; // Consumo l/100km o kWh/100km
  customPrice?: number; // Precio manual (override)
  daysPerWeek?: number;
  activeMonths?: number;
}

/**
 * Genera una URL relativa con el estado serializado.
 */
export function encodeStateToUrl(state: AppState): string {
  const params = new URLSearchParams();
  
  // Usamos nombres de parámetros cortos (ol = Origin Lat, f = Fuel) para que la URL quede limpia
  if (state.origLat !== undefined) params.set('ol', state.origLat.toFixed(5));
  if (state.origLon !== undefined) params.set('on', state.origLon.toFixed(5));
  if (state.destLat !== undefined) params.set('dl', state.destLat.toFixed(5));
  if (state.destLon !== undefined) params.set('dn', state.destLon.toFixed(5));
  if (state.fuelType !== undefined) params.set('f', state.fuelType);
  if (state.consumption !== undefined) params.set('c', state.consumption.toString());
  if (state.customPrice !== undefined) params.set('p', state.customPrice.toString());
  if (state.daysPerWeek !== undefined) params.set('d', state.daysPerWeek.toString());
  if (state.activeMonths !== undefined) params.set('m', state.activeMonths.toString());
  
  // Evitar incluir el '?' si no hay parámetros
  const queryString = params.toString();
  return queryString ? `?${queryString}` : window.location.pathname;
}

/**
 * Recupera el estado parseando la URL actual.
 */
export function decodeStateFromUrl(): AppState {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const state: AppState = {};
  
  if (params.has('ol')) state.origLat = parseFloat(params.get('ol')!);
  if (params.has('on')) state.origLon = parseFloat(params.get('on')!);
  if (params.has('dl')) state.destLat = parseFloat(params.get('dl')!);
  if (params.has('dn')) state.destLon = parseFloat(params.get('dn')!);
  
  if (params.has('f')) state.fuelType = params.get('f')!;
  if (params.has('c')) state.consumption = parseFloat(params.get('c')!);
  if (params.has('p')) state.customPrice = parseFloat(params.get('p')!);
  
  if (params.has('d')) state.daysPerWeek = parseInt(params.get('d')!, 10);
  if (params.has('m')) state.activeMonths = parseInt(params.get('m')!, 10);
  
  return state;
}
