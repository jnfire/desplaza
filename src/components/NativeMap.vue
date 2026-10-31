<!-- src/components/NativeMap.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Monochrome markers that follow the theme tokens instead of Leaflet's blue PNG pins.
const createMarkerIcon = (kind: 'origin' | 'destination') =>
  L.divIcon({
    className: `route-marker route-marker--${kind}`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    tooltipAnchor: [0, -10],
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

const { t } = useI18n();

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
let originMarker: L.Marker | null = null;
let destMarker: L.Marker | null = null;
let routePolyline: L.Polyline | null = null;

const LIGHT_TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const DARK_TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

const invalidateSize = () => {
  if (map) {
    nextTick(() => {
      map?.invalidateSize();
    });
  }
};

defineExpose({
  invalidateSize,
});

onMounted(() => {
  if (!mapContainer.value) return;

  // Initialize map centered on Spain
  map = L.map(mapContainer.value).setView([40.4168, -3.7038], 6);

  // Add tiles
  const tileUrl = props.darkMode ? DARK_TILES : LIGHT_TILES;
  tileLayer = L.tileLayer(tileUrl, {
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  }).addTo(map);

  updateMap();
  invalidateSize();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

// Watch for theme changes
watch(
  () => props.darkMode,
  (isDark) => {
    if (tileLayer) {
      tileLayer.setUrl(isDark ? DARK_TILES : LIGHT_TILES);
    }
  },
);

// Watch for coordinate or route changes
watch(
  [() => props.origin, () => props.destination, () => props.routeCoordinates],
  () => {
    updateMap();
  },
  { deep: true },
);

function updateMap() {
  if (!map) return;

  const bounds = L.latLngBounds([]);

  // Handle Origin Marker
  if (props.origin) {
    const latLng = L.latLng(props.origin.lat, props.origin.lon);
    if (!originMarker) {
      originMarker = L.marker(latLng, {
        draggable: true,
        icon: createMarkerIcon('origin'),
      }).addTo(map);
      originMarker.on('dragend', () => {
        const pos = originMarker!.getLatLng();
        emit('update:origin', { lat: pos.lat, lon: pos.lng });
      });
      originMarker.bindTooltip(t('core.origin'), {
        permanent: true,
        direction: 'top',
        className: 'marker-tooltip',
      });
    } else {
      originMarker.setLatLng(latLng);
      originMarker.setTooltipContent(t('core.origin'));
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
      destMarker = L.marker(latLng, {
        draggable: true,
        icon: createMarkerIcon('destination'),
      }).addTo(map);
      destMarker.on('dragend', () => {
        const pos = destMarker!.getLatLng();
        emit('update:destination', { lat: pos.lat, lon: pos.lng });
      });
      destMarker.bindTooltip(t('core.dest'), {
        permanent: true,
        direction: 'top',
        className: 'marker-tooltip',
      });
    } else {
      destMarker.setLatLng(latLng);
      destMarker.setTooltipContent(t('core.dest'));
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
    const latLngs = props.routeCoordinates.map((coord) => L.latLng(coord[1], coord[0]));
    routePolyline = L.polyline(latLngs, {
      color: 'var(--accent-color, #000000)',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
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
  <div
    ref="mapContainer"
    class="map-container"
    role="region"
    :aria-label="t('core.map_region')"
  ></div>
</template>

<style>
.leaflet-bar {
  border: 1px solid var(--border-color) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.leaflet-bar a,
.leaflet-bar a:hover {
  background-color: var(--bg-surface);
  color: var(--text-main);
  border-bottom-color: var(--border-color);
}

.leaflet-bar a:hover {
  background-color: var(--bg-surface-hover);
}

.route-marker {
  border-radius: 50%;
  border: 3px solid var(--accent-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
  cursor: grab;
}

.route-marker--origin {
  background: var(--bg-body);
}

.route-marker--destination {
  background: var(--accent-color);
  border-color: var(--bg-body);
  outline: 2px solid var(--accent-color);
}

.map-container {
  width: 100%;
  height: 100%;
  background-color: var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
}

/* Custom Tooltip Styling */
.marker-tooltip {
  background: var(--bg-body) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-main) !important;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  border-radius: 4px !important;
}

.leaflet-tooltip-top:before {
  border-top-color: var(--border-color) !important;
}
</style>
