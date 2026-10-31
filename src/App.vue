<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import NativeMap from './components/NativeMap.vue';
import TripCard from './components/TripCard.vue';
import OptionsPanel from './components/OptionsPanel.vue';
import OptionEditorModal from './components/OptionEditorModal.vue';
import SourcesModal from './components/SourcesModal.vue';
import SettingsView from './components/SettingsView.vue';

import { getRouteData, type RouteData } from './services/routing';
import { getAverageFuelPricesByProvince, getProvinces, type Province } from './services/miteco';
import { encodeStateToUrl, decodeUrlToState } from './services/shareUrl';
import {
  createOption,
  DEFAULT_TRIP,
  duplicateOption,
  FUEL_KEYS,
  MAX_OPTIONS,
  uniqueName,
  type FuelKey,
  type OptionKind,
  type TravelOption,
  type TripSettings,
} from './core/travelOptions';
import { calculateOption, type OptionResult, type SortKey } from './core/comparison';
import { loadComparison, saveComparison } from './core/persistence';

type Place = { lat: number; lon: number; label: string; provinceSearch: string };

const { t } = useI18n();
const isDarkMode = ref(false);
const showSourcesModal = ref(false);
const showSettings = ref(false);

const browserStorage = typeof window !== 'undefined' ? window.localStorage : undefined;
const urlState = typeof window !== 'undefined' ? decodeUrlToState() : null;
const savedState = loadComparison(browserStorage);

const toPlace = (place?: { lat: number; lon: number; label: string }): Place | null =>
  place ? { ...place, provinceSearch: place.label } : null;

const defaultName = (kind: OptionKind) => t(`options.default_names.${kind}`);

/** Options from a shared link or storage may come without a name. */
const withNames = (options: TravelOption[]): TravelOption[] =>
  options.reduce<TravelOption[]>((named, option) => {
    const name = option.name.trim() || uniqueName(defaultName(option.kind), named);
    return [...named, { ...option, name }];
  }, []);

// A shared link wins over what this device saved; otherwise start with one car.
const originLocation = ref<Place | null>(toPlace(urlState?.origin));
const destLocation = ref<Place | null>(toPlace(urlState?.destination));
const trip = ref<TripSettings>(urlState?.trip ?? savedState?.trip ?? { ...DEFAULT_TRIP });
const options = ref<TravelOption[]>(
  withNames(
    (urlState?.options ?? savedState?.options ?? [createOption('combustion', '')]).slice(
      0,
      MAX_OPTIONS,
    ),
  ),
);

const sortKey = ref<SortKey>('cost');
const hourValue = ref(10);

const routeData = ref<RouteData | null>(null);
const provincesList = ref<Province[]>([]);
const fuelPrices = ref<Partial<Record<FuelKey, number>>>({});
const isCalculating = ref(false);

const isDesktop = ref(typeof window !== 'undefined' ? window.innerWidth >= 900 : true);
const isMapVisibleMobile = ref(false);
const mobileMapRef = ref<InstanceType<typeof NativeMap> | null>(null);

const onResize = () => {
  isDesktop.value = window.innerWidth >= 900;
};

onMounted(async () => {
  window.addEventListener('resize', onResize);
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkMode.value = mediaQuery.matches;
    mediaQuery.addEventListener('change', (event) => {
      isDarkMode.value = event.matches;
    });
  }
  provincesList.value = await getProvinces();
});

onUnmounted(() => window.removeEventListener('resize', onResize));

// Keep the comparison on this device between visits.
watch(
  [trip, options],
  () => saveComparison(browserStorage, { trip: trip.value, options: options.value }),
  {
    deep: true,
  },
);

watch(
  [originLocation, destLocation],
  async ([origin, destination]) => {
    if (origin && destination) {
      isCalculating.value = true;
      routeData.value = await getRouteData(
        origin.lon,
        origin.lat,
        destination.lon,
        destination.lat,
      );
      isCalculating.value = false;
    } else {
      routeData.value = null;
    }
  },
  { immediate: true },
);

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** MITECO province of the origin; Madrid when the origin cannot be matched. */
const originProvinceId = computed(() => {
  if (!originLocation.value || provincesList.value.length === 0) return null;
  const search = normalize(originLocation.value.provinceSearch);
  const match = provincesList.value.find((province) => {
    const name = normalize(province.Provincia);
    return search.includes(name) || name.includes(search);
  });
  return match?.IDPovincia ?? '28';
});

