<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useId } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  title: string;
  closeLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();
const titleId = useId();
const dialogRef = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;
let previousBodyOverflow = '';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusableElements = (): HTMLElement[] =>
  dialogRef.value
    ? Array.from(dialogRef.value.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      )
    : [];

// Keep Tab and Shift+Tab inside the dialog, and close it with Escape.
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
    return;
  }
  if (event.key !== 'Tab') return;
  const elements = focusableElements();
  if (elements.length === 0) {
    event.preventDefault();
    return;
  }
  const first = elements[0];
  const last = elements[elements.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

onMounted(async () => {
  previouslyFocused = document.activeElement as HTMLElement | null;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleKeydown);
  await nextTick();
  const autofocus = dialogRef.value?.querySelector<HTMLElement>('[data-autofocus]');
  (autofocus ?? focusableElements()[0] ?? dialogRef.value)?.focus();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = previousBodyOverflow;
  // Return focus to the control that opened the dialog.
  previouslyFocused?.focus?.();
});
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div
      ref="dialogRef"
      class="modal-content"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
    >
      <header class="modal-header">
        <h2 :id="titleId">{{ title }}</h2>
        <button
          type="button"
          class="close-btn"
          :aria-label="closeLabel ?? t('sources.close')"
          @click="emit('close')"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div class="modal-body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="modal-footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  /* Above the sticky header (2000) so the modal title is never covered. */
  z-index: 3000;
  backdrop-filter: blur(2px);
  padding: 1rem;
}

.modal-content {
  background-color: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-content:focus {
  outline: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.2rem;
  margin: 0;
  color: var(--text-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
}

.close-btn:hover {
  color: var(--text-main);
}

.close-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

/* Phones: the dialog takes the whole screen. */
@media (max-width: 600px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-content {
    max-width: none;
    max-height: none;
    height: 100%;
    border-radius: 0;
    border: none;
  }

  .modal-footer {
    border-radius: 0;
  }
}
</style>
