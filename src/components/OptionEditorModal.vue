<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from './BaseModal.vue';
import CustomSelect from './CustomSelect.vue';
import {
  changeOptionKind,
  FUEL_KEYS,
  OPTION_KINDS,
  type OptionKind,
  type TravelOption,
  type TripSettings,
} from '../core/travelOptions';
import { comparableCost, type OptionResult } from '../core/comparison';
import { formatMinutes, formatNumber } from '../utils/format';

const props = defineProps<{
  option: TravelOption;
  isNew: boolean;
  trip: TripSettings;
  /** Calculates the result of the draft with the current route and prices. */
  preview: (option: TravelOption) => OptionResult | null;
}>();

const emit = defineEmits<{
  (e: 'save', option: TravelOption): void;
  (e: 'remove', optionId: string): void;
  (e: 'close'): void;
}>();

const { t, locale } = useI18n();
const fieldPrefix = useId();

// The editor works on a copy; nothing changes until the user saves.
const draft = ref<TravelOption>(JSON.parse(JSON.stringify(props.option)));

const fuelLabelKeys: Record<string, string> = {
  'Precio Gasolina 95 E5': 'core.fuel_gas95',
  'Precio Gasolina 98 E5': 'core.fuel_gas98',
  'Precio Gasoleo A': 'core.fuel_diesel',
  'Precio Gasoleo Premium': 'core.fuel_diesel_prem',
  'Precio Gases licuados del petróleo': 'core.fuel_glp',
};

const fuelOptions = computed(() =>
  FUEL_KEYS.map((key) => ({ value: key, label: t(fuelLabelKeys[key]) })),
);
const priceSourceOptions = computed(() => [
  { value: 'auto', label: t('core.source_auto') },
  { value: 'manual', label: t('core.source_manual') },
]);
const fareTypeOptions = computed(() => [
  { value: 'pass', label: t('editor.fare_pass') },
  { value: 'ticket', label: t('editor.fare_ticket') },
]);

const setKind = (kind: OptionKind) => {
  draft.value = changeOptionKind(draft.value, kind);
};

/** Binds an optional number field: an empty input is stored as null. */
const transitMinutes = computed({
  get: () => (draft.value.kind === 'transit' ? (draft.value.minutesPerLeg ?? '') : ''),
  set: (value: number | string) => {
    if (draft.value.kind !== 'transit') return;
    draft.value.minutesPerLeg = value === '' || value === null ? null : Number(value);
  },
});

type FieldErrors = Partial<Record<string, string>>;

const isNumberIn = (value: unknown, min: number, max: number, minExclusive = false) =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  (minExclusive ? value > min : value >= min) &&
  value <= max;

const errors = computed<FieldErrors>(() => {
  const option = draft.value;
  const found: FieldErrors = {};
  if (!option.name.trim()) found.name = t('editor.error_name');
  if (option.kind === 'transit') {
    if (!isNumberIn(option.price, 0, 10000)) found.price = t('editor.error_amount');
    if (option.minutesPerLeg !== null && !isNumberIn(option.minutesPerLeg, 0, 1440, true)) {
      found.minutesPerLeg = t('editor.error_minutes');
    }
    if (!isNumberIn(option.otherMonthly, 0, 10000)) found.otherMonthly = t('editor.error_amount');
    return found;
  }
  if (!isNumberIn(option.consumption, 0, 100, true)) found.consumption = t('editor.error_positive');
  if (!isNumberIn(option.wearPerKm, 0, 5)) found.wearPerKm = t('editor.error_amount');
  if (!isNumberIn(option.tollPerLeg, 0, 1000)) found.tollPerLeg = t('editor.error_amount');
  if (!isNumberIn(option.parkingPerDay, 0, 1000)) found.parkingPerDay = t('editor.error_amount');
  if (option.kind === 'electric') {
    if (!isNumberIn(option.homePrice, 0, 5)) found.homePrice = t('editor.error_amount');
    if (!isNumberIn(option.publicPrice, 0, 5)) found.publicPrice = t('editor.error_amount');
    if (!isNumberIn(option.publicSharePct, 0, 100))
      found.publicSharePct = t('editor.error_percent');
  } else if (option.priceSource === 'manual' && !isNumberIn(option.manualPrice, 0, 10, true)) {
    found.manualPrice = t('editor.error_positive');
  }
  return found;
});

