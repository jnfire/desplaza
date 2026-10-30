<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h2>{{ $t('sources.title') }}</h2>
        <button class="close-btn" :aria-label="$t('sources.close')" @click="emit('close')">
          ×
        </button>
      </header>

      <div class="modal-body">
        <section>
          <h3>{{ $t('sources.fuel.title') }}</h3>
          <i18n-t keypath="sources.fuel.source" tag="p">
            <template #ministry>
              <strong>{{ $t('sources.fuel.ministry') }}</strong>
            </template>
          </i18n-t>
          <p>{{ $t('sources.fuel.method') }}</p>
        </section>

        <section>
          <h3>{{ $t('sources.routing.title') }}</h3>
          <i18n-t keypath="sources.routing.text" tag="p">
            <template #osrm>
              <strong>OSRM (Open Source Routing Machine)</strong>
            </template>
            <template #photon>
              <strong>Photon (OpenStreetMap)</strong>
            </template>
          </i18n-t>
        </section>

        <section>
          <h3>{{ $t('sources.wear.title') }}</h3>
          <i18n-t keypath="sources.wear.text" tag="p">
            <template #amount>
              <strong>{{ $t('sources.wear.amount') }}</strong>
            </template>
          </i18n-t>
          <ul>
            <li>{{ $t('sources.wear.items.tyres') }}</li>
            <li>{{ $t('sources.wear.items.maintenance') }}</li>
            <li>{{ $t('sources.wear.items.insurance') }}</li>
            <li>{{ $t('sources.wear.items.depreciation') }}</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  /* Above the sticky header (2000) so the modal title is never covered. */
  z-index: 3000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.close-btn:hover {
  color: var(--color-text);
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-body h3 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.modal-body p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.modal-body ul {
  padding-left: 1.5rem;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.modal-body li {
  margin-bottom: 0.25rem;
}
</style>
