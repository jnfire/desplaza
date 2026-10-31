<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { MAX_OPTIONS, type TravelOption, type TripSettings } from '../core/travelOptions';
import { comparableCost, rankResults, type OptionResult, type SortKey } from '../core/comparison';
import { formatMinutes, formatNumber } from '../utils/format';
import OptionActions from './OptionActions.vue';

const props = defineProps<{
  options: TravelOption[];
  /** Results by option id; empty while there is no route. */
  results: Record<string, OptionResult>;
  trip: TripSettings;
  distanceKm: number | null;
  isCalculating: boolean;
  sortKey: SortKey;
  hourValue: number;
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'edit', optionId: string): void;
  (e: 'duplicate', optionId: string): void;
  (e: 'remove', optionId: string): void;
  (e: 'update:sortKey', sortKey: SortKey): void;
  (e: 'update:hourValue', hourValue: number): void;
}>();

const { t, locale } = useI18n();

const hasRoute = computed(() => props.distanceKm !== null);
const isComparing = computed(() => props.options.length > 1);
const canAdd = computed(() => props.options.length < MAX_OPTIONS);
const isRecurring = computed(() => props.trip.tripMode === 'ciclo');

const euro = (value: number) => formatNumber(value, locale.value);

const optionById = computed(() => new Map(props.options.map((option) => [option.id, option])));

const ranked = computed(() => {
  const results = props.options
    .map((option) => props.results[option.id])
    .filter((result): result is OptionResult => Boolean(result));
  return rankResults(results, props.trip, props.sortKey, props.hourValue);
});

/** The best option only counts when its value for the criterion is known. */
const bestId = computed(() => {
  const first = ranked.value[0];
  if (!first || !first.complete) return null;
  if (props.sortKey !== 'cost' && first.minutesPerJourney === null) return null;
  return first.optionId;
});

const bestResult = computed(() =>
  bestId.value ? ranked.value.find((result) => result.optionId === bestId.value) : undefined,
);

const fuelLabelKeys: Record<string, string> = {
  'Precio Gasolina 95 E5': 'core.fuel_gas95',
  'Precio Gasolina 98 E5': 'core.fuel_gas98',
  'Precio Gasoleo A': 'core.fuel_diesel',
  'Precio Gasoleo Premium': 'core.fuel_diesel_prem',
  'Precio Gases licuados del petróleo': 'core.fuel_glp',
};

/** The detail that tells two options of the same kind apart. */
const describe = (option: TravelOption): string => {
  if (option.kind === 'transit') {
    return option.fareType === 'pass'
      ? t('editor.fare_pass')
      : t('compare.desc_ticket', { price: euro(option.price) });
  }
  const consumption = formatNumber(option.consumption, locale.value, 1);
  if (option.kind === 'electric')
    return `${t('options.kinds.electric')} · ${consumption} kWh/100 km`;
  const fuel =
    option.priceSource === 'manual'
      ? t('compare.manual_price_short')
      : t(fuelLabelKeys[option.fuelType]);
  return `${fuel} · ${consumption} L/100 km`;
};

const costText = (result: OptionResult) =>
  result.complete ? `${euro(comparableCost(result, props.trip))} €` : t('compare.no_price');

const timeText = (result: OptionResult) =>
  result.minutesPerJourney === null
    ? t('compare.no_time')
    : formatMinutes(result.minutesPerJourney);

const periodText = computed(() =>
  isRecurring.value ? t('compare.per_month') : t('compare.per_journey'),
);

/** How much more a result costs than the best one: per year for commutes, else per journey. */
const extraAmount = (result: OptionResult): number | null => {
  const best = bestResult.value;
  if (!best || result.optionId === best.optionId || !result.complete) return null;
  const difference = isRecurring.value
    ? result.annual - best.annual
    : comparableCost(result, props.trip) - comparableCost(best, props.trip);
  return difference > 0.005 ? difference : null;
};

const yearText = (result: OptionResult) =>
  result.complete ? `${euro(result.annual)} €` : t('compare.no_price');

