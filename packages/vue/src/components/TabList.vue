<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from "vue";
import { TabsList } from "reka-ui";
import { vScrollFade } from "../lib/scroll-fade";
import type { TabListProps } from "./tabs-defs.js";

defineOptions({
  name: "MwTabList",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TabListProps>(), {
  loop: true,
  hideWhenSingle: false,
});

const attrs = useAttrs();
const rootClass = computed(() => [
  "mw-tab-list",
  "mw-scroll-fade",
  "mw-scroll-fade--sm",
  { "mw-tab-list--hide-single": props.hideWhenSingle },
  attrs.class,
]);
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
