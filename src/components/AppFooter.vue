<script setup lang="ts">
const emit = defineEmits<{
  (e: 'show-sources'): void;
}>();
</script>

<template>
  <footer class="footer">
    <div class="footer__content">
      <p class="footer__text">
        Desplaza MVP
        <span class="footer__version">
          • v1.0.0
        </span>
      </p>
      <div class="footer__links">
        <button class="footer__link" @click="emit('show-sources')">
          Fuentes y Metodología
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 3rem 1.5rem;
  margin-top: 4rem;
  border-top: 1px solid var(--color-border);
}

.footer__content {
  text-align: center;
}

.footer__text {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.footer__version {
  opacity: 0.8;
}

.footer__links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

.footer__link {
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: opacity 0.2s;
}

.footer__link:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.footer__divider {
  color: var(--color-border);
  font-size: 0.8rem;
}
</style>
