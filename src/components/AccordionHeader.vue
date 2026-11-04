<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  type StyleValue,
} from "vue";
import { ChevronDown } from "lucide-vue-next";
import {
  ACCORDION_INJECTION_KEY,
  ACCORDION_PANEL_INJECTION_KEY,
  type AccordionHeaderProps,
} from "./accordion.js";

defineOptions({
  name: "MwAccordionHeader",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<AccordionHeaderProps>(), {
  disabled: false,
});

const attrs = useAttrs();
const buttonRef = ref<HTMLButtonElement | null>(null);

const accordion = inject(ACCORDION_INJECTION_KEY, null);
const panel = inject(ACCORDION_PANEL_INJECTION_KEY, null);

const isOpen = computed<boolean>(() => panel?.isOpen.value ?? false);
const isDisabled = computed<boolean>(
  () => Boolean(props.disabled) || Boolean(panel?.disabled.value),
);

onMounted(() => {
  if (buttonRef.value) {
    accordion?.registerHeader(buttonRef.value);
  }
});

onBeforeUnmount(() => {
  if (buttonRef.value) {
    accordion?.unregisterHeader(buttonRef.value);
  }
});

function onClick() {
  if (isDisabled.value) return;
  panel?.toggle();
}

function onKeydown(event: KeyboardEvent) {
  if (!buttonRef.value || !accordion) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    accordion.moveFocus(buttonRef.value, "next");
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    accordion.moveFocus(buttonRef.value, "prev");
  } else if (event.key === "Home") {
    event.preventDefault();
    accordion.moveFocus(buttonRef.value, "first");
  } else if (event.key === "End") {
    event.preventDefault();
    accordion.moveFocus(buttonRef.value, "last");
  }
}

const rootClass = computed(() => [
  "mw-accordion__header",
  "p-accordionheader",
  {
    "mw-accordion__header--active": isOpen.value,
    "mw-accordion__header--disabled": isDisabled.value,
  },
  attrs.class,
]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <button
    ref="buttonRef"
    v-bind="rootAttrs"
    type="button"
    :id="panel?.headerId"
    :class="rootClass"
    :style="rootStyle"
    :aria-expanded="isOpen"
    :aria-controls="panel?.contentId"
    :disabled="isDisabled"
    :data-state="isOpen ? 'open' : 'closed'"
    :data-disabled="isDisabled ? '' : undefined"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot :active="isOpen" />
    <ChevronDown
      class="mw-accordion__chevron p-accordionheader-toggle-icon"
      aria-hidden="true"
    />
  </button>
</template>

<style>
.mw-accordion__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--control-gap);
  width: 100%;
  min-height: calc(var(--control-h) + var(--space-2));
  box-sizing: border-box;
  margin-block: var(--space-0-5);
  padding-block: var(--space-1);
  padding-inline: var(--control-px);
  border: 0;
  border-radius: var(--radius-item);
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--control-font);
  font-weight: var(--weight-medium);
  line-height: var(--type-body-sm-line);
  text-align: start;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-accordion__header:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--fill-subtle);
}

.mw-accordion__header:active:not(:disabled):not([data-disabled]) {
  background-color: var(--fill-default);
}

.mw-accordion__header:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: calc(-1 * var(--focus-width));
}

.mw-accordion__header:disabled,
.mw-accordion__header[data-disabled] {
  color: var(--text-disabled);
  cursor: not-allowed;
}

.mw-accordion__header > svg:not(.mw-accordion__chevron) {
  flex: none;
  width: var(--control-icon);
  height: var(--control-icon);
  color: var(--text-secondary);
}

.mw-accordion__chevron {
  flex-shrink: 0;
  width: var(--control-icon);
  height: var(--control-icon);
  margin-inline-start: auto;
  color: var(--text-tertiary);
  transition: transform var(--duration-base) var(--ease-standard);
}

.mw-accordion__header[data-state="open"] .mw-accordion__chevron {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .mw-accordion__header,
  .mw-accordion__chevron {
    transition: none;
  }
}
</style>
