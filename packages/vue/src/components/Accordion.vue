<script setup lang="ts">
import { computed, provide, ref, useAttrs, watch, type StyleValue } from "vue";
import {
  ACCORDION_INJECTION_KEY,
  type AccordionEmits,
  type AccordionPanelValue,
  type AccordionProps,
  type AccordionValue,
} from "./accordion-defs.js";

defineOptions({
  name: "MwAccordion",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<AccordionProps>(), {
  value: undefined,
  modelValue: undefined,
  defaultValue: undefined,
  multiple: false,
});

const emit = defineEmits<AccordionEmits>();
const attrs = useAttrs();

function resolveInitialValue(): AccordionValue {
  if (props.modelValue !== undefined) return props.modelValue;
  if (props.value !== undefined) return props.value;
  if (props.defaultValue !== undefined) return props.defaultValue;
  return props.multiple ? [] : null;
}

const internalValue = ref<AccordionValue>(resolveInitialValue());

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined) {
      internalValue.value = val;
    }
  },
  { flush: "sync" },
);

watch(
  () => props.value,
  (val) => {
    internalValue.value = val ?? (props.multiple ? [] : null);
  },
  { flush: "sync" },
);

function isPanelOpen(panelValue: AccordionPanelValue): boolean {
  const current = internalValue.value;
  if (Array.isArray(current)) {
    return current.includes(panelValue);
  }
  return current !== null && current !== undefined && current === panelValue;
}

function togglePanel(panelValue: AccordionPanelValue) {
  const current = internalValue.value;
  let next: AccordionPanelValue | AccordionPanelValue[] | null;

  if (props.multiple) {
    const list: AccordionPanelValue[] = Array.isArray(current)
      ? [...current]
      : current !== null && current !== undefined
        ? [current]
        : [];
    const idx = list.indexOf(panelValue);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(panelValue);
    }
    next = list;
  } else {
    next = isPanelOpen(panelValue) ? null : panelValue;
  }

  internalValue.value = next;
  emit("update:value", next);
  emit("update:modelValue", next);
}

const headerEls = ref<HTMLButtonElement[]>([]);

function registerHeader(el: HTMLButtonElement) {
  if (!headerEls.value.includes(el)) {
    headerEls.value.push(el);
  }
}

function unregisterHeader(el: HTMLButtonElement) {
  const idx = headerEls.value.indexOf(el);
  if (idx >= 0) {
    headerEls.value.splice(idx, 1);
  }
}

function moveFocus(
  current: HTMLButtonElement,
  direction: "next" | "prev" | "first" | "last",
) {
  const enabled = headerEls.value.filter(
    (el) => !el.disabled && el.isConnected,
  );
  if (enabled.length === 0) return;

  if (direction === "first") {
    enabled[0]?.focus();
    return;
  }
  if (direction === "last") {
    enabled[enabled.length - 1]?.focus();
    return;
  }

  const pos = enabled.indexOf(current);
  if (pos === -1) {
    enabled[0]?.focus();
    return;
  }

  const nextIdx =
    direction === "next"
      ? (pos + 1) % enabled.length
      : (pos - 1 + enabled.length) % enabled.length;
  enabled[nextIdx]?.focus();
}

provide(ACCORDION_INJECTION_KEY, {
  isPanelOpen,
  togglePanel,
  registerHeader,
  unregisterHeader,
  moveFocus,
});

const rootClass = computed(() => ["mw-accordion", attrs.class]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div v-bind="rootAttrs" :class="rootClass" :style="rootStyle">
    <slot />
  </div>
</template>
