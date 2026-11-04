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
  "p-radiobutton",
  `mw-radio--${resolvedSize.value}`,
  {
    "mw-radio--checked": isChecked.value,
    "p-radiobutton-checked": isChecked.value,
    "mw-radio--disabled": props.disabled,
    "p-disabled": props.disabled,
    "mw-radio--readonly": props.readonly,
    "mw-radio--invalid": props.invalid,
    "p-invalid": props.invalid,
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
      class="mw-radio__input p-radiobutton-input"
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
    <span class="mw-radio__box mw-control p-radiobutton-box" aria-hidden="true">
      <span class="mw-radio__icon p-radiobutton-icon" />
    </span>
  </div>
</template>

<style scoped>
.mw-radio {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  vertical-align: middle;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
}

.mw-radio--sm {
  width: 16px;
  height: 16px;
}

.mw-radio--lg {
  width: 20px;
  height: 20px;
}

.mw-radio--disabled,
.mw-radio[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-radio--readonly,
.mw-radio[data-readonly] {
  cursor: default;
}

.mw-radio__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 1;
}

.mw-radio__box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-pill);
  background-color: var(--color-surface-base);
  background-image: var(--material-control-face);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--material-control-inset);
  pointer-events: none;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-radio:hover:not([data-disabled]):not([data-readonly]) .mw-radio__box {
  border-color: var(--color-brand-500);
}

.mw-radio__input:focus-visible + .mw-radio__box {
  border-color: var(--color-brand-500);
  box-shadow: var(--effect-focus-ring);
}

.mw-radio[data-invalid] .mw-radio__box {
  border-color: var(--color-danger-500);
}

.mw-radio--checked .mw-radio__box,
.mw-radio[data-state="checked"] .mw-radio__box {
  background-color: var(--color-brand-500);
  background-image: none;
  border-color: var(--color-brand-500);
  box-shadow: none;
}

.mw-radio__icon {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
  background-color: var(--color-text-on-brand);
  transform: scale(0);
  transition: transform var(--motion-duration-fast) var(--motion-spring-pop);
}

.mw-radio--sm .mw-radio__icon {
  width: 6px;
  height: 6px;
}

.mw-radio--lg .mw-radio__icon {
  width: 10px;
  height: 10px;
}

.mw-radio--checked .mw-radio__icon,
.mw-radio[data-state="checked"] .mw-radio__icon {
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .mw-radio__box,
  .mw-radio__icon {
    transition: none;
  }
}
</style>
