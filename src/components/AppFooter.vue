<script setup lang="ts">
const appVersion = __APP_VERSION__;

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
          •
          <a
            :href="`https://github.com/jnfire/desplaza/releases/tag/v${appVersion}`"
            target="_blank"
            rel="noopener noreferrer"
            class="footer__version-link"
          >
            v{{ appVersion }}
          </a>
        </span>
      </p>
      <div class="footer__links">
        <button class="footer__link btn-link" @click="emit('show-sources')">
          Metodología
        </button>
        <span class="footer__divider">|</span>
        <a
          href="https://github.com/jnfire/desplaza"
          target="_blank"
          rel="noopener noreferrer"
          class="footer__link"
        >
          Código Fuente
        </a>
        <span class="footer__divider">|</span>
        <a
          href="https://github.com/jnfire/desplaza/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          class="footer__link"
        >
          Licencia
        </a>
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

.footer__version-link {
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s;
}

.footer__version-link:hover {
  text-decoration: underline;
  opacity: 1;
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
  transition: opacity 0.2s;
}

.footer__link:hover {
  opacity: 0.7;
}

.btn-link {
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

.footer__divider {
  color: var(--color-border);
  font-size: 0.8rem;
}
</style>
