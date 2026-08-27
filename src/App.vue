<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import NativeMap from './components/NativeMap.vue';
import RouteForm from './components/RouteForm.vue';
import VehicleConfig, { type VehicleState } from './components/VehicleConfig.vue';
import SourcesModal from './components/SourcesModal.vue';

import { getRouteData, type RouteData } from './services/routing';
import { getProvinces, getAverageFuelPriceByProvince, type Province } from './services/miteco';
import { calculateCarCosts, type CostCalculationResult } from './utils/costMath';

// State
const isDarkMode = ref(false);
const showSourcesModal = ref(false);

const originLocation = ref<{ lat: number; lon: number; label: string; provinceSearch: string } | null>(null);
const destLocation = ref<{ lat: number; lon: number; label: string; provinceSearch: string } | null>(null);
const routeData = ref<RouteData | null>(null);
const vehicleConfig = ref<VehicleState | null>(null);
const provincesList = ref<Province[]>([]);
const currentFuelPrice = ref<number | null>(null);
const isCalculating = ref(false);

onMounted(async () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkMode.value = mediaQuery.matches;
    mediaQuery.addEventListener('change', e => {
      isDarkMode.value = e.matches;
    });
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
});

const updateFuelPrice = async () => {
  if (!originLocation.value || !vehicleConfig.value) return;
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

watch([originLocation, () => vehicleConfig.value?.fuelType], updateFuelPrice);

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

const resetApp = () => {
  originLocation.value = null;
  destLocation.value = null;
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
</script>

<template>
  <div class="app-wrapper">
    <AppHeader @home="resetApp" />

    <main class="app-container">
      <div class="layout-grid">
        <!-- Columna Izquierda: Formularios -->
        <div class="forms-column">
          <RouteForm 
            @update:origin="originLocation = $event"
            @update:destination="destLocation = $event"
          />
          <VehicleConfig @update="onVehicleConfigUpdate" />
        </div>
        
        <!-- Columna Derecha: Mapa y Resultados -->
        <div class="results-column">
          <section class="map-section">
            <NativeMap 
              :origin="originLocation ? { lat: originLocation.lat, lon: originLocation.lon } : undefined" 
              :destination="destLocation ? { lat: destLocation.lat, lon: destLocation.lon } : undefined" 
              :route-coordinates="routeData?.coordinates"
              :dark-mode="isDarkMode" 
              @update:origin="updateOriginCoords"
              @update:destination="updateDestCoords"
            />
          </section>

          <!-- Tarjeta de Resultados -->
          <section class="cost-summary" v-if="routeData && currentFuelPrice && computedCosts">
            <div class="summary-header">
              <h2>Coste de Desplazamiento</h2>
              <button class="miteco-badge" @click="showSourcesModal = true" title="Ver detalles y metodología">
                Fuente: MITECO ({{ formatEuroPrice3(currentFuelPrice) }} €/L)
              </button>
            </div>
            
            <div v-if="vehicleConfig?.tripMode === 'ida'" class="cost-numbers single">
              <div class="cost-item main-cost">
                <span class="cost-label">Solo Ida</span>
                <span class="cost-value">{{ formatEuro(computedCosts.perTrip) }} <small>€</small></span>
              </div>
            </div>

            <div v-else-if="vehicleConfig?.tripMode === 'idavuelta'" class="cost-numbers single">
              <div class="cost-item main-cost">
                <span class="cost-label">Ida y Vuelta</span>
                <span class="cost-value">{{ formatEuro(computedCosts.perTrip) }} <small>€</small></span>
              </div>
            </div>

            <div v-else class="cost-numbers">
              <div class="cost-item">
                <span class="cost-label">Mensual</span>
                <span class="cost-value">{{ formatEuro(computedCosts.monthly) }} <small>€</small></span>
              </div>
              <div class="cost-item">
                <span class="cost-label">Anual ({{ vehicleConfig?.activeMonths }} meses)</span>
                <span class="cost-value">{{ formatEuro(computedCosts.annual) }} <small>€</small></span>
              </div>
            </div>
            
            <div class="cost-details">
              <p>Distancia de ruta: <strong>{{ formatEuro(routeData.distanceKm) }} km</strong> (sólo ida)</p>
              <p v-if="vehicleConfig?.includeWear" class="text-muted">
                * Incluye un recargo estimado de 0,08 €/km por desgaste, seguro y mantenimiento.
              </p>
            </div>
          </section>
          
          <div v-else-if="isCalculating" class="placeholder-card">
            <p>Calculando la mejor ruta y precios en tiempo real...</p>
          </div>
          
          <div v-else class="placeholder-card">
            <p>Define el origen y el destino para ver el coste real de tu desplazamiento.</p>
          </div>
        </div>
      </div>
    </main>

    <AppFooter @show-sources="showSourcesModal = true" />
    
    <SourcesModal v-if="showSourcesModal" @close="showSourcesModal = false" />
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
