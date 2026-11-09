<script setup lang="ts">
import {
  computed,
  inject,
  provide,
  useAttrs,
  useId,
  type StyleValue,
} from "vue";
import {
  ACCORDION_INJECTION_KEY,
  ACCORDION_PANEL_INJECTION_KEY,
  type AccordionPanelProps,
} from "./accordion-defs.js";

defineOptions({
  name: "MwAccordionPanel",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<AccordionPanelProps>(), {
  disabled: false,
});

const attrs = useAttrs();
const uid = useId();
const headerId = `mw-accordion-header-${uid}`;
const contentId = `mw-accordion-content-${uid}`;

const accordion = inject(ACCORDION_INJECTION_KEY, null);

const isOpen = computed<boolean>(() =>
  accordion ? accordion.isPanelOpen(props.value) : false,
);

const isDisabled = computed<boolean>(() => Boolean(props.disabled));

function toggle() {
  if (isDisabled.value) return;
  accordion?.togglePanel(props.value);
}

provide(ACCORDION_PANEL_INJECTION_KEY, {
  value: computed(() => props.value),
  disabled: isDisabled,
  isOpen,
  headerId,
  contentId,
  toggle,
});

const rootClass = computed(() => [
  "mw-accordion__panel",
  {
    "mw-accordion__panel--active": isOpen.value,
    "mw-accordion__panel--disabled": isDisabled.value,
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
  <div
    v-bind="rootAttrs"
    :class="rootClass"
    :style="rootStyle"
    :data-state="isOpen ? 'open' : 'closed'"
    :data-disabled="isDisabled ? '' : undefined"
  >
    <slot :active="isOpen" />
  </div>
</template>
