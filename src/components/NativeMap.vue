<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { calculateVisibleTiles, latLonToGlobalPixels } from '../utils/mercator';

const props = defineProps<{
  origin?: { lat: number; lon: number };
  destination?: { lat: number; lon: number };
  routeCoordinates?: [number, number][]; // Array de [lon, lat]
  darkMode?: boolean;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const containerWidth = ref(800);
const containerHeight = ref(300);

const zoom = ref(6);
const center = ref({ lat: 40.4168, lon: -3.7038 });

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (mapContainer.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width;
        containerHeight.value = entry.contentRect.height;
      }
    });
    resizeObserver.observe(mapContainer.value);
    
    containerWidth.value = mapContainer.value.clientWidth;
    containerHeight.value = mapContainer.value.clientHeight;
  }
  
  fitBounds();
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

watch([() => props.origin, () => props.destination, () => props.routeCoordinates], () => {
  fitBounds();
}, { deep: true });

function fitBounds() {
  if (props.origin && props.destination) {
    center.value = {
      lat: (props.origin.lat + props.destination.lat) / 2,
      lon: (props.origin.lon + props.destination.lon) / 2
    };
    
    const latDiff = Math.abs(props.origin.lat - props.destination.lat);
    const lonDiff = Math.abs(props.origin.lon - props.destination.lon);
    const maxDiff = Math.max(latDiff, lonDiff);
    
    if (maxDiff > 5) zoom.value = 5;
    else if (maxDiff > 2) zoom.value = 6;
    else if (maxDiff > 0.5) zoom.value = 8;
    else zoom.value = 11;
  } else if (props.origin) {
    center.value = { ...props.origin };
    zoom.value = 12;
  } else if (props.destination) {
    center.value = { ...props.destination };
    zoom.value = 12;
  }
}

const mapData = computed(() => {
  return calculateVisibleTiles(
    center.value.lat,
    center.value.lon,
    zoom.value,
    containerWidth.value || 800,
    containerHeight.value || 300
  );
});

const tileBaseUrl = computed(() => 
  props.darkMode 
    ? 'https://a.basemaps.cartocdn.com/dark_all' 
    : 'https://a.basemaps.cartocdn.com/light_all'
);

const originMarkerPos = computed(() => {
  if (!props.origin) return null;
  const px = latLonToGlobalPixels(props.origin.lat, props.origin.lon, zoom.value);
  return { left: px.x, top: px.y };
});

const destinationMarkerPos = computed(() => {
  if (!props.destination) return null;
  const px = latLonToGlobalPixels(props.destination.lat, props.destination.lon, zoom.value);
  return { left: px.x, top: px.y };
});

// Calcula los puntos del polyline SVG basado en la ruta real
const routePolylinePoints = computed(() => {
  if (!props.routeCoordinates || props.routeCoordinates.length === 0) return '';
  
  return props.routeCoordinates.map(coord => {
    const [lon, lat] = coord;
    const px = latLonToGlobalPixels(lat, lon, zoom.value);
    return `${px.x},${px.y}`;
  }).join(' ');
});

</script>

<template>
  <div class="native-map" ref="mapContainer">
    <div 
      class="map-layer" 
      :style="{ transform: `translate(${mapData.globalOffsetX}px, ${mapData.globalOffsetY}px)` }"
    >
      <img 
        v-for="tile in mapData.tiles" 
        :key="`${tile.z}-${tile.x}-${tile.y}-${darkMode}`"
        :src="`${tileBaseUrl}/${tile.z}/${tile.x}/${tile.y}.png`"
        class="map-tile"
        :style="{ left: `${tile.left}px`, top: `${tile.top}px` }"
        alt=""
        loading="lazy"
      />

      <!-- SVG para la línea de ruta (Exacta por carreteras) -->
      <svg 
        v-if="routePolylinePoints" 
        class="map-route-layer"
      >
        <polyline 
          :points="routePolylinePoints" 
          fill="none"
          stroke="var(--color-primary)" 
          stroke-width="4" 
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>
      <!-- SVG Fallback (Línea recta si aún no hay ruta calculada) -->
      <svg 
        v-else-if="originMarkerPos && destinationMarkerPos" 
        class="map-route-layer"
      >
        <line 
          :x1="originMarkerPos.left" 
          :y1="originMarkerPos.top" 
          :x2="destinationMarkerPos.left" 
          :y2="destinationMarkerPos.top" 
          stroke="var(--color-primary)" 
          stroke-width="3" 
          stroke-dasharray="6,6" 
        />
      </svg>

      <div 
        v-if="originMarkerPos" 
        class="map-marker origin-marker"
        :style="{ left: `${originMarkerPos.left}px`, top: `${originMarkerPos.top}px` }"
      ></div>

      <div 
        v-if="destinationMarkerPos" 
        class="map-marker dest-marker"
        :style="{ left: `${destinationMarkerPos.left}px`, top: `${destinationMarkerPos.top}px` }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.native-map {
  width: 100%;
  height: 300px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
}

.map-layer {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.map-tile {
  position: absolute;
  width: 256px;
  height: 256px;
  display: block; 
}

.map-route-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100000px; 
  height: 100000px;
  pointer-events: none;
  z-index: 10;
}

.map-marker {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  border: 3px solid var(--color-bg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.origin-marker {
  background-color: var(--color-text);
}

.dest-marker {
  background-color: var(--color-error);
}
</style>
