<script setup lang="ts">
import { ref, watch } from 'vue';

export interface VehicleState {
  fuelType: string;
  consumption: number;
  tripMode: 'ida' | 'idavuelta' | 'ciclo';
  daysPerWeek: number;
  activeMonths: number;
  includeWear: boolean;
}

const props = defineProps<{
  initialState?: Partial<VehicleState>;
}>();

const emit = defineEmits<{
  (e: 'update', state: VehicleState): void;
}>();

const fuelType = ref(props.initialState?.fuelType || 'Precio Gasolina 95 E5');
const consumption = ref(props.initialState?.consumption || 6.5);
const tripMode = ref<'ida' | 'idavuelta' | 'ciclo'>(props.initialState?.tripMode || 'ciclo');
const daysPerWeek = ref(props.initialState?.daysPerWeek || 5);
const activeMonths = ref(props.initialState?.activeMonths || 11);
const includeWear = ref(props.initialState?.includeWear ?? true);

const emitUpdate = () => {
  emit('update', {
    fuelType: fuelType.value,
    consumption: consumption.value,
    tripMode: tripMode.value,
    daysPerWeek: daysPerWeek.value,
    activeMonths: activeMonths.value,
    includeWear: includeWear.value
  });
};

watch([fuelType, consumption, tripMode, daysPerWeek, activeMonths, includeWear], emitUpdate, { deep: true });

emitUpdate();
</script>

<template>
  <div class="configs-wrapper">
    
    <!-- CARD 1: CONFIGURACIÓN DEL VIAJE -->
    <div class="config-card">
      <div class="config-header">
        <h3>Detalles del Viaje</h3>
      </div>
      
      <!-- Modo de Viaje -->
      <div class="mode-selector">
        <label class="radio-label">
          <input type="radio" value="ida" v-model="tripMode" />
          <div class="radio-btn">Solo Ida</div>
        </label>
        <label class="radio-label">
          <input type="radio" value="idavuelta" v-model="tripMode" />
          <div class="radio-btn">Ida y Vuelta</div>
        </label>
        <label class="radio-label">
          <input type="radio" value="ciclo" v-model="tripMode" />
          <div class="radio-btn">Rutina</div>
        </label>
      </div>

      <!-- Controles de Ciclo Repetitivo -->
      <div v-if="tripMode === 'ciclo'" class="grid-layout cycle-controls">
        <div class="input-group">
          <label for="daysPerWeek">Días a la semana</label>
          <input 
            id="daysPerWeek" 
            type="number" 
            min="1" 
            max="7" 
            v-model="daysPerWeek" 
          />
        </div>

        <div class="input-group">
          <label for="activeMonths">Meses al año</label>
          <input 
            id="activeMonths" 
            type="number" 
            min="1" 
            max="12" 
            v-model="activeMonths" 
            title="Meses en los que realizas esta rutina (excluye vacaciones)"
          />
        </div>
      </div>
    </div>

    <!-- CARD 2: CONFIGURACIÓN DEL VEHÍCULO -->
    <div class="config-card">
      <div class="config-header">
        <h3>Tu Vehículo</h3>
      </div>

      <div class="grid-layout">
        <div class="input-group">
          <label for="fuelType">Combustible</label>
          <select id="fuelType" v-model="fuelType">
            <option value="Precio Gasolina 95 E5">Gasolina 95</option>
            <option value="Precio Gasolina 98 E5">Gasolina 98</option>
            <option value="Precio Gasoleo A">Diésel</option>
            <option value="Precio Gasoleo Premium">Diésel Premium</option>
            <option value="Precio Gases licuados del petróleo">GLP</option>
          </select>
        </div>

        <div class="input-group">
          <label for="consumption">Consumo (L/100km)</label>
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
          Incluir desgaste y mantenimiento (0,08 €/km)
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
