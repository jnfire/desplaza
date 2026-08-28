<!-- src/components/RouteForm.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { geocodeAddress, type GeocodeResult } from '../services/routing';

const props = defineProps<{
  originLabel?: string;
  destinationLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:origin', location: { lat: number; lon: number; label: string; provinceSearch: string } | null): void;
  (e: 'update:destination', location: { lat: number; lon: number; label: string; provinceSearch: string } | null): void;
}>();

const { t } = useI18n();

const originInput = ref(props.originLabel || '');
const destinationInput = ref(props.destinationLabel || '');

const originSuggestions = ref<GeocodeResult[]>([]);
const destinationSuggestions = ref<GeocodeResult[]>([]);

const highlightedOriginIndex = ref<number>(-1);
const highlightedDestIndex = ref<number>(-1);

const isSearchingOrigin = ref(false);
const isSearchingDest = ref(false);

let originTimeout: ReturnType<typeof setTimeout>;
let destTimeout: ReturnType<typeof setTimeout>;

const onInputOrigin = () => {
  clearTimeout(originTimeout);
  highlightedOriginIndex.value = -1;
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
  highlightedDestIndex.value = -1;
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

const selectOrigin = (suggestion: GeocodeResult) => {
  originInput.value = suggestion.label;
  originSuggestions.value = [];
  highlightedOriginIndex.value = -1;
  emit('update:origin', { lat: suggestion.lat, lon: suggestion.lon, label: suggestion.label, provinceSearch: suggestion.name });
};

const selectDestination = (suggestion: GeocodeResult) => {
  destinationInput.value = suggestion.label;
  destinationSuggestions.value = [];
  highlightedDestIndex.value = -1;
  emit('update:destination', { lat: suggestion.lat, lon: suggestion.lon, label: suggestion.label, provinceSearch: suggestion.name });
};

const clearOrigin = () => {
  originInput.value = '';
  originSuggestions.value = [];
  highlightedOriginIndex.value = -1;
  emit('update:origin', null);
};

const clearDestination = () => {
  destinationInput.value = '';
  destinationSuggestions.value = [];
  highlightedDestIndex.value = -1;
  emit('update:destination', null);
};

const handleOriginKeydown = (event: KeyboardEvent) => {
  if (originSuggestions.value.length === 0) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    highlightedOriginIndex.value = (highlightedOriginIndex.value + 1) % originSuggestions.value.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    highlightedOriginIndex.value = (highlightedOriginIndex.value - 1 + originSuggestions.value.length) % originSuggestions.value.length;
  } else if (event.key === 'Enter') {
    if (highlightedOriginIndex.value >= 0 && highlightedOriginIndex.value < originSuggestions.value.length) {
      event.preventDefault();
      selectOrigin(originSuggestions.value[highlightedOriginIndex.value]);
    }
  } else if (event.key === 'Escape') {
    event.preventDefault();
    originSuggestions.value = [];
    highlightedOriginIndex.value = -1;
  }
};

const handleDestKeydown = (event: KeyboardEvent) => {
  if (destinationSuggestions.value.length === 0) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    highlightedDestIndex.value = (highlightedDestIndex.value + 1) % destinationSuggestions.value.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    highlightedDestIndex.value = (highlightedDestIndex.value - 1 + destinationSuggestions.value.length) % destinationSuggestions.value.length;
  } else if (event.key === 'Enter') {
    if (highlightedDestIndex.value >= 0 && highlightedDestIndex.value < destinationSuggestions.value.length) {
      event.preventDefault();
      selectDestination(destinationSuggestions.value[highlightedDestIndex.value]);
    }
  } else if (event.key === 'Escape') {
    event.preventDefault();
    destinationSuggestions.value = [];
    highlightedDestIndex.value = -1;
  }
};
</script>

<template>
  <div class="route-form">
    <!-- Origen Input Group -->
    <div class="input-group">
      <label for="origin-input">{{ t('core.origin') }}</label>
      <div class="input-wrapper">
        <input 
          id="origin-input" 
          type="text" 
          v-model="originInput" 
          @input="onInputOrigin"
          @keydown="handleOriginKeydown"
          :placeholder="t('core.origin_ph')"
          autocomplete="off"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="originSuggestions.length > 0"
          :aria-controls="originSuggestions.length > 0 ? 'origin-suggestions-list' : undefined"
          :aria-activedescendant="highlightedOriginIndex >= 0 ? `origin-option-${highlightedOriginIndex}` : undefined"
        />
        <button 
          v-if="originInput" 
          type="button"
          class="clear-btn" 
          @click="clearOrigin"
          :aria-label="t('core.clear_origin')"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      
      <ul 
        v-if="originSuggestions.length > 0" 
        id="origin-suggestions-list"
        class="suggestions-list"
        role="listbox"
        :aria-label="t('core.origin')"
      >
        <li 
          v-for="(suggestion, index) in originSuggestions" 
          :key="index" 
          :id="`origin-option-${index}`"
          role="option"
          :aria-selected="highlightedOriginIndex === index"
          class="suggestion-item"
          :class="{ 'suggestion-item--active': highlightedOriginIndex === index }"
          @click="selectOrigin(suggestion)"
          @mouseenter="highlightedOriginIndex = index"
        >
          {{ suggestion.label }}
        </li>
      </ul>
      <span v-if="isSearchingOrigin" class="loading-text" role="status" aria-live="polite">
        {{ t('core.searching') }}
      </span>
    </div>

    <!-- Destino Input Group -->
    <div class="input-group">
      <label for="destination-input">{{ t('core.dest') }}</label>
      <div class="input-wrapper">
        <input 
          id="destination-input" 
          type="text" 
          v-model="destinationInput" 
          @input="onInputDest"
          @keydown="handleDestKeydown"
          :placeholder="t('core.dest_ph')"
          autocomplete="off"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="destinationSuggestions.length > 0"
          :aria-controls="destinationSuggestions.length > 0 ? 'destination-suggestions-list' : undefined"
          :aria-activedescendant="highlightedDestIndex >= 0 ? `dest-option-${highlightedDestIndex}` : undefined"
        />
        <button 
          v-if="destinationInput" 
          type="button"
          class="clear-btn" 
          @click="clearDestination"
          :aria-label="t('core.clear_dest')"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      
      <ul 
        v-if="destinationSuggestions.length > 0" 
        id="destination-suggestions-list"
        class="suggestions-list"
        role="listbox"
        :aria-label="t('core.dest')"
      >
        <li 
          v-for="(suggestion, index) in destinationSuggestions" 
          :key="index" 
          :id="`dest-option-${index}`"
          role="option"
          :aria-selected="highlightedDestIndex === index"
          class="suggestion-item"
          :class="{ 'suggestion-item--active': highlightedDestIndex === index }"
          @click="selectDestination(suggestion)"
          @mouseenter="highlightedDestIndex = index"
        >
          {{ suggestion.label }}
        </li>
      </ul>
      <span v-if="isSearchingDest" class="loading-text" role="status" aria-live="polite">
        {{ t('core.searching') }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.route-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  transition: all 0.2s ease-in-out;
  font-family: inherit;
}

input:focus,
input:focus-visible {
  border-color: var(--color-primary);
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
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
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: var(--color-text);
}

.clear-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
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
  padding: 0.25rem 0;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.15s ease;
  color: var(--color-text);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item--active {
  background-color: var(--color-bg-hover);
}

.loading-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  position: absolute;
  right: 2.5rem;
  top: 2.3rem;
}
</style>
