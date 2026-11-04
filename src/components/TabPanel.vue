<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from "vue";
import { TabsContent } from "reka-ui";
import type { TabPanelProps } from "./tabs.js";

defineOptions({
  name: "MwTabPanel",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TabPanelProps>(), {
  forceMount: false,
});

const attrs = useAttrs();
const rootClass = computed(() => ["mw-tab-panel", attrs.class]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <TabsContent
    v-bind="rootAttrs"
    :class="rootClass"
    :style="rootStyle"
    :value="props.value"
    :force-mount="props.forceMount"
  >
    <slot />
  </TabsContent>
</template>

<style scoped>
.mw-tab-panel {
  width: 100%;
  outline: none;
}

.mw-tab-panel:focus-visible {
  border-radius: var(--radius);
  box-shadow: var(--effect-focus-ring);
}
</style>
