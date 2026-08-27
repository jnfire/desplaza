<script setup lang="ts">
import { ref } from 'vue';
import { geocodeAddress, type GeocodeResult } from '../services/routing';

const props = defineProps<{
  originLabel?: string;
  destinationLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:origin', location: { lat: number; lon: number; label: string; provinceSearch: string } | null): void;
  (e: 'update:destination', location: { lat: number; lon: number; label: string; provinceSearch: string } | null): void;
}>();

const originInput = ref(props.originLabel || '');
const destinationInput = ref(props.destinationLabel || '');

const originSuggestions = ref<GeocodeResult[]>([]);
const destinationSuggestions = ref<GeocodeResult[]>([]);

const isSearchingOrigin = ref(false);
const isSearchingDest = ref(false);

let originTimeout: ReturnType<typeof setTimeout>;
let destTimeout: ReturnType<typeof setTimeout>;

const onInputOrigin = () => {
  clearTimeout(originTimeout);
  if (originInput.value.length < 3) {
    originSuggestions.value = [];
    return;
  }
  isSearchingOrigin.value = true;
  originTimeout = setTimeout(async () => {
    originSuggestions.value = await geocodeAddress(originInput.value);
    isSearchingOrigin.value = false;
  }, 400);
};

const onInputDest = () => {
  clearTimeout(destTimeout);
  if (destinationInput.value.length < 3) {
    destinationSuggestions.value = [];
    return;
  }
  isSearchingDest.value = true;
  destTimeout = setTimeout(async () => {
    destinationSuggestions.value = await geocodeAddress(destinationInput.value);
    isSearchingDest.value = false;
  }, 400);
};

const selectOrigin = (s: GeocodeResult) => {
  originInput.value = s.label;
  originSuggestions.value = [];
  emit('update:origin', { lat: s.lat, lon: s.lon, label: s.label, provinceSearch: s.name });
};

const selectDestination = (s: GeocodeResult) => {
  destinationInput.value = s.label;
  destinationSuggestions.value = [];
  emit('update:destination', { lat: s.lat, lon: s.lon, label: s.label, provinceSearch: s.name });
};

const clearOrigin = () => {
  originInput.value = '';
  originSuggestions.value = [];
  emit('update:origin', null);
};

const clearDestination = () => {
  destinationInput.value = '';
  destinationSuggestions.value = [];
  emit('update:destination', null);
};
</script>

<template>
  <div class="route-form">
    <div class="input-group">
      <label for="origin">{{ $t("core.origin") }}</label>
      <div class="input-wrapper">
        <input 
          id="origin" 
          type="text" 
          v-model="originInput" 
          @input="onInputOrigin"
          :placeholder="$t('core.origin_ph')"
          autocomplete="off"
        />
        <button v-if="originInput" class="clear-btn" @click="clearOrigin">×</button>
      </div>
      
      <ul v-if="originSuggestions.length > 0" class="suggestions-list">
        <li 
          v-for="(s, idx) in originSuggestions" 
          :key="idx" 
          @click="selectOrigin(s)"
        >
          {{ s.label }}
        </li>
      </ul>
      <span v-if="isSearchingOrigin" class="loading-text">Buscando...</span>
    </div>

    <div class="input-group">
      <label for="destination">{{ $t("core.dest") }}</label>
      <div class="input-wrapper">
        <input 
          id="destination" 
          type="text" 
          v-model="destinationInput" 
          @input="onInputDest"
          :placeholder="$t('core.dest_ph')"
          autocomplete="off"
        />
        <button v-if="destinationInput" class="clear-btn" @click="clearDestination">×</button>
      </div>
      
      <ul v-if="destinationSuggestions.length > 0" class="suggestions-list">
        <li 
          v-for="(s, idx) in destinationSuggestions" 
          :key="idx" 
          @click="selectDestination(s)"
        >
          {{ s.label }}
        </li>
      </ul>
      <span v-if="isSearchingDest" class="loading-text">Buscando...</span>
    </div>
  </div>
</template>

<style scoped>
.route-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--color-bg);
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

input:focus {
  border-color: var(--color-primary);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  color: var(--color-text);
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.suggestions-list li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--color-border);
}

.suggestions-list li:last-child {
  border-bottom: none;
}

.suggestions-list li:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

@media (prefers-color-scheme: dark) {
  .suggestions-list li:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.loading-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  position: absolute;
  right: 2.5rem;
  top: 2.3rem;
}
</style>
