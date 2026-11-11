<script setup lang="ts">
import { computed, ref, useAttrs, type CSSProperties } from "vue";
import type {
  SelectButtonChangeEvent,
  SelectButtonEmits,
  SelectButtonOptionAccessor,
  SelectButtonProps,
  SelectButtonSize,
} from "./select-button.js";

export type {
  SelectButtonChangeEvent,
  SelectButtonEmits,
  SelectButtonOptionAccessor,
  SelectButtonProps,
  SelectButtonSize,
};

defineOptions({
  name: "MwSelectButton",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SelectButtonProps>(), {
  modelValue: undefined,
  options: () => [],
  optionLabel: undefined,
  optionValue: undefined,
  optionDisabled: undefined,
  multiple: false,
  allowEmpty: true,
  unselectable: true,
  disabled: false,
  readonly: false,
  invalid: false,
  size: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  dataKey: undefined,
});

const emit = defineEmits<SelectButtonEmits>();

const attrs = useAttrs();
const groupEl = ref<HTMLElement | null>(null);

const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  if (props.size === "xs" || props.size === "md") return props.size;
  return undefined;
});

const canEmpty = computed(() => props.allowEmpty !== false && props.unselectable !== false);

function isSameValue(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
    if (props.dataKey && props.dataKey in a && props.dataKey in b) {
      return Object.is(
        (a as Record<string, unknown>)[props.dataKey],
        (b as Record<string, unknown>)[props.dataKey],
      );
    }
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

function resolveOptionLabel(option: any): string {
  if (option === null || option === undefined) return "";
  if (typeof props.optionLabel === "function") {
    return String(props.optionLabel(option) ?? "");
  }
  if (typeof props.optionLabel === "string" && typeof option === "object") {
    return String((option as Record<string, unknown>)[props.optionLabel] ?? "");
  }
  if (typeof option === "object" && "label" in option) {
    return String((option as Record<string, unknown>).label ?? "");
  }
  return String(option);
}

function resolveOptionValue(option: any): any {
  if (option === null || option === undefined) return option;
  if (typeof props.optionValue === "function") {
    return props.optionValue(option);
  }
  if (typeof props.optionValue === "string" && typeof option === "object") {
    return (option as Record<string, unknown>)[props.optionValue];
  }
  return option;
}

function isOptionDisabled(option: any): boolean {
  if (props.disabled) return true;
  if (option === null || option === undefined) return false;
  if (typeof props.optionDisabled === "function") {
    return Boolean(props.optionDisabled(option));
  }
  if (typeof props.optionDisabled === "string" && typeof option === "object") {
    return Boolean((option as Record<string, unknown>)[props.optionDisabled]);
  }
  if (props.optionDisabled === undefined && typeof option === "object" && "disabled" in option) {
    return Boolean((option as Record<string, unknown>).disabled);
  }
  return false;
}

function isOptionSelected(option: any): boolean {
  const val = resolveOptionValue(option);
  if (props.multiple) {
    if (!Array.isArray(props.modelValue)) return false;
    return props.modelValue.some((item) => isSameValue(item, val));
  }
  if (props.modelValue === null || props.modelValue === undefined) return false;
  return isSameValue(props.modelValue, val);
}

function optionKey(option: any, index: number): string {
  const val = resolveOptionValue(option);
  if (val !== null && typeof val === "object") {
    if (props.dataKey && props.dataKey in val) {
      return `key-${String((val as Record<string, unknown>)[props.dataKey])}-${index}`;
    }
    return `obj-${index}`;
  }
  return `${typeof val}:${String(val)}-${index}`;
}

const rootClass = computed(() => [
  "mw-select-button",
  resolvedSize.value ? [`mw-select-button--${resolvedSize.value}`, `mw-size-${resolvedSize.value}`] : undefined,
  {
    "mw-select-button--disabled": props.disabled,
    "mw-select-button--readonly": props.readonly,
    "mw-select-button--invalid": props.invalid,
  },
  attrs.class,
]);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function onOptionClick(option: any, event: MouseEvent) {
  if (props.disabled || props.readonly || isOptionDisabled(option)) return;
  const val = resolveOptionValue(option);
  const selected = isOptionSelected(option);

  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? props.modelValue : [];
    let nextValue: any[];
    if (selected) {
      if (!canEmpty.value && current.length <= 1) {
        return;
      }
      nextValue = current.filter((item) => !isSameValue(item, val));
    } else {
      nextValue = [...current, val];
    }
    emit("update:modelValue", nextValue);
    emit("change", { originalEvent: event, value: nextValue });
    return;
  }

  if (selected) {
    if (!canEmpty.value) {
      return;
    }
    emit("update:modelValue", null);
    emit("change", { originalEvent: event, value: null });
    return;
  }

  emit("update:modelValue", val);
  emit("change", { originalEvent: event, value: val });
}

