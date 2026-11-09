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
} from "./accordion-defs.js";

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
      class="mw-accordion__chevron"
      aria-hidden="true"
    />
  </button>
</template>