const energyText = (option: TravelOption, result: OptionResult): string | null => {
  if (option.kind === 'transit' || result.energyPrice === null) return null;
  if (option.kind === 'electric')
    return `${formatNumber(result.energyPrice, locale.value, 3)} €/kWh`;
  const source =
    option.priceSource === 'manual' ? t('core.source_manual_label') : t('core.source_miteco_label');
  return `${formatNumber(result.energyPrice, locale.value, 3)} €/L · ${source}`;
};

const sortOptions: { value: SortKey; labelKey: string }[] = [
  { value: 'cost', labelKey: 'compare.sort_cost' },
  { value: 'time', labelKey: 'compare.sort_time' },
  { value: 'balance', labelKey: 'compare.sort_balance' },
];

const onHourValue = (event: Event) => {
  const value = (event.target as HTMLInputElement).valueAsNumber;
  if (Number.isFinite(value) && value >= 0 && value <= 1000) emit('update:hourValue', value);
};

const single = computed(() => {
  const option = props.options[0];
  return option ? { option, result: props.results[option.id] } : null;
});
</script>

<template>
  <section class="options-panel card" :aria-labelledby="'options-title'">
    <header class="panel-header">
      <h2 id="options-title">{{ isComparing ? t('compare.title') : t('core.calc_cost') }}</h2>
      <button type="button" class="btn-add" :disabled="!canAdd" @click="emit('add')">
        <span aria-hidden="true">+</span> {{ t('options.add') }}
      </button>
    </header>
    <p v-if="!canAdd" class="field-hint">{{ t('options.max_reached', { max: MAX_OPTIONS }) }}</p>

    <p v-if="!hasRoute && isCalculating" class="placeholder" role="status" aria-live="polite">
      {{ t('core.calc_loading') }}
    </p>
    <p v-else-if="!hasRoute" class="placeholder">{{ t('core.define_route') }}</p>

    <!-- One option: the large summary of the first versions. -->
    <template v-if="!isComparing && single">
      <div class="single-head">
        <div>
          <h3 class="option-name">{{ single.option.name }}</h3>
          <p class="option-desc">{{ describe(single.option) }}</p>
        </div>
        <OptionActions
          :name="single.option.name"
          :can-duplicate="canAdd"
          :can-remove="false"
          @edit="emit('edit', single.option.id)"
          @duplicate="emit('duplicate', single.option.id)"
        />
      </div>

      <template v-if="hasRoute && single.result">
        <div v-if="single.result.complete" class="cost-numbers" :class="{ single: !isRecurring }">
          <template v-if="isRecurring">
            <div class="cost-item">
              <span class="cost-label">{{ t('core.monthly') }}</span>
              <span class="cost-value">{{ euro(single.result.monthly) }} <small>€</small></span>
            </div>
            <div class="cost-item">
              <span class="cost-label">
                {{ t('core.annual') }}
                <template v-if="trip.activeMonths !== 12">({{ trip.activeMonths }}m)</template>
              </span>
              <span class="cost-value">{{ euro(single.result.annual) }} <small>€</small></span>
            </div>
          </template>
          <div v-else class="cost-item">
            <span class="cost-label">
              {{ trip.tripMode === 'ida' ? t('core.one_way') : t('core.round_trip') }}
            </span>
            <span class="cost-value">{{ euro(single.result.perJourney) }} <small>€</small></span>
          </div>
        </div>
        <p v-else class="placeholder">{{ t('compare.no_price_hint') }}</p>

        <div class="cost-details">
          <p>
            {{ t('core.route_dist') }}
            <strong>{{ formatNumber(distanceKm ?? 0, locale) }} km</strong>
            {{ t('core.one_way_only') }}
            <template v-if="single.result.minutesPerJourney !== null">
              · {{ t('compare.time_label') }}
              <strong>{{ formatMinutes(single.result.minutesPerJourney) }}</strong>
            </template>
          </p>
          <p v-if="energyText(single.option, single.result)" class="text-muted">
            {{ energyText(single.option, single.result) }}
          </p>
        </div>
      </template>

      <p class="compare-hint">{{ t('options.compare_hint') }}</p>
    </template>

    <!-- Two or more options: ranked comparison. -->
    <template v-else-if="isComparing">
      <div class="sort-bar">
        <div
          class="mode-selector sort-selector"
          role="radiogroup"
          :aria-label="t('compare.sort_by')"
        >
          <label v-for="sort in sortOptions" :key="sort.value" class="radio-label">
            <input
              type="radio"
              name="compare-sort"
              :value="sort.value"
              :checked="sortKey === sort.value"
              class="sr-only-radio"
              @change="emit('update:sortKey', sort.value)"
            />
            <div class="radio-btn" :class="{ 'radio-btn--checked': sortKey === sort.value }">
              {{ t(sort.labelKey) }}
            </div>
          </label>
        </div>
        <label v-if="sortKey === 'balance'" class="hour-value">
          <span>{{ t('compare.hour_value') }}</span>
          <input
            type="number"
            min="0"
            max="1000"
            step="1"
            :value="hourValue"
            @input="onHourValue"
          />
        </label>
      </div>

      <div
        v-if="hasRoute"
        class="table-head"
        :class="{ 'has-year': isRecurring }"
        aria-hidden="true"
      >
        <span class="head-main">{{ t('compare.col_option') }}</span>
        <span class="head-cost">
          {{ isRecurring ? t('compare.col_month') : t('compare.col_journey') }}
        </span>
        <span v-if="isRecurring" class="head-year">{{ t('compare.col_year') }}</span>
        <span class="head-time">{{ t('compare.sort_time') }}</span>
        <span class="head-extra">
          {{ isRecurring ? t('compare.col_extra_year') : t('compare.col_extra_journey') }}
        </span>
      </div>

      <ol class="option-list">
        <li
          v-for="option in hasRoute ? ranked.map((r) => optionById.get(r.optionId)!) : options"
          :key="option.id"
          class="option-row"
          :class="{
            'option-row--best': hasRoute && option.id === bestId,
            'has-year': isRecurring,
          }"
        >
          <div class="row-main">
            <span v-if="hasRoute && option.id === bestId" class="best-tag">
              {{ t('compare.best') }}
            </span>
            <h3 class="option-name">{{ option.name }}</h3>
            <p class="option-desc">{{ describe(option) }}</p>
          </div>

          <template v-if="hasRoute && results[option.id]">
            <div class="cell cell-cost">
              <span class="row-cost">{{ costText(results[option.id]) }}</span>
              <span class="cell-unit">{{ periodText }}</span>
            </div>
            <div v-if="isRecurring" class="cell cell-year">
              <span class="cell-value">{{ yearText(results[option.id]) }}</span>
              <span class="cell-unit">{{ t('compare.unit_year') }}</span>
            </div>
            <div class="cell cell-time">
              <span class="sr-only">{{ t('compare.sort_time') }}: </span>
              <span class="cell-value">{{ timeText(results[option.id]) }}</span>
            </div>
            <div class="cell cell-extra">
              <template v-if="extraAmount(results[option.id]) !== null">
                <span class="cell-value">+{{ euro(extraAmount(results[option.id])!) }} €</span>
                <span class="cell-unit">{{ t('compare.unit_vs_best') }}</span>
              </template>
            </div>
          </template>

          <OptionActions
            :name="option.name"
            :can-duplicate="canAdd"
            :can-remove="true"
            @edit="emit('edit', option.id)"
            @duplicate="emit('duplicate', option.id)"
            @remove="emit('remove', option.id)"
          />
        </li>
      </ol>

      <div v-if="hasRoute" class="cost-details text-muted">
        <p>
          {{ t('core.route_dist') }}
          <strong>{{ formatNumber(distanceKm ?? 0, locale) }} km</strong>
          {{ t('core.one_way_only') }}
        </p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.options-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.panel-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.btn-add {
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-body);
  color: var(--text-main);
  cursor: pointer;
  white-space: nowrap;
}

