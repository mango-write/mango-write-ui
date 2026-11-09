<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from "vue";
import { TabsTrigger } from "reka-ui";
import type { TabProps } from "./tabs-defs.js";

defineOptions({
  name: "MwTab",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TabProps>(), {
  disabled: false,
  badge: undefined,
});

const attrs = useAttrs();
const rootClass = computed(() => ["mw-tab", attrs.class]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <TabsTrigger
    v-bind="rootAttrs"
    :class="rootClass"
    :style="rootStyle"
    :value="props.value"
    :disabled="props.disabled"
  >
    <slot />
    <span v-if="props.badge !== undefined" class="mw-tab__badge">{{ props.badge }}</span>
  </TabsTrigger>
</template>