const hasErrors = computed(() => Object.keys(errors.value).length > 0);
const showErrors = ref(false);
const errorFor = (field: string) => (showErrors.value ? errors.value[field] : undefined);
const fieldId = (field: string) => `${fieldPrefix}-${field}`;

const previewResult = computed(() => (hasErrors.value ? null : props.preview(draft.value)));

const previewText = computed(() => {
  const result = previewResult.value;
  if (!result) return t('editor.preview_no_route');
  if (!result.complete) return t('compare.no_price');
  const cost = formatNumber(comparableCost(result, props.trip), locale.value);
  const period =
    props.trip.tripMode === 'ciclo' ? t('compare.per_month') : t('compare.per_journey');
  const time =
    result.minutesPerJourney === null
      ? t('compare.no_time')
      : formatMinutes(result.minutesPerJourney);
  return `${cost} € ${period} · ${time}`;
});

const save = () => {
  showErrors.value = true;
  if (hasErrors.value) return;
  emit('save', { ...draft.value, name: draft.value.name.trim() });
};

const kindOptions = computed(() =>
  OPTION_KINDS.map((kind) => ({ value: kind, label: t(`options.kinds.${kind}`) })),
);

const kindModel = computed({
  get: () => draft.value.kind,
  set: (kind: string) => setKind(kind as OptionKind),
});
</script>

