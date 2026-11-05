<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from "vue";
import { TabsList } from "reka-ui";
import { vScrollFade } from "../lib/scroll-fade";
import type { TabListProps } from "./tabs.js";

defineOptions({
  name: "MwTabList",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TabListProps>(), {
  loop: true,
});

const attrs = useAttrs();
const rootClass = computed(() => ["mw-tab-list", "mw-scroll-fade", "mw-scroll-fade--sm", attrs.class]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <TabsList
    v-scroll-fade.sm
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
  align-items: stretch;
  gap: var(--space-2);
  border-bottom: var(--border-width) solid var(--border-subtle);
  overflow-x: auto;
  scrollbar-width: none;
}

.mw-tab-list::-webkit-scrollbar {
  display: none;
}

.mw-tab-list[aria-orientation="vertical"] {
  flex-direction: column;
  gap: var(--space-0-5);
  border-bottom: 0;
  border-inline-end: var(--border-width) solid var(--border-subtle);
}
</style>
