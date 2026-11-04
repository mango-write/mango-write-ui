<script setup lang="ts">
import { computed, inject, useAttrs, type StyleValue } from "vue";
import {
  ACCORDION_PANEL_INJECTION_KEY,
  type AccordionContentProps,
} from "./accordion.js";

defineOptions({
  name: "MwAccordionContent",
  inheritAttrs: false,
});

defineProps<AccordionContentProps>();

const attrs = useAttrs();
const panel = inject(ACCORDION_PANEL_INJECTION_KEY, null);

const isOpen = computed<boolean>(() => panel?.isOpen.value ?? false);

const rootClass = computed(() => [
  "mw-accordion__content",
  "p-accordioncontent",
  attrs.class,
]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div
    v-show="isOpen"
    v-bind="rootAttrs"
    :id="panel?.contentId"
    :class="rootClass"
    :style="rootStyle"
    role="region"
    :aria-labelledby="panel?.headerId"
    :data-state="isOpen ? 'open' : 'closed'"
  >
    <div class="mw-accordion__content-inner p-accordioncontent-content p-accordioncontent-wrapper">
      <slot />
    </div>
  </div>
</template>

<style>
.mw-accordion__content {
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
}

.mw-accordion__content-inner {
  min-width: 0;
  padding: 0 var(--space-3) var(--space-3);
}
</style>