<template>
  <BaseModal
    :title="isNew ? t('editor.create_title') : t('editor.edit_title')"
    @close="emit('close')"
  >
    <form class="form-area editor" novalidate @submit.prevent="save">
      <div class="input-group">
        <label :for="fieldId('name')">{{ t('editor.name') }}</label>
        <input
          :id="fieldId('name')"
          v-model="draft.name"
          data-autofocus
          class="text-field"
          type="text"
          maxlength="40"
          autocomplete="off"
          :placeholder="t('editor.name_placeholder')"
          :aria-invalid="Boolean(errorFor('name'))"
          :aria-describedby="errorFor('name') ? fieldId('name-error') : undefined"
          @focus="isNew && ($event.target as HTMLInputElement).select()"
        />
        <span v-if="errorFor('name')" :id="fieldId('name-error')" class="field-error" role="alert">
          {{ errorFor('name') }}
        </span>
      </div>

      <div class="input-group">
        <label :for="fieldId('kind')">{{ t('editor.kind') }}</label>
        <CustomSelect :id="fieldId('kind')" v-model="kindModel" :options="kindOptions" />
      </div>

      <!-- Combustion car and motorbike -->
      <div v-if="draft.kind === 'combustion' || draft.kind === 'motorbike'" class="grid-layout">
        <div class="input-group input-group--full">
          <label :for="fieldId('priceSource')">{{ t('core.price_origin') }}</label>
          <CustomSelect
            :id="fieldId('priceSource')"
            v-model="draft.priceSource"
            :options="priceSourceOptions"
          />
        </div>
        <div v-if="draft.priceSource === 'auto'" class="input-group">
          <label :for="fieldId('fuel')">{{ t('core.fuel_type') }}</label>
          <CustomSelect :id="fieldId('fuel')" v-model="draft.fuelType" :options="fuelOptions" />
        </div>
        <div v-else class="input-group">
          <label :for="fieldId('manualPrice')">{{ t('core.manual_price') }}</label>
          <input
            :id="fieldId('manualPrice')"
            v-model.number="draft.manualPrice"
            type="number"
            step="0.001"
            min="0"
            :aria-invalid="Boolean(errorFor('manualPrice'))"
          />
          <span v-if="errorFor('manualPrice')" class="field-error">{{
            errorFor('manualPrice')
          }}</span>
        </div>
        <div class="input-group">
          <label :for="fieldId('consumption')">{{ t('core.consumption_short') }}</label>
          <input
            :id="fieldId('consumption')"
            v-model.number="draft.consumption"
            type="number"
            step="0.1"
            min="0"
            :aria-invalid="Boolean(errorFor('consumption'))"
          />
          <span v-if="errorFor('consumption')" class="field-error">{{
            errorFor('consumption')
          }}</span>
        </div>
      </div>

      <!-- Electric car -->
      <div v-else-if="draft.kind === 'electric'" class="grid-layout">
        <div class="input-group input-group--full">
          <label :for="fieldId('consumption')">{{ t('editor.consumption_kwh') }}</label>
          <input
            :id="fieldId('consumption')"
            v-model.number="draft.consumption"
            type="number"
            step="0.1"
            min="0"
            :aria-invalid="Boolean(errorFor('consumption'))"
          />
          <span v-if="errorFor('consumption')" class="field-error">{{
            errorFor('consumption')
          }}</span>
        </div>
        <div class="input-group">
          <label :for="fieldId('homePrice')">{{ t('editor.home_price') }}</label>
          <input
            :id="fieldId('homePrice')"
            v-model.number="draft.homePrice"
            type="number"
            step="0.001"
            min="0"
            :aria-invalid="Boolean(errorFor('homePrice'))"
          />
        </div>
        <div class="input-group">
          <label :for="fieldId('publicPrice')">{{ t('editor.public_price') }}</label>
          <input
            :id="fieldId('publicPrice')"
            v-model.number="draft.publicPrice"
            type="number"
            step="0.001"
            min="0"
            :aria-invalid="Boolean(errorFor('publicPrice'))"
          />
        </div>
        <div class="input-group input-group--full">
          <label :for="fieldId('publicShare')">{{ t('editor.public_share') }}</label>
          <input
            :id="fieldId('publicShare')"
            v-model.number="draft.publicSharePct"
            type="number"
            step="5"
            min="0"
            max="100"
            :aria-invalid="Boolean(errorFor('publicSharePct'))"
          />
          <span v-if="errorFor('publicSharePct')" class="field-error">
            {{ errorFor('publicSharePct') }}
          </span>
        </div>
        <p class="field-hint input-group--full">{{ t('editor.electricity_hint') }}</p>
      </div>

      <!-- Public transport -->
      <div v-else-if="draft.kind === 'transit'" class="grid-layout">
        <div class="input-group">
          <label :for="fieldId('fareType')">{{ t('editor.fare_type') }}</label>
          <CustomSelect
            :id="fieldId('fareType')"
            v-model="draft.fareType"
            :options="fareTypeOptions"
          />
        </div>
        <div class="input-group">
          <label :for="fieldId('price')">
            {{ draft.fareType === 'pass' ? t('editor.pass_price') : t('editor.ticket_price') }}
          </label>
          <input
            :id="fieldId('price')"
            v-model.number="draft.price"
            type="number"
            step="0.05"
            min="0"
            :aria-invalid="Boolean(errorFor('price'))"
          />
          <span v-if="errorFor('price')" class="field-error">{{ errorFor('price') }}</span>
        </div>
        <div class="input-group input-group--full">
          <label :for="fieldId('minutes')">{{ t('editor.minutes_per_leg') }}</label>
          <input
            :id="fieldId('minutes')"
            v-model="transitMinutes"
            type="number"
            step="1"
            min="1"
            :aria-invalid="Boolean(errorFor('minutesPerLeg'))"
            :aria-describedby="fieldId('minutes-hint')"
          />
          <span v-if="errorFor('minutesPerLeg')" class="field-error">
            {{ errorFor('minutesPerLeg') }}
          </span>
          <span :id="fieldId('minutes-hint')" class="field-hint">{{
            t('editor.minutes_hint')
          }}</span>
        </div>
      </div>

      <details class="more-settings">
        <summary>{{ t('editor.more_settings') }}</summary>
        <div v-if="draft.kind === 'transit'" class="grid-layout">
          <div class="input-group input-group--full">
            <label :for="fieldId('otherMonthly')">{{ t('editor.other_monthly') }}</label>
            <input
              :id="fieldId('otherMonthly')"
              v-model.number="draft.otherMonthly"
              type="number"
              step="1"
              min="0"
              :aria-invalid="Boolean(errorFor('otherMonthly'))"
            />
          </div>
        </div>
        <div v-else class="grid-layout">
          <label class="checkbox-label input-group--full" :for="fieldId('wear')">
            <input
              :id="fieldId('wear')"
              v-model="draft.includeWear"
              type="checkbox"
              class="sr-only-checkbox"
            />
            <span class="checkbox-custom" aria-hidden="true"></span>
            <span>{{ t('editor.include_wear') }}</span>
          </label>
          <div v-if="draft.includeWear" class="input-group input-group--full">
            <label :for="fieldId('wearPerKm')">{{ t('editor.wear_per_km') }}</label>
            <input
              :id="fieldId('wearPerKm')"
              v-model.number="draft.wearPerKm"
              type="number"
              step="0.01"
              min="0"
              :aria-invalid="Boolean(errorFor('wearPerKm'))"
            />
          </div>
          <div class="input-group">
            <label :for="fieldId('toll')">{{ t('editor.toll_per_leg') }}</label>
            <input
              :id="fieldId('toll')"
              v-model.number="draft.tollPerLeg"
              type="number"
              step="0.1"
              min="0"
              :aria-invalid="Boolean(errorFor('tollPerLeg'))"
            />
          </div>
          <div class="input-group">
            <label :for="fieldId('parking')">{{ t('editor.parking_per_day') }}</label>
            <input
              :id="fieldId('parking')"
              v-model.number="draft.parkingPerDay"
              type="number"
              step="0.5"
              min="0"
              :aria-invalid="Boolean(errorFor('parkingPerDay'))"
            />
          </div>
        </div>
      </details>

      <p v-if="showErrors && hasErrors" class="field-error" role="alert">
        {{ t('editor.fix_errors') }}
      </p>

      <!-- Lets Enter in any field submit the form. -->
      <button type="submit" class="sr-only" tabindex="-1" aria-hidden="true"></button>
    </form>

    <template #footer>
      <div class="editor-footer">
        <p class="preview" aria-live="polite">
          <span class="preview-label">{{ t('editor.preview') }}</span>
          <strong>{{ previewText }}</strong>
        </p>
        <div class="editor-actions">
          <button
            v-if="!isNew"
            type="button"
            class="btn btn-danger"
            @click="emit('remove', draft.id)"
          >
            {{ t('options.delete') }}
          </button>
          <span class="spacer"></span>
          <button type="button" class="btn btn-secondary" @click="emit('close')">
            {{ t('editor.cancel') }}
          </button>
          <button type="button" class="btn btn-primary" @click="save">
            {{ isNew ? t('editor.add') : t('editor.save') }}
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.more-settings {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.more-settings summary {
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 1rem;
}

.more-settings:not([open]) summary {
  margin-bottom: 0;
}

.more-settings summary:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.editor-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: baseline;
  font-size: 0.95rem;
  color: var(--text-main);
}

.preview-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 600;
}

.editor-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.spacer {
  flex: 1;
}

.btn {
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.6rem 1.1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 1px solid var(--border-color);
}

.btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.btn-primary {
  background-color: var(--text-main);
  color: var(--bg-body);
  border-color: var(--text-main);
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--bg-body);
  color: var(--text-main);
}

.btn-secondary:hover {
  background-color: var(--bg-surface-hover);
}

.btn-danger {
  background: transparent;
  color: var(--error-color);
  border-color: transparent;
  padding-left: 0;
}

.btn-danger:hover {
  text-decoration: underline;
}
</style>
