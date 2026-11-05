<script setup lang="ts">
import { t, type Bi } from "../i18n";

defineProps<{ columns: (string | Bi)[]; labelWidth?: string }>();
</script>

<template>
  <div
    v-scroll-fade.sm
    class="state-grid mw-scroll"
    :style="{ '--state-cols': columns.length, '--state-label': labelWidth ?? '96px' }"
  >
    <div class="state-grid__table">
      <span class="state-grid__corner" />
      <span v-for="(col, i) in columns" :key="i" class="state-grid__head">{{ t(col) }}</span>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.state-grid {
  overflow-x: auto;
}

.state-grid__table {
  display: grid;
  grid-template-columns: var(--state-label) repeat(var(--state-cols), max-content);
  align-items: center;
  gap: var(--space-3) var(--space-5);
}

.state-grid__head {
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
}

.state-grid :deep(.state-row__label) {
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}
</style>
