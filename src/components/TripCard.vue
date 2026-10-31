<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RouteForm from './RouteForm.vue';
import type { TripMode, TripSettings } from '../core/travelOptions';

type PlaceUpdate = { lat: number; lon: number; label: string; provinceSearch: string } | null;

const props = defineProps<{
  trip: TripSettings;
  originLabel?: string;
  destinationLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:trip', trip: TripSettings): void;
  (e: 'update:origin', location: PlaceUpdate): void;
  (e: 'update:destination', location: PlaceUpdate): void;
}>();

const { t } = useI18n();

const tripModes: { value: TripMode; labelKey: string }[] = [
  { value: 'ida', labelKey: 'core.one_way' },
  { value: 'idavuelta', labelKey: 'core.round_trip' },
  { value: 'ciclo', labelKey: 'core.routine' },
];

const clampInteger = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

const setTripMode = (tripMode: TripMode) => emit('update:trip', { ...props.trip, tripMode });

// While typing, only emit values already in range; on change, clamp whatever is left.
const previewDays = (event: Event) => {
  const value = (event.target as HTMLInputElement).valueAsNumber;
  if (Number.isInteger(value) && value >= 1 && value <= 7) {
    emit('update:trip', { ...props.trip, daysPerWeek: value });
  }
};

const previewMonths = (event: Event) => {
  const value = (event.target as HTMLInputElement).valueAsNumber;
  if (Number.isInteger(value) && value >= 1 && value <= 12) {
    emit('update:trip', { ...props.trip, activeMonths: value });
  }
};

const setDays = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const daysPerWeek = clampInteger(input.valueAsNumber, 1, 7, props.trip.daysPerWeek);
  // Also rewrite the field: the prop may not change if the clamped value equals the current one.
  input.value = String(daysPerWeek);
  emit('update:trip', { ...props.trip, daysPerWeek });
};

const setMonths = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const activeMonths = clampInteger(input.valueAsNumber, 1, 12, props.trip.activeMonths);
  input.value = String(activeMonths);
  emit('update:trip', { ...props.trip, activeMonths });
};
</script>

<template>
  <section class="config-card form-area" :aria-labelledby="'trip-card-title'">
    <div class="config-header">
      <h3 id="trip-card-title">{{ t('core.trip_details') }}</h3>
    </div>

    <RouteForm
      :origin-label="originLabel"
      :destination-label="destinationLabel"
      @update:origin="emit('update:origin', $event)"
      @update:destination="emit('update:destination', $event)"
    />

    <fieldset class="mode-selector-fieldset">
      <legend class="sr-only">{{ t('core.trip_type') }}</legend>
      <div class="mode-selector" role="radiogroup" :aria-label="t('core.trip_type')">
        <label v-for="mode in tripModes" :key="mode.value" class="radio-label">
          <input
            type="radio"
            name="tripMode"
            :value="mode.value"
            :checked="trip.tripMode === mode.value"
            class="sr-only-radio"
            @change="setTripMode(mode.value)"
          />
          <div class="radio-btn" :class="{ 'radio-btn--checked': trip.tripMode === mode.value }">
            {{ t(mode.labelKey) }}
          </div>
        </label>
      </div>
    </fieldset>

    <div v-if="trip.tripMode === 'ciclo'" class="grid-layout cycle-controls">
      <div class="input-group">
        <label for="daysPerWeek">{{ t('core.days_week') }}</label>
        <input
          id="daysPerWeek"
          type="number"
          min="1"
          max="7"
          :value="trip.daysPerWeek"
          @input="previewDays"
          @change="setDays"
        />
      </div>

      <div class="input-group">
        <label for="activeMonths">{{ t('core.months_year') }}</label>
        <input
          id="activeMonths"
          type="number"
          min="1"
          max="12"
          :value="trip.activeMonths"
          :title="t('core.active_months_desc')"
          @input="previewMonths"
          @change="setMonths"
        />
      </div>
    </div>
  </section>
</template>
