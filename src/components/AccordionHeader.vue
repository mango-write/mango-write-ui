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
    <svg
      class="mw-accordion__chevron p-accordionheader-toggle-icon"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  </button>
</template>

<style>
.mw-accordion__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-3);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  font-weight: 600;
  line-height: 1.4;
  text-align: start;
  cursor: pointer;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    color var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-accordion__header:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--material-hover);
}

.mw-accordion__header:focus-visible {
  outline: none;
  box-shadow: var(--effect-focus-ring);
}

.mw-accordion__header:disabled,
.mw-accordion__header[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-accordion__chevron {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  margin-inline-start: auto;
  color: var(--color-text-tertiary);
  transition: transform var(--motion-duration-base) var(--motion-ease-standard);
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
