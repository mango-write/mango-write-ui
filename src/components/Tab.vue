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

<style scoped>
.mw-tab {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: var(--control-gap);
  height: var(--control-h);
  padding-block: 0;
  padding-inline: var(--space-2);
  border: 0;
  border-radius: var(--radius-item) var(--radius-item) 0 0;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--control-font);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard);
}

.mw-tab::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: var(--space-0-5);
  border-radius: var(--radius-full);
  background-color: var(--accent);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.mw-tab :deep(svg) {
  flex: none;
  width: var(--control-icon);
  height: var(--control-icon);
}

.mw-tab__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-1-5);
  border-radius: var(--radius-full);
  background: var(--fill-default);
  color: var(--text-secondary);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-variant-numeric: tabular-nums;
}

.mw-tab[data-state="active"] .mw-tab__badge {
  background: var(--accent-subtle);
  color: var(--text-accent);
}

.mw-tab:hover:not(:disabled):not([data-disabled]) {
  color: var(--text-primary);
}

.mw-tab[data-state="active"] {
  color: var(--text-primary);
}

.mw-tab[data-state="active"]::after {
  opacity: 1;
}

.mw-tab:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: calc(-1 * var(--focus-width));
}

.mw-tab:disabled,
.mw-tab[data-disabled] {
  color: var(--text-disabled);
  cursor: not-allowed;
}

.mw-tab[data-orientation="vertical"] {
  justify-content: flex-start;
  padding-inline: var(--control-px);
  border-radius: var(--radius-item) 0 0 var(--radius-item);
}

.mw-tab[data-orientation="vertical"]::after {
  inset-inline: auto 0;
  inset-block: var(--space-1);
  width: var(--space-0-5);
  height: auto;
}

.mw-tab[data-orientation="vertical"]:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--fill-subtle);
}

@media (prefers-reduced-motion: reduce) {
  .mw-tab,
  .mw-tab::after {
    transition: none;
  }
}
</style>
