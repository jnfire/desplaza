<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import NativeMap from './components/NativeMap.vue';
import VehicleConfig, { type VehicleState } from './components/VehicleConfig.vue';
import SourcesModal from './components/SourcesModal.vue';
import SettingsView from './components/SettingsView.vue';
import CookieBanner from './components/CookieBanner.vue';
import { initAnalytics } from './utils/analytics';

import { getRouteData, type RouteData } from './services/routing';
import { getProvinces, getAverageFuelPriceByProvince, type Province } from './services/miteco';
import { calculateCarCosts, type CostCalculationResult } from './utils/costMath';
import { encodeStateToUrl, decodeUrlToState } from "./services/shareUrl";


// State
const { t } = useI18n();
const isDarkMode = ref(false);
const showSourcesModal = ref(false);

const initialUrlState = typeof window !== 'undefined' ? decodeUrlToState() : null;

const originLocation = ref<{ lat: number; lon: number; label: string; provinceSearch: string } | null>(
  initialUrlState?.origin ? { ...initialUrlState.origin, provinceSearch: initialUrlState.origin.label } : null
);
const destLocation = ref<{ lat: number; lon: number; label: string; provinceSearch: string } | null>(
  initialUrlState?.destination ? { ...initialUrlState.destination, provinceSearch: initialUrlState.destination.label } : null
);
const routeData = ref<RouteData | null>(null);
const vehicleConfig = ref<VehicleState | null>(initialUrlState?.vehicleConfig || null);
const provincesList = ref<Province[]>([]);
const currentFuelPrice = ref<number | null>(null);
const isCalculating = ref(false);

const isDesktop = ref(typeof window !== 'undefined' ? window.innerWidth >= 900 : true);
const isMapVisibleMobile = ref(false);

onMounted(async () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      isDesktop.value = window.innerWidth >= 900;
    });
    
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      isDarkMode.value = mediaQuery.matches;
      mediaQuery.addEventListener('change', e => {
        isDarkMode.value = e.matches;
      });
    }
  }
  provincesList.value = await getProvinces();
});

watch([originLocation, destLocation], async ([orig, dest]) => {
  if (orig && dest) {
    isCalculating.value = true;
    routeData.value = await getRouteData(orig.lon, orig.lat, dest.lon, dest.lat);
    isCalculating.value = false;
  } else {
    routeData.value = null;
  }
}, { immediate: true });

const updateFuelPrice = async () => {
  if (!vehicleConfig.value) return;

  if (vehicleConfig.value.priceSource === 'manual') {
    currentFuelPrice.value = vehicleConfig.value.manualPrice;
    return;
  }

  if (!originLocation.value || provincesList.value.length === 0) return;

  const searchStr = originLocation.value.provinceSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const matchedProv = provincesList.value.find(p => {
    const pName = p.Provincia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return searchStr.includes(pName) || pName.includes(searchStr);
  });
  
  if (matchedProv) {
    currentFuelPrice.value = await getAverageFuelPriceByProvince(matchedProv.IDPovincia, vehicleConfig.value.fuelType as any);
  } else {
    currentFuelPrice.value = await getAverageFuelPriceByProvince("28", vehicleConfig.value.fuelType as any);
  }
};

watch([
  originLocation, 
  () => vehicleConfig.value?.fuelType, 
  () => vehicleConfig.value?.priceSource, 
  () => vehicleConfig.value?.manualPrice,
  provincesList
], updateFuelPrice, { immediate: true });

const onVehicleConfigUpdate = (state: VehicleState) => {
  vehicleConfig.value = state;
};

// Formato español: usar coma para decimales
const formatEuro = (val: number) => {
  return val.toFixed(2).replace('.', ',');
};
const formatEuroPrice3 = (val: number) => {
  return val.toFixed(3).replace('.', ',');
};

