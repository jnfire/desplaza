<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CustomSelect from './CustomSelect.vue';
import RouteForm from './RouteForm.vue';

export interface VehicleState {
  fuelType: string;
  consumption: number;
  tripMode: 'ida' | 'idavuelta' | 'ciclo';
  daysPerWeek: number;
  activeMonths: number;
  includeWear: boolean;
  priceSource: 'auto' | 'manual';
  manualPrice: number;
}

const props = defineProps<{
  initialState?: Partial<VehicleState>;
}>();

const emit = defineEmits<{
  (e: 'update', state: VehicleState): void;
  (e: 'update:origin', location: { lat: number; lon: number; label: string; provinceSearch: string } | null): void;
  (e: 'update:destination', location: { lat: number; lon: number; label: string; provinceSearch: string } | null): void;
}>();

const priceSource = ref<'auto' | 'manual'>(props.initialState?.priceSource || 'auto');
const manualPrice = ref(props.initialState?.manualPrice || 1.55);
const fuelType = ref(props.initialState?.fuelType || 'Precio Gasolina 95 E5');
const consumption = ref(props.initialState?.consumption || 6.5);
const tripMode = ref<'ida' | 'idavuelta' | 'ciclo'>(props.initialState?.tripMode || 'ciclo');
const daysPerWeek = ref(props.initialState?.daysPerWeek || 5);
const activeMonths = ref(props.initialState?.activeMonths || 11);
const includeWear = ref(props.initialState?.includeWear ?? true);

const { t } = useI18n();

const priceSourceOptions = computed(() => [
  { value: 'auto', label: t('core.source_auto') || 'Automático (España)' },
  { value: 'manual', label: t('core.source_manual') || 'Personalizado' }
]);

const fuelOptions = computed(() => [
  { value: 'Precio Gasolina 95 E5', label: t('core.fuel_gas95') || 'Gasolina 95' },
  { value: 'Precio Gasolina 98 E5', label: t('core.fuel_gas98') || 'Gasolina 98' },
  { value: 'Precio Gasoleo A', label: t('core.fuel_diesel') || 'Diésel' },
  { value: 'Precio Gasoleo Premium', label: t('core.fuel_diesel_prem') || 'Diésel Premium' },
  { value: 'Precio Gases licuados del petróleo', label: t('core.fuel_glp') || 'GLP' }
]);

const emitUpdate = () => {
  emit('update', {
    fuelType: fuelType.value,
    consumption: consumption.value,
    tripMode: tripMode.value,
    daysPerWeek: daysPerWeek.value,
    activeMonths: activeMonths.value,
    includeWear: includeWear.value,
    priceSource: priceSource.value,
    manualPrice: manualPrice.value
  });
};

watch([fuelType, consumption, tripMode, daysPerWeek, activeMonths, includeWear, priceSource, manualPrice], emitUpdate, { deep: true });

emitUpdate();
</script>

<template>
  <div class="configs-wrapper">
    
    <!-- CARD 1: CONFIGURACIÓN DEL VIAJE -->
    <div class="config-card">
      <div class="config-header">
        <h3>{{ $t("core.trip_details") }}</h3>
      </div>
      
      <RouteForm 
        @update:origin="emit('update:origin', $event)"
        @update:destination="emit('update:destination', $event)"
      />
      
      <!-- Modo de Viaje -->
      <div class="mode-selector">
        <label class="radio-label">
          <input type="radio" value="ida" v-model="tripMode" />
          <div class="radio-btn">{{ $t("core.one_way") }}</div>
        </label>
        <label class="radio-label">
          <input type="radio" value="idavuelta" v-model="tripMode" />
          <div class="radio-btn">{{ $t("core.round_trip") }}</div>
        </label>
        <label class="radio-label">
          <input type="radio" value="ciclo" v-model="tripMode" />
          <div class="radio-btn">{{ $t("core.routine") }}</div>
        </label>
      </div>

      <!-- Controles de Ciclo Repetitivo -->
      <div v-if="tripMode === 'ciclo'" class="grid-layout cycle-controls">
        <div class="input-group">
          <label for="daysPerWeek">{{ $t("core.days_week") }}</label>
          <input 
            id="daysPerWeek" 
            type="number" 
            min="1" 
            max="7" 
            v-model="daysPerWeek" 
          />
        </div>

        <div class="input-group">
          <label for="activeMonths">{{ $t("core.months_year") }}</label>
          <input 
            id="activeMonths" 
            type="number" 
            min="1" 
            max="12" 
            v-model="activeMonths" 
            :title="$t('core.active_months_desc')"
          />
        </div>
      </div>
    </div>

    <!-- CARD 2: CONFIGURACIÓN DEL VEHÍCULO -->
    <div class="config-card">
      <div class="config-header">
        <h3>{{ $t("core.your_vehicle") }}</h3>
      </div>

      <div class="grid-layout">
        <div class="input-group">
          <label for="priceSource">{{ $t("core.price_origin") }}</label>
          <CustomSelect id="priceSource" v-model="priceSource" :options="priceSourceOptions" />
        </div>

        <div v-if="priceSource === 'auto'" class="input-group">
          <label for="fuelType">{{ $t("core.fuel_type") }}</label>
          <CustomSelect id="fuelType" v-model="fuelType" :options="fuelOptions" />
        </div>

        <div v-else class="input-group">
          <label for="manualPrice">{{ $t("core.manual_price") }}</label>
          <input 
            id="manualPrice" 
            type="number" 
            step="0.01" 
            min="0" 
            v-model="manualPrice" 
          />
        </div>

        <div class="input-group">
          <label for="consumption">{{ $t("core.consumption_short") }}</label>
          <input 
            id="consumption" 
            type="number" 
            step="0.1" 
            min="0" 
            v-model="consumption" 
          />
        </div>
      </div>

      <div class="toggle-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="includeWear" />
          <span class="checkbox-custom"></span>
          {{ $t("core.include_wear") }}
        </label>
      </div>
    </div>

  </div>
</template>

<style scoped>
.configs-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.config-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--color-bg);
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.config-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.mode-selector {
  display: flex;
  gap: 0.5rem;
  background-color: var(--color-bg);
  padding: 0.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.radio-label {
  flex: 1;
  cursor: pointer;
}

.radio-label input {
  display: none;
}

.radio-btn {
  text-align: center;
  padding: 0.5rem 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

@media (min-width: 400px) {
  .radio-btn {
    font-size: 0.85rem;
    padding: 0.5rem;
  }
}

.radio-label input:checked + .radio-btn {
  background-color: var(--color-primary);
  color: var(--color-bg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.25rem;
}

.cycle-controls {
  padding-top: 0.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

input[type="number"], select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

input[type="number"]:focus, select:focus {
  border-color: var(--color-primary);
}

.toggle-group {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: normal;
  color: var(--color-text-muted);
}

.checkbox-label input {
  display: none;
}

.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input:checked + .checkbox-custom {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid var(--color-bg);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

@media (prefers-color-scheme: dark) {
  .checkbox-label input:checked + .checkbox-custom::after {
    border-color: var(--color-bg);
  }
}
</style>
