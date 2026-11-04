<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from "vue";
import { TabsList } from "reka-ui";
import type { TabListProps } from "./tabs.js";

defineOptions({
  name: "MwTabList",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TabListProps>(), {
  loop: true,
});

const attrs = useAttrs();
const rootClass = computed(() => ["mw-tab-list", attrs.class]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <TabsList
    v-bind="rootAttrs"
    :class="rootClass"
    :style="rootStyle"
    :loop="props.loop"
  >
    <slot />
  </TabsList>
</template>

<style scoped>
.mw-tab-list {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border-subtle);
  overflow-x: auto;
  scrollbar-width: none;
}

.mw-tab-list::-webkit-scrollbar {
  display: none;
}

.mw-tab-list[aria-orientation="vertical"] {
  flex-direction: column;
  align-items: stretch;
  border-bottom: 0;
  border-right: 1px solid var(--color-border-subtle);
}
</style>
