<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  name: string;
  canDuplicate: boolean;
  /** The last remaining option cannot be deleted, so its row omits the button. */
  canRemove: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'duplicate'): void;
  (e: 'remove'): void;
}>();

const { t } = useI18n();
</script>

<template>
  <div class="option-actions">
    <button
      type="button"
      class="action-btn"
      :aria-label="t('options.edit_named', { name })"
      :title="t('options.edit')"
      @click="emit('edit')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>
    <button
      type="button"
      class="action-btn"
      :disabled="!canDuplicate"
      :aria-label="t('options.duplicate_named', { name })"
      :title="t('options.duplicate')"
      @click="emit('duplicate')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
      </svg>
    </button>
    <button
      v-if="canRemove"
      type="button"
      class="action-btn action-btn--danger"
      :aria-label="t('options.delete_named', { name })"
      :title="t('options.delete')"
      @click="emit('remove')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
        <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.option-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.action-btn svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.action-btn:hover:not(:disabled) {
  color: var(--text-main);
  border-color: var(--border-color);
  background: var(--bg-surface);
}

.action-btn--danger:hover:not(:disabled) {
  color: var(--error-color);
}

.action-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Phones: a 44px touch target, with room between the three buttons. */
@media (max-width: 600px) {
  .option-actions {
    gap: 0.5rem;
  }

  .action-btn {
    width: 2.75rem;
    height: 2.75rem;
    border-color: var(--border-color);
  }
}
</style>
