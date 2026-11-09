<script setup lang="ts">
import { computed, ref, useAttrs, type CSSProperties } from "vue";
import type {
  RadioButtonChangeEvent,
  RadioButtonEmits,
  RadioButtonProps,
  RadioButtonSize,
} from "./radio-button.js";

export type {
  RadioButtonChangeEvent,
  RadioButtonEmits,
  RadioButtonProps,
  RadioButtonSize,
};

defineOptions({
  name: "MwRadioButton",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<RadioButtonProps>(), {
  modelValue: undefined,
  value: undefined,
  binary: false,
  name: undefined,
  inputId: undefined,
  id: undefined,
  tabindex: undefined,
  disabled: false,
  invalid: false,
  readonly: false,
  required: false,
  size: "md",
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
});

const emit = defineEmits<RadioButtonEmits>();

const attrs = useAttrs();
const inputEl = ref<HTMLInputElement | null>(null);
let handledInCurrentTurn = false;

function isSameValue(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

const isChecked = computed<boolean>(() => {
  if (props.binary) {
    return Boolean(props.modelValue);
  }
  if (props.modelValue === undefined || props.value === undefined) {
    return false;
  }
  return isSameValue(props.modelValue, props.value);
});

const resolvedSize = computed<"sm" | "md" | "lg">(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  return "md";
});

const rootClass = computed(() => [
  "mw-radio",
  `mw-radio--${resolvedSize.value}`,
  {
    "mw-radio--checked": isChecked.value,
    "mw-radio--disabled": props.disabled,
    "mw-radio--readonly": props.readonly,
    "mw-radio--invalid": props.invalid,
  },
  attrs.class,
]);

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function commitSelection(event: Event) {
  if (props.disabled || props.readonly) return;
  if (handledInCurrentTurn) return;
  handledInCurrentTurn = true;
  queueMicrotask(() => {
    handledInCurrentTurn = false;
  });

  const nextValue = props.binary ? !isChecked.value : props.value;
  emit("update:modelValue", nextValue);
  emit("change", { originalEvent: event, value: nextValue });
}

function onInputClick(event: MouseEvent) {
  if (props.disabled || props.readonly) {
    event.preventDefault();
    return;
  }
  commitSelection(event);
}

function onInputChange(event: Event) {
  if (props.disabled || props.readonly) {
    event.preventDefault();
    if (inputEl.value) {
      inputEl.value.checked = isChecked.value;
    }
    return;
  }
  commitSelection(event);
}

function onRootClick(event: MouseEvent) {
  if (props.disabled || props.readonly) {
    event.preventDefault();
    return;
  }
  if (event.target === inputEl.value) return;
  inputEl.value?.focus();
  commitSelection(event);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === " " || event.key === "Spacebar") {
    if (props.disabled || props.readonly) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    commitSelection(event);
  }
}

defineExpose({
  focus: () => inputEl.value?.focus(),
  el: inputEl,
});
</script>

<template>
  <div
    :class="rootClass"
    :style="($attrs.style as CSSProperties)"
    :data-state="isChecked ? 'checked' : 'unchecked'"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-size="resolvedSize"
    @click="onRootClick"
  >
    <input
      ref="inputEl"
      v-bind="controlAttrs"
      type="radio"
      class="mw-radio__input"
      :id="inputId ?? id"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :tabindex="tabindex"
      :aria-checked="isChecked ? 'true' : 'false'"
      :aria-label="ariaLabel ?? (attrs['aria-label'] as string | undefined)"
      :aria-labelledby="ariaLabelledby ?? (attrs['aria-labelledby'] as string | undefined)"
      :aria-describedby="ariaDescribedby ?? (attrs['aria-describedby'] as string | undefined)"
      :aria-invalid="invalid || undefined"
      :aria-readonly="readonly || undefined"
      :data-state="isChecked ? 'checked' : 'unchecked'"
      :data-invalid="invalid ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
      :data-readonly="readonly ? '' : undefined"
      @click="onInputClick"
      @change="onInputChange"
      @keydown="onKeydown"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <span class="mw-radio__box mw-control" aria-hidden="true">
      <span class="mw-radio__icon" />
    </span>
  </div>
</template>
