<!-- src/components/SettingsView.vue -->
<script setup lang="ts">
import PersonalizationCard from './PersonalizationCard.vue';

defineProps<{
  show: boolean;
}>();
</script>

<template>
  <div v-if="show" class="settings-view">
    <div class="settings-content">
      <PersonalizationCard />
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  background-color: var(--color-bg);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.2s ease-out;
  width: 100%;
}

.settings-content {
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