const needsAutomaticFuelPrices = computed(() =>
  options.value.some(
    (option) =>
      (option.kind === 'combustion' || option.kind === 'motorbike') &&
      option.priceSource === 'auto',
  ),
);

// One MITECO request per province gives the prices of every fuel.
watch(
  [originProvinceId, needsAutomaticFuelPrices],
  async ([provinceId, needed], [previousProvinceId]) => {
    if (!provinceId || !needed) return;
    if (provinceId === previousProvinceId && Object.keys(fuelPrices.value).length > 0) return;
    fuelPrices.value = await getAverageFuelPricesByProvince(provinceId, FUEL_KEYS);
  },
  { immediate: true },
);

const routeFacts = computed(() =>
  routeData.value
    ? { distanceKm: routeData.value.distanceKm, durationMinutes: routeData.value.durationMinutes }
    : null,
);

const calculate = (option: TravelOption): OptionResult | null =>
  routeFacts.value
    ? calculateOption(option, trip.value, routeFacts.value, { fuelPrices: fuelPrices.value })
    : null;

const results = computed<Record<string, OptionResult>>(() => {
  const byId: Record<string, OptionResult> = {};
  for (const option of options.value) {
    const result = calculate(option);
    if (result) byId[option.id] = result;
  }
  return byId;
});

// --- Option editor ---------------------------------------------------------

const editing = ref<{ option: TravelOption; isNew: boolean } | null>(null);

const openNewOption = () => {
  if (options.value.length >= MAX_OPTIONS) return;
  editing.value = {
    option: createOption('combustion', uniqueName(defaultName('combustion'), options.value)),
    isNew: true,
  };
};

const openEditOption = (optionId: string) => {
  const option = options.value.find((candidate) => candidate.id === optionId);
  if (option) editing.value = { option, isNew: false };
};

const openDuplicate = (optionId: string) => {
  const option = options.value.find((candidate) => candidate.id === optionId);
  if (!option || options.value.length >= MAX_OPTIONS) return;
  editing.value = {
    option: duplicateOption(option, uniqueName(option.name, options.value)),
    isNew: true,
  };
};

const saveOption = (saved: TravelOption) => {
  const index = options.value.findIndex((option) => option.id === saved.id);
  if (index === -1) options.value = [...options.value, saved];
  else options.value = options.value.map((option) => (option.id === saved.id ? saved : option));
  editing.value = null;
};

// Deleting is undoable for a few seconds instead of asking for confirmation.
const lastRemoved = ref<{ option: TravelOption; index: number } | null>(null);
let undoTimer: ReturnType<typeof setTimeout> | undefined;

const removeOption = (optionId: string) => {
  if (options.value.length <= 1) return;
  const index = options.value.findIndex((option) => option.id === optionId);
  if (index === -1) return;
  lastRemoved.value = { option: options.value[index], index };
  options.value = options.value.filter((option) => option.id !== optionId);
  editing.value = null;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => (lastRemoved.value = null), 6000);
};

const undoRemove = () => {
  if (!lastRemoved.value || options.value.length >= MAX_OPTIONS) return;
  const { option, index } = lastRemoved.value;
  const restored = [...options.value];
  restored.splice(index, 0, option);
  options.value = restored;
  lastRemoved.value = null;
  clearTimeout(undoTimer);
};

// --- Map and header actions ------------------------------------------------

const goHome = () => {
  originLocation.value = null;
  destLocation.value = null;
  showSettings.value = false;
};

const updateOriginCoords = (position: { lat: number; lon: number }) => {
  if (originLocation.value) originLocation.value = { ...originLocation.value, ...position };
};

const updateDestCoords = (position: { lat: number; lon: number }) => {
  if (destLocation.value) destLocation.value = { ...destLocation.value, ...position };
};

const mapPoint = (place: Place | null) => (place ? { lat: place.lat, lon: place.lon } : undefined);

const toggleMobileMap = async () => {
  isMapVisibleMobile.value = !isMapVisibleMobile.value;
  if (isMapVisibleMobile.value) {
    await nextTick();
    mobileMapRef.value?.invalidateSize();
  }
};

const sharedPlace = (place: Place | null) =>
  place ? { lat: place.lat, lon: place.lon, label: place.label } : undefined;

