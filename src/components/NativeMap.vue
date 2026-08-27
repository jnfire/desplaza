<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon paths for Vite/Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const props = defineProps<{
  origin?: { lat: number; lon: number };
  destination?: { lat: number; lon: number };
  routeCoordinates?: [number, number][]; // [lon, lat] from GeoJSON
  darkMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:origin', pos: { lat: number; lon: number }): void;
  (e: 'update:destination', pos: { lat: number; lon: number }): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
let originMarker: L.Marker | null = null;
let destMarker: L.Marker | null = null;
let routePolyline: L.Polyline | null = null;

const LIGHT_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const DARK_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

onMounted(() => {
  if (!mapContainer.value) return;

  // Initialize map centered on Spain
  map = L.map(mapContainer.value).setView([40.4168, -3.7038], 6);

  // Add tiles
  const tileUrl = props.darkMode ? DARK_TILES : LIGHT_TILES;
  tileLayer = L.tileLayer(tileUrl, {
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  }).addTo(map);

  updateMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

// Watch for theme changes
watch(() => props.darkMode, (isDark) => {
  if (tileLayer) {
    tileLayer.setUrl(isDark ? DARK_TILES : LIGHT_TILES);
  }
});

// Watch for coordinate or route changes
watch([() => props.origin, () => props.destination, () => props.routeCoordinates], () => {
  updateMap();
}, { deep: true });

function updateMap() {
  if (!map) return;

  const bounds = L.latLngBounds([]);

  // Handle Origin Marker
  if (props.origin) {
    const latLng = L.latLng(props.origin.lat, props.origin.lon);
    if (!originMarker) {
      originMarker = L.marker(latLng, { draggable: true }).addTo(map);
      originMarker.on('dragend', () => {
        const pos = originMarker!.getLatLng();
        emit('update:origin', { lat: pos.lat, lon: pos.lng });
      });
      originMarker.bindTooltip('Origen', { permanent: true, direction: 'top', className: 'marker-tooltip' });
    } else {
      originMarker.setLatLng(latLng);
    }
    bounds.extend(latLng);
  } else if (originMarker) {
    map.removeLayer(originMarker);
    originMarker = null;
  }

  // Handle Destination Marker
  if (props.destination) {
    const latLng = L.latLng(props.destination.lat, props.destination.lon);
    if (!destMarker) {
      destMarker = L.marker(latLng, { draggable: true }).addTo(map);
      destMarker.on('dragend', () => {
        const pos = destMarker!.getLatLng();
        emit('update:destination', { lat: pos.lat, lon: pos.lng });
      });
      destMarker.bindTooltip('Destino', { permanent: true, direction: 'top', className: 'marker-tooltip' });
    } else {
      destMarker.setLatLng(latLng);
    }
    bounds.extend(latLng);
  } else if (destMarker) {
    map.removeLayer(destMarker);
    destMarker = null;
  }

  // Handle Route Polyline
  if (routePolyline) {
    map.removeLayer(routePolyline);
    routePolyline = null;
  }
  
  if (props.routeCoordinates && props.routeCoordinates.length > 0) {
    // GeoJSON uses [lon, lat], Leaflet uses [lat, lon]
    const latLngs = props.routeCoordinates.map(coord => L.latLng(coord[1], coord[0]));
    routePolyline = L.polyline(latLngs, {
      color: 'var(--color-primary, #3b82f6)',
      weight: 5,
      opacity: 0.8,
      lineCap: 'round'
    }).addTo(map);
    
    // Fit bounds to route
    map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
  } else if (bounds.isValid()) {
    // Fit bounds to markers if no route
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
  }
}
</script>

<template>
  <div class="map-container" ref="mapContainer"></div>
</template>

<style>
.map-container {
  width: 100%;
  height: 100%;
  background-color: var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
}

@media (min-width: 900px) {
  .map-container {
    min-height: 500px;
  }
}

/* Custom Tooltip Styling */
.marker-tooltip {
  background: var(--color-bg) !important;
  border: 1px solid var(--color-border) !important;
  color: var(--color-text) !important;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  border-radius: 4px !important;
}

.leaflet-tooltip-top:before {
  border-top-color: var(--color-border) !important;
}
</style>
