<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Check, Minus } from "lucide-vue-next";

defineOptions({
  name: "MwCheckbox",
  inheritAttrs: false,
});

export type CheckboxSize = "sm" | "md" | "lg" | "small" | "large";

export interface CheckboxChangeEvent {
  originalEvent: Event;
  value: any;
}

export interface CheckboxProps {
  modelValue?: any;
  value?: any;
  binary?: boolean;
  indeterminate?: boolean;
  trueValue?: any;
  falseValue?: any;
  inputId?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: CheckboxSize;
  tabindex?: number | string;
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: false,
  value: undefined,
  binary: false,
  indeterminate: false,
  trueValue: true,
  falseValue: false,
  inputId: undefined,
  id: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  size: "md",
  tabindex: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [event: CheckboxChangeEvent];
  click: [event: MouseEvent];
}>();

const attrs = useAttrs();

const isArrayMode = computed(
  () => !props.binary && Array.isArray(props.modelValue),
);

const isChecked = computed(() => {
  if (isArrayMode.value) {
    return (props.modelValue as unknown[]).includes(props.value);
  }
  return props.modelValue === props.trueValue;
});

const dataState = computed<"checked" | "unchecked" | "indeterminate">(() => {
  if (props.indeterminate) return "indeterminate";
  return isChecked.value ? "checked" : "unchecked";
});

const ariaChecked = computed<"true" | "false" | "mixed">(() => {
  if (props.indeterminate) return "mixed";
  return isChecked.value ? "true" : "false";
});

const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  return "md";
});

const rootClass = computed(() => [
  "mw-checkbox",
  "mw-control",
  `mw-checkbox--${resolvedSize.value}`,
  {
    "mw-checkbox--checked": isChecked.value && !props.indeterminate,
    "mw-checkbox--indeterminate": props.indeterminate,
  },
  attrs.class,
]);

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function computeNextValue() {
  if (isArrayMode.value) {
    const current = props.modelValue as unknown[];
    if (isChecked.value) {
      return current.filter((item) => item !== props.value);
    }
    return [...current, props.value];
  }
  if (props.indeterminate) {
    return props.trueValue;
  }
  return isChecked.value ? props.falseValue : props.trueValue;
}

function toggle(event: Event) {
  if (props.disabled || props.readonly) return;
  const nextValue = computeNextValue();
  emit("update:modelValue", nextValue);
  emit("change", { originalEvent: event, value: nextValue });
}

function onClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  emit("click", event);
  toggle(event);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === " " || event.key === "Spacebar") {
    event.preventDefault();
    if (props.disabled || props.readonly) return;
    toggle(event);
  }
}
</script>

<template>
  <button
    v-bind="controlAttrs"
    type="button"
    role="checkbox"
    :id="inputId ?? id"
    :name="name"
    :class="rootClass"
    :style="($attrs.style as any)"
    :disabled="disabled"
    :tabindex="tabindex"
    :aria-checked="ariaChecked"
    :aria-invalid="invalid || undefined"
    :aria-readonly="readonly || undefined"
    :aria-required="required || undefined"
    :data-state="dataState"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-size="resolvedSize"
    @click="onClick"
    @keydown="onKeydown"
  >
    <span class="mw-checkbox__indicator" aria-hidden="true">
      <Minus
        v-if="indeterminate"
        class="mw-checkbox__icon"
        aria-hidden="true"
      />
      <Check
        v-else-if="isChecked"
        class="mw-checkbox__icon"
        aria-hidden="true"
      />
    </span>
  </button>
</template>