function onOptionKeydown(index: number, event: KeyboardEvent) {
  if (props.disabled) return;
  const list = props.options ?? [];
  if (!list.length) return;

  let targetIdx = -1;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    for (let step = 1; step <= list.length; step++) {
      const candidate = (index + step) % list.length;
      if (!isOptionDisabled(list[candidate])) {
        targetIdx = candidate;
        break;
      }
    }
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    for (let step = 1; step <= list.length; step++) {
      const candidate = (index - step + list.length) % list.length;
      if (!isOptionDisabled(list[candidate])) {
        targetIdx = candidate;
        break;
      }
    }
  } else if (event.key === "Home") {
    event.preventDefault();
    targetIdx = list.findIndex((opt) => !isOptionDisabled(opt));
  } else if (event.key === "End") {
    event.preventDefault();
    for (let i = list.length - 1; i >= 0; i--) {
      if (!isOptionDisabled(list[i])) {
        targetIdx = i;
        break;
      }
    }
  }

  if (targetIdx >= 0) {
    const buttons = groupEl.value?.querySelectorAll<HTMLButtonElement>(".mw-select-button__item");
    buttons?.[targetIdx]?.focus();
  }
}
</script>

<template>
  <div
    ref="groupEl"
    v-bind="rootAttrs"
    role="group"
    :class="rootClass"
    :style="($attrs.style as CSSProperties)"
    :aria-label="ariaLabel ?? (attrs['aria-label'] as string | undefined)"
    :aria-labelledby="ariaLabelledby ?? (attrs['aria-labelledby'] as string | undefined)"
    :aria-invalid="invalid || undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-size="resolvedSize"
  >
    <button
      v-for="(option, index) in options"
      :key="optionKey(option, index)"
      type="button"
      class="mw-select-button__item"
      :class="{
        'mw-select-button__item--active': isOptionSelected(option),
        'mw-select-button__item--disabled': isOptionDisabled(option),
      }"
      :disabled="isOptionDisabled(option)"
      :aria-pressed="isOptionSelected(option) ? 'true' : 'false'"
      :data-state="isOptionSelected(option) ? 'checked' : 'unchecked'"
      :data-disabled="isOptionDisabled(option) ? '' : undefined"
      @click="onOptionClick(option, $event)"
      @keydown="onOptionKeydown(index, $event)"
    >
      <span class="mw-select-button__content">
        <slot name="option" :option="option" :index="index">
          <slot :option="option" :index="index">
            <span class="mw-select-button__label">
              {{ resolveOptionLabel(option) }}
            </span>
          </slot>
        </slot>
      </span>
    </button>
  </div>
</template>

<style scoped>
.mw-select-button {
  --mw-select-button-inset: var(--space-0-5);

  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-0-5);
  min-height: var(--control-h);
  max-width: 100%;
  padding: calc(var(--mw-select-button-inset) - var(--border-width));
  border: var(--border-width) solid transparent;
  border-radius: var(--control-radius);
  background-color: var(--fill-default);
  vertical-align: middle;
}

.mw-select-button--invalid,
.mw-select-button[data-invalid] {
  border-color: var(--danger);
}

.mw-select-button--disabled,
.mw-select-button[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-select-button__item {
  position: relative;
  display: inline-flex;
  /* 等分充满轨道，放不下时按段换行；段标签 nowrap，min-width:auto 保证标签不被压缩 */
  flex: 1 1 0%;
  align-items: center;
  justify-content: center;
  gap: var(--control-gap);
  /* 由 token 直算而非 height:100%——根高度改 min-height 后父高内容驱动，百分比会塌；换行时每段保持额定高度 */
  height: calc(var(--control-h) - 2 * var(--mw-select-button-inset));
  padding-block: 0;
  padding-inline: calc(var(--control-px) - var(--mw-select-button-inset));
  border: 0;
  border-radius: calc(var(--control-radius) - var(--mw-select-button-inset));
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--control-font);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-select-button__item:hover:not(:disabled) {
  color: var(--text-primary);
}

.mw-select-button__item--active,
.mw-select-button__item[data-state="checked"] {
  background-color: var(--mw-select-button-thumb);
  box-shadow: var(--shadow-raised);
  color: var(--text-primary);
}

.mw-select-button__item:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: 0;
  z-index: var(--z-raised);
}

.mw-select-button__item:disabled,
.mw-select-button__item[data-disabled] {
  color: var(--text-disabled);
  cursor: not-allowed;
}

.mw-select-button--disabled .mw-select-button__item {
  color: var(--text-secondary);
}

.mw-select-button--readonly .mw-select-button__item {
  cursor: default;
}

.mw-select-button__content {
  display: inline-flex;
  align-items: center;
  gap: var(--control-gap);
}

.mw-select-button__content :deep(svg) {
  flex: none;
  width: var(--control-icon);
  height: var(--control-icon);
}

@media (prefers-reduced-motion: reduce) {
  .mw-select-button__item {
    transition: none;
  }
}
</style>

<style>
/* 深色下 --control-bg-hover 近乎透明，选中段改用 --fill-strong；按主题作用域取值，支持深浅并排。 */
:root,
[data-theme="light"] {
  --mw-select-button-thumb: var(--control-bg-hover);
}

[data-theme="dark"] {
  --mw-select-button-thumb: var(--fill-strong);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --mw-select-button-thumb: var(--fill-strong);
  }
}
</style>
