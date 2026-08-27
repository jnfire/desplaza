<script setup lang="ts">
import SettingsIcon from './SettingsIcon.vue';

defineProps<{
  showSettings: boolean;
}>();

const emit = defineEmits<{
  (e: 'home'): void;
  (e: 'toggle-settings'): void;
}>();
</script>

<template>
  <header class="navbar">
    <div class="navbar-container">
      <button class="navbar-brand" @click="emit('home')" aria-label="Desplaza">
        <div>
          <h1 class="title">Desplaza</h1>
          <p class="subtitle">Calcula y compara el coste real de tu movilidad.</p>
        </div>
      </button>

      <div class="navbar-actions">
        <button
          class="btn-secondary config-toggle"
          :class="{ 'config-toggle--active': showSettings }"
          @click="emit('toggle-settings')"
          aria-label="Abrir configuración"
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

.config-toggle--active {
  background-color: var(--color-primary);
  color: #ffffff;
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
}
</style>