.btn-add:hover:not(:disabled) {
  background: var(--bg-surface-hover);
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.placeholder {
  color: var(--text-muted);
  text-align: center;
  padding: 1rem 0;
}

.single-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.option-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
  overflow-wrap: anywhere;
}

.option-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.cost-numbers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
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
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.cost-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-main);
  white-space: nowrap;
}

.cost-value small {
  font-size: 1.25rem;
  color: var(--text-muted);
}

.cost-details {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.text-muted {
  color: var(--text-muted);
}

.compare-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.sort-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
}

.sort-selector {
  flex: 1;
  min-width: 240px;
}

.hour-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.hour-value input {
  width: 5rem;
  padding: 0.4rem 0.6rem;
  font: inherit;
  color: var(--text-main);
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.option-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.table-head {
  display: none;
}

.option-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'main cost'
    'year time'
    'extra extra'
    'actions actions';
  gap: 0.75rem 1rem;
  align-items: center;
  padding: 1rem;
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.option-row--best {
  border: 2px solid var(--accent-color);
  padding: calc(1rem - 1px);
}

.row-main {
  grid-area: main;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

/* Always above the name, so its position does not depend on the name's length. */
.best-tag {
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
  background: var(--accent-color);
  color: var(--bg-body);
  margin-bottom: 0.25rem;
}

.cell {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  min-width: 0;
}

.cell-cost {
  grid-area: cost;
  justify-self: end;
}

.cell-year {
  grid-area: year;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.cell-time {
  grid-area: time;
  justify-self: end;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.cell-extra {
  grid-area: extra;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.cell-extra:empty {
  display: none;
}

.cell-unit {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.row-cost {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
}

.option-row > :deep(.option-actions) {
  grid-area: actions;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding-top: 0.75rem;
}

/* Wide panels: the list becomes a table with aligned columns, so the figures of
   different options line up and are easy to compare. The labels move to the header. */
@media (min-width: 760px) {
  .table-head,
  .option-row {
    --columns: minmax(0, 2fr) minmax(6.5rem, 1fr) minmax(5.5rem, 0.8fr) minmax(9rem, 1fr) 8rem;
    --areas: 'main cost time extra actions';
    grid-template-columns: var(--columns);
    grid-template-areas: var(--areas);
    column-gap: 1.25rem;
  }

  .table-head.has-year,
  .option-row.has-year {
    --columns: minmax(0, 2fr) minmax(6.5rem, 1fr) minmax(6.5rem, 1fr) minmax(5.5rem, 0.8fr)
      minmax(9rem, 1fr) 8rem;
    --areas: 'main cost year time extra actions';
  }

  .table-head {
    display: grid;
    /* Same horizontal inset as a row: its border plus its padding. */
    padding: 0 calc(1.25rem + 1px);
    /* Sit close to the rows, cancelling most of the panel's gap. */
    margin-bottom: -0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .head-main {
    grid-area: main;
  }

  .head-cost {
    grid-area: cost;
  }

  .head-year {
    grid-area: year;
  }

  .head-time {
    grid-area: time;
  }

  .head-extra {
    grid-area: extra;
  }

  .head-cost,
  .head-year,
  .head-time,
  .head-extra {
    text-align: right;
  }

  .option-row {
    padding: 1.25rem;
    align-items: center;
  }

  .option-row--best {
    padding: calc(1.25rem - 1px);
  }

  .cell {
    justify-self: stretch;
    justify-content: flex-end;
    text-align: right;
  }

  .cell-year,
  .cell-time,
  .cell-extra {
    font-size: 0.95rem;
  }

  .cell-extra {
    flex-wrap: nowrap;
  }

  /* The header names each column, so the unit is only kept for screen readers. */
  .cell-unit {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .option-row > :deep(.option-actions) {
    border-top: none;
    padding-top: 0;
  }
}

@media (max-width: 600px) {
  .options-panel {
    padding: 1.25rem 1rem;
  }

  .cost-value {
    font-size: 2rem;
  }
}
</style>
