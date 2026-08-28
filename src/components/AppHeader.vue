<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import SettingsIcon from './SettingsIcon.vue';

defineProps<{
  showSettings: boolean;
}>();

const emit = defineEmits<{
  (e: 'home'): void;
  (e: 'toggle-settings'): void;
  (e: 'share'): void;
}>();

const { t } = useI18n();
</script>

<template>
  <header class="navbar">
    <div class="navbar-container">
      <button class="navbar-brand" @click="emit('home')" :aria-label="t('header.title')">
        <div>
          <h1 class="title">{{ t('header.title') }}</h1>
          <p class="subtitle">{{ t('header.subtitle') }}</p>
        </div>
      </button>

      <div class="navbar-actions">
        <button
          type="button"
          class="btn-secondary config-toggle"
          @click="emit('share')"
          :aria-label="t('core.share_btn_label')"
          :title="t('core.share_btn_label')"
        >
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
        <button
          type="button"
          class="btn-secondary config-toggle"
          :class="{ 'config-toggle--active': showSettings }"
          @click="emit('toggle-settings')"
          :aria-label="t('core.settings_btn_label')"
          :aria-expanded="showSettings"
        >
          <SettingsIcon class="icon" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 2000;
  padding: 0.75rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  border-radius: 6px;
  text-decoration: none;
}

.navbar-brand:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
  text-align: left;
}

.subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0.15rem 0 0 0;
  font-weight: 400;
  text-align: left;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.config-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.config-toggle:hover {
  background-color: var(--color-bg-hover, rgba(0,0,0,0.05));
}

.config-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.config-toggle--active {
  background-color: var(--color-primary);
  color: var(--color-bg);
  border-color: var(--color-primary);
}

.config-toggle--active:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  opacity: 0.9;
}

.icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 600px) {
  .navbar-container {
    padding: 0 1rem;
  }
  .title {
    font-size: 1.05rem;
  }
  .subtitle {
    display: none;
  }
}
</style>