const shareRoute = async () => {
  const url = encodeStateToUrl({
    origin: sharedPlace(originLocation.value),
    destination: sharedPlace(destLocation.value),
    trip: trip.value,
    options: options.value,
  });

  try {
    if (navigator.share) {
      await navigator.share({ title: t('core.share_title'), text: t('core.share_text'), url });
    } else {
      await navigator.clipboard.writeText(url);
      alert(t('core.share_copied'));
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
};
</script>

<template>
  <div class="app-wrapper">
    <AppHeader
      :showSettings="showSettings"
      @toggle-settings="showSettings = !showSettings"
      @home="goHome"
      @share="shareRoute"
    />

    <main class="app-container">
      <SettingsView v-if="showSettings" :show="showSettings" />

      <div v-else class="layout">
        <div class="route-section">
          <div class="forms-column">
            <TripCard
              :trip="trip"
              :origin-label="originLocation?.label"
              :destination-label="destLocation?.label"
              @update:trip="trip = $event"
              @update:origin="originLocation = $event"
              @update:destination="destLocation = $event"
            />

            <div v-if="!isDesktop" class="mobile-map-section">
              <button
                type="button"
                class="map-toggle-btn"
                :aria-expanded="isMapVisibleMobile"
                :aria-controls="isMapVisibleMobile ? 'mobile-map-drawer' : undefined"
                @click="toggleMobileMap"
              >
                <span>{{ isMapVisibleMobile ? t('core.hide_map') : t('core.show_map') }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :style="{ transform: isMapVisibleMobile ? 'rotate(180deg)' : 'rotate(0)' }"
                  style="transition: transform 0.2s ease"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              <div v-if="isMapVisibleMobile" id="mobile-map-drawer" class="map-wrapper">
                <NativeMap
                  ref="mobileMapRef"
                  :origin="mapPoint(originLocation)"
                  :destination="mapPoint(destLocation)"
                  :route-coordinates="routeData?.coordinates"
                  :dark-mode="isDarkMode"
                  @update:origin="updateOriginCoords"
                  @update:destination="updateDestCoords"
                />
              </div>
            </div>
          </div>

          <section v-if="isDesktop" class="map-section">
            <div class="map-wrapper">
              <NativeMap
                :origin="mapPoint(originLocation)"
                :destination="mapPoint(destLocation)"
                :route-coordinates="routeData?.coordinates"
                :dark-mode="isDarkMode"
                @update:origin="updateOriginCoords"
                @update:destination="updateDestCoords"
              />
            </div>
          </section>
        </div>

        <OptionsPanel
          :options="options"
          :results="results"
          :trip="trip"
          :distance-km="routeData?.distanceKm ?? null"
          :is-calculating="isCalculating"
          :sort-key="sortKey"
          :hour-value="hourValue"
          @add="openNewOption"
          @edit="openEditOption"
          @duplicate="openDuplicate"
          @remove="removeOption"
          @update:sort-key="sortKey = $event"
          @update:hour-value="hourValue = $event"
        />
      </div>
    </main>

    <div class="footer-container">
      <AppFooter @show-sources="showSourcesModal = true" />
    </div>

    <OptionEditorModal
      v-if="editing"
      :key="editing.option.id"
      :option="editing.option"
      :is-new="editing.isNew"
      :trip="trip"
      :preview="calculate"
      @save="saveOption"
      @remove="removeOption"
      @close="editing = null"
    />

    <SourcesModal v-if="showSourcesModal" @close="showSourcesModal = false" />

    <div class="toast-region" role="status" aria-live="polite">
      <div v-if="lastRemoved" class="toast">
        <span>{{ t('options.removed', { name: lastRemoved.option.name }) }}</span>
        <button type="button" class="toast-action" @click="undoRemove">
          {{ t('options.undo') }}
        </button>
      </div>
    </div>
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
  box-sizing: border-box;
}

.footer-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Desktop: the trip and the map share a row; the options span the width below. */
.route-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 900px) {
  .route-section {
    grid-template-columns: 400px 1fr;
    align-items: stretch;
  }
}

.forms-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

.map-section {
  min-width: 0;
  min-height: 360px;
}

.map-toggle-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.map-toggle-btn:hover {
  background: var(--bg-surface-hover);
}

.map-toggle-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.map-wrapper {
  height: 360px;
}

@media (min-width: 900px) {
  /* The map takes the height of the trip card next to it. */
  .map-section .map-wrapper {
    height: 100%;
  }
}

.toast-region {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%);
  z-index: 2500;
  width: max-content;
  max-width: calc(100vw - 2rem);
}

.toast {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--text-main);
  color: var(--bg-body);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  font-size: 0.9rem;
}

.toast-action {
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.toast-action:focus-visible {
  outline: 2px solid var(--bg-body);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .app-container {
    padding: 1.25rem 1rem 2rem;
  }
}
</style>
