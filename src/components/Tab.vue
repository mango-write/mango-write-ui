<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from "vue";
import { TabsTrigger } from "reka-ui";
import type { TabProps } from "./tabs.js";

defineOptions({
  name: "MwTab",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TabProps>(), {
  disabled: false,
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
  </TabsTrigger>
</template>

<style scoped>
.mw-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 36px;
  padding: var(--space-2) var(--space-3);
  border: 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  font-weight: 500;
  line-height: 1.25;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-base) var(--motion-ease-standard),
    background-color var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-tab:hover:not(:disabled):not([data-disabled]) {
  color: var(--color-text-primary);
  background-color: var(--material-hover);
  border-top-left-radius: var(--radius-sm);
  border-top-right-radius: var(--radius-sm);
}

.mw-tab[data-state="active"] {
  color: var(--color-brand-700);
  border-bottom-color: var(--color-brand-500);
}

.mw-tab:focus-visible {
  outline: none;
  border-radius: var(--radius-sm);
  box-shadow: var(--effect-focus-ring);
}

.mw-tab:disabled,
.mw-tab[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .mw-tab {
    transition: none;
  }
}
</style>
