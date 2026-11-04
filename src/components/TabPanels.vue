<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from "vue";
import type { TabPanelsProps } from "./tabs.js";

defineOptions({
  name: "MwTabPanels",
  inheritAttrs: false,
});

defineProps<TabPanelsProps>();

const attrs = useAttrs();
const rootClass = computed(() => ["mw-tab-panels", attrs.class]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div v-bind="rootAttrs" :class="rootClass" :style="rootStyle">
    <slot />
  </div>
</template>

<style scoped>
.mw-tab-panels {
  width: 100%;
  padding-top: var(--space-3);
}
</style>
