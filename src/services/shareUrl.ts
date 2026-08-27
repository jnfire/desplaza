// utils/shareUrl.ts
import type { VehicleState } from '../components/VehicleConfig.vue';

export interface AppState {
  origin?: { lat: number; lon: number; label: string };
  destination?: { lat: number; lon: number; label: string };
  vehicleConfig?: VehicleState;
}

export const encodeStateToUrl = (state: AppState): string => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();

  if (state.origin) {
    params.set('o_lat', state.origin.lat.toFixed(5));
    params.set('o_lon', state.origin.lon.toFixed(5));
    params.set('o_lbl', state.origin.label);
  }
  
  if (state.destination) {
    params.set('d_lat', state.destination.lat.toFixed(5));
    params.set('d_lon', state.destination.lon.toFixed(5));
    params.set('d_lbl', state.destination.label);
  }

  if (state.vehicleConfig) {
    params.set('vc_t', state.vehicleConfig.tripMode);
    params.set('vc_f', state.vehicleConfig.fuelType);
    params.set('vc_c', state.vehicleConfig.consumption.toString());
    params.set('vc_w', state.vehicleConfig.includeWear ? '1' : '0');
    params.set('vc_d', state.vehicleConfig.daysPerWeek.toString());
    params.set('vc_m', state.vehicleConfig.activeMonths.toString());
    params.set('vc_s', state.vehicleConfig.priceSource);
    params.set('vc_p', state.vehicleConfig.manualPrice.toString());
  }

  url.search = params.toString();
  return url.toString();
};