// Computed Costs
const computedCosts = computed<CostCalculationResult | null>(() => {
  if (!routeData.value || !vehicleConfig.value || !currentFuelPrice.value) return null;
  const extraCost = vehicleConfig.value.includeWear ? 0.08 : 0;
  
  return calculateCarCosts(
    routeData.value.distanceKm,
    vehicleConfig.value.daysPerWeek,
    vehicleConfig.value.consumption,
    currentFuelPrice.value,
    extraCost,
    vehicleConfig.value.activeMonths,
    vehicleConfig.value.tripMode
  );
});

const goHome = () => {
  originLocation.value = null;
  destLocation.value = null;
  showSettings.value = false;
};

const updateOriginCoords = (pos: { lat: number, lon: number }) => {
  if (originLocation.value) {
    originLocation.value = { ...originLocation.value, lat: pos.lat, lon: pos.lon };
  }
};

const updateDestCoords = (pos: { lat: number, lon: number }) => {
  if (destLocation.value) {
    destLocation.value = { ...destLocation.value, lat: pos.lat, lon: pos.lon };
  }
};

const shareRoute = async () => {
  const url = encodeStateToUrl({
    origin: originLocation.value ? { lat: originLocation.value.lat, lon: originLocation.value.lon, label: originLocation.value.label } : undefined,
    destination: destLocation.value ? { lat: destLocation.value.lat, lon: destLocation.value.lon, label: destLocation.value.label } : undefined,
    vehicleConfig: vehicleConfig.value || undefined
  });
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: t('core.share_title'),
        text: t('core.share_text'),
        url: url
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert(t('core.share_copied'));
    }
  } catch (err) {
    console.error('Error sharing:', err);
  }
};
const showSettings = ref(false);

const handleCookieAccept = () => {
  const gaId = (import.meta.env.VITE_GA_ID as string) || 'G-XXXXXXXXXX';
  initAnalytics(gaId);
};
</script>

