<script setup lang="ts">
import { computed, provide } from "vue";
import { t, type Bi } from "../i18n";
import { stateGridColumnsKey } from "./stateGrid";

const props = defineProps<{ columns: (string | Bi)[]; labelWidth?: string }>();

provide(
  stateGridColumnsKey,
  computed(() => props.columns.map((c) => t(c))),
);
</script>

<template>
  <div class="state-grid" :style="{ '--state-label': labelWidth ?? '96px' }">
    <slot />
  </div>
</template>

<style scoped>
/* 各状态列由 StateRow 直接铺开换行,整块不设横向滚动。 */
.state-grid {
  display: grid;
  gap: var(--space-3);
  align-items: start;
}
</style>
