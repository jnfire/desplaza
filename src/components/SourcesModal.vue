<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseModal from './BaseModal.vue';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();
</script>

<template>
  <BaseModal :title="t('sources.title')" @close="emit('close')">
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
  </BaseModal>
</template>

<style scoped>
section h3 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  color: var(--text-main);
}

section p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

section ul {
  padding-left: 1.5rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}

section li {
  margin-bottom: 0.35rem;
}
</style>