<template>
  <div class="app-wrapper">
    <AppHeader :showSettings="showSettings" @toggle-settings="showSettings = !showSettings" @home="goHome" @share="shareRoute" />

    <main class="app-container">
      <SettingsView v-if="showSettings" :show="showSettings" />

      <div class="layout-grid" v-else>
        <!-- Columna Izquierda: Formularios -->
        <div class="forms-column">
          <!-- Mobile Map Section -->
          <div v-if="!isDesktop" class="mobile-map-section">
            <button 
              class="map-toggle-btn" 
              @click="isMapVisibleMobile = !isMapVisibleMobile"
              :aria-expanded="isMapVisibleMobile"
            >
              <span>{{ isMapVisibleMobile ? 'Ocultar mapa' : 'Ver y ajustar en el mapa' }}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                :style="{ transform: isMapVisibleMobile ? 'rotate(180deg)' : 'rotate(0)' }"
                style="transition: transform 0.2s;"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div class="map-wrapper" v-if="isMapVisibleMobile">
              <NativeMap 
                :origin="originLocation ? { lat: originLocation.lat, lon: originLocation.lon } : undefined" 
                :destination="destLocation ? { lat: destLocation.lat, lon: destLocation.lon } : undefined" 
                :route-coordinates="routeData?.coordinates"
                :dark-mode="isDarkMode" 
                @update:origin="updateOriginCoords"
                @update:destination="updateDestCoords"
              />
            </div>
          </div>

          <VehicleConfig 
            :initial-state="initialUrlState?.vehicleConfig || undefined"
            :origin-label="originLocation?.label"
            :destination-label="destLocation?.label"
            @update="onVehicleConfigUpdate" 
            @update:origin="originLocation = $event"
            @update:destination="destLocation = $event"
          />
        </div>
        
        <!-- Columna Derecha: Mapa y Resultados -->
        <div class="results-column">
          <!-- Desktop Map Section -->
          <section class="map-section" v-if="isDesktop">
            <div class="map-wrapper">
              <NativeMap 
                :origin="originLocation ? { lat: originLocation.lat, lon: originLocation.lon } : undefined" 
                :destination="destLocation ? { lat: destLocation.lat, lon: destLocation.lon } : undefined" 
                :route-coordinates="routeData?.coordinates"
                :dark-mode="isDarkMode" 
                @update:origin="updateOriginCoords"
                @update:destination="updateDestCoords"
              />
            </div>
          </section>

          <!-- Tarjeta de Resultados -->
          <section class="cost-summary" v-if="routeData && currentFuelPrice && computedCosts">
            <div class="summary-header">
              <h2>{{ $t("core.calc_cost") }}</h2>
              <div class="header-actions">
                <button class="miteco-badge" @click="showSourcesModal = true" :title="$t('footer.methodology')">
                  {{ $t("core.source_btn") }} {{ vehicleConfig?.priceSource === 'manual' ? 'Manual' : 'MITECO' }} ({{ formatEuroPrice3(currentFuelPrice) }} €/L)
                </button>
              </div>
            </div>
            
            <div v-if="vehicleConfig?.tripMode === 'ida'" class="cost-numbers single">
              <div class="cost-item main-cost">
                <span class="cost-label">{{ $t("core.one_way") }}</span>
                <span class="cost-value">{{ formatEuro(computedCosts.perTrip) }} <small>€</small></span>
              </div>
            </div>

            <div v-else-if="vehicleConfig?.tripMode === 'idavuelta'" class="cost-numbers single">
              <div class="cost-item main-cost">
                <span class="cost-label">{{ $t("core.round_trip") }}</span>
                <span class="cost-value">{{ formatEuro(computedCosts.perTrip) }} <small>€</small></span>
              </div>
            </div>

            <div v-else class="cost-numbers">
              <div class="cost-item">
                <span class="cost-label">{{ $t("core.monthly") }}</span>
                <span class="cost-value">{{ formatEuro(computedCosts.monthly) }} <small>€</small></span>
              </div>
              <div class="cost-item">
                <span class="cost-label">{{ $t("core.annual") }} ({{ vehicleConfig?.activeMonths }})</span>
                <span class="cost-value">{{ formatEuro(computedCosts.annual) }} <small>€</small></span>
              </div>
            </div>
            
            <div class="cost-details">
              <p>{{ $t("core.route_dist") }} <strong>{{ formatEuro(routeData.distanceKm) }} km</strong> (sólo ida)</p>
              <p v-if="vehicleConfig?.includeWear" class="text-muted">
                {{ $t("core.wear_note") }}
              </p>
            </div>
          </section>
          
          <div v-else-if="isCalculating" class="placeholder-card">
            <p>{{ $t("core.calc_loading") }}</p>
          </div>
          
          <div v-else class="placeholder-card">
            <p>{{ $t("core.define_route") }}</p>
          </div>
        </div>
      </div>
    </main>

    <AppFooter @show-sources="showSourcesModal = true" />
    
    <SourcesModal v-if="showSourcesModal" @close="showSourcesModal = false" />
    <CookieBanner @accept="handleCookieAccept" />
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-container {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 900px) {
  .layout-grid {
    grid-template-columns: 400px 1fr;
  }
}

.forms-column, .results-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.map-toggle-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.map-toggle-btn:hover {
  background: var(--color-bg-hover, rgba(0,0,0,0.02));
}

.map-wrapper {
  height: 400px;
}

@media (min-width: 900px) {
  .map-wrapper {
    height: 100%;
  }
}

.cost-summary {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-button {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-button:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.summary-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.miteco-badge {
  background-color: var(--color-text);
  color: var(--color-bg);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.miteco-badge:hover {
  opacity: 0.8;
}

.cost-numbers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.cost-numbers.single {
  grid-template-columns: 1fr;
}

.cost-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cost-label {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cost-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-text);
}

.cost-value small {
  font-size: 1.25rem;
  font-weight: 500;
}

.cost-details {
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
  font-size: 0.9rem;
}

.text-muted {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.placeholder-card {
  padding: 3rem 1.5rem;
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
}
</style>
