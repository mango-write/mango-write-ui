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
  size: "md",
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  dataKey: undefined,
});

const emit = defineEmits<SelectButtonEmits>();

const attrs = useAttrs();
const groupEl = ref<HTMLElement | null>(null);

const resolvedSize = computed<"sm" | "md" | "lg">(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  return "md";
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
  "p-selectbutton",
  `mw-select-button--${resolvedSize.value}`,
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
      class="mw-select-button__item p-togglebutton"
      :class="{
        'mw-select-button__item--active': isOptionSelected(option),
        'p-togglebutton-checked': isOptionSelected(option),
        'mw-select-button__item--disabled': isOptionDisabled(option),
      }"
      :disabled="isOptionDisabled(option)"
      :aria-pressed="isOptionSelected(option) ? 'true' : 'false'"
      :data-state="isOptionSelected(option) ? 'checked' : 'unchecked'"
      :data-disabled="isOptionDisabled(option) ? '' : undefined"
      @click="onOptionClick(option, $event)"
      @keydown="onOptionKeydown(index, $event)"
    >
      <span class="mw-select-button__content p-togglebutton-content">
        <slot name="option" :option="option" :index="index">
          <slot :option="option" :index="index">
            <span class="mw-select-button__label p-togglebutton-label">
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
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: var(--radius);
  background-color: var(--color-bg-soft);
  border: 1px solid var(--color-border-subtle);
  vertical-align: middle;
}

.mw-select-button--invalid,
.mw-select-button[data-invalid] {
  border-color: var(--color-danger-500);
}

.mw-select-button--disabled,
.mw-select-button[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-select-button__item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-height: 28px;
  padding-inline: var(--space-3);
  padding-block: var(--space-1);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family-sans);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    background-color var(--motion-duration-base) var(--motion-ease-standard),
    color var(--motion-duration-base) var(--motion-ease-standard),
    box-shadow var(--motion-duration-base) var(--motion-ease-standard),
    transform var(--motion-duration-fast) var(--motion-spring-snap);
}

.mw-select-button--sm .mw-select-button__item {
  min-height: 24px;
  padding-inline: var(--space-2);
  font-size: var(--font-size-caption);
}

.mw-select-button--lg .mw-select-button__item {
  min-height: 36px;
  padding-inline: var(--space-4);
  font-size: var(--font-size-body);
}

.mw-select-button__item:hover:not(:disabled):not([data-state="checked"]) {
  color: var(--color-text-primary);
  background-color: var(--color-bg-hover);
}

.mw-select-button__item--active,
.mw-select-button__item[data-state="checked"] {
  background-color: var(--color-surface-base);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-xs);
}

.mw-select-button__item:focus-visible {
  outline: none;
  box-shadow: var(--effect-focus-ring);
}

.mw-select-button__item:active:not(:disabled) {
  transform: scale(0.97);
}

.mw-select-button__item:disabled,
.mw-select-button__item[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-select-button__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}

@media (prefers-reduced-motion: reduce) {
  .mw-select-button__item {
    transition: none;
  }
}
</style>
