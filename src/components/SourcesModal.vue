<!-- src/components/SourcesModal.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();
const closeButtonRef = ref<HTMLButtonElement | null>(null);

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  await nextTick();
  closeButtonRef.value?.focus();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div 
      class="modal-content" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="sources-modal-title"
    >
      <header class="modal-header">
        <h2 id="sources-modal-title">{{ t('sources.title') }}</h2>
        <button 
          ref="closeButtonRef"
          type="button" 
          class="close-btn" 
          @click="emit('close')"
          :aria-label="t('sources.close')"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>
      
      <div class="modal-body">
        <section>
          <h3>{{ t('sources.fuel_title') }}</h3>
          <p>{{ t('sources.fuel_desc1') }}</p>
          <p>{{ t('sources.fuel_desc2') }}</p>
        </section>

        <section>
          <h3>{{ t('sources.routing_title') }}</h3>
          <p>{{ t('sources.routing_desc') }}</p>
        </section>

        <section>
          <h3>{{ t('sources.wear_title') }}</h3>
          <p>{{ t('sources.wear_desc') }}</p>
          <ul>
            <li>{{ t('sources.wear_tires') }}</li>
            <li>{{ t('sources.wear_maintenance') }}</li>
            <li>{{ t('sources.wear_insurance') }}</li>
            <li>{{ t('sources.wear_depreciation') }}</li>
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
  z-index: 3000;
  backdrop-filter: blur(2px);
  padding: 1rem;
}

.modal-content {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  color: var(--color-text);
}

.close-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
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
  margin-bottom: 0.35rem;
}
</style>
