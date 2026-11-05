<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from "reka-ui";
import { computed, useAttrs } from "vue";

defineOptions({
  name: "MwToggleSwitch",
  inheritAttrs: false,
});

export interface ToggleSwitchProps {
  modelValue?: boolean;
  inputId?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
}

const props = withDefaults(defineProps<ToggleSwitchProps>(), {
  modelValue: false,
  inputId: undefined,
  id: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  change: [value: boolean];
}>();

const attrs = useAttrs();

const rootClass = computed(() => [
  "mw-toggle-switch",
  "mw-control",
  {
    "mw-toggle-switch--checked": props.modelValue,
  },
  attrs.class,
]);

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function onUpdateModelValue(value: boolean) {
  if (props.disabled || props.readonly) return;
  emit("update:modelValue", value);
  emit("change", value);
}

function onClickCapture(event: MouseEvent) {
  if (props.disabled || props.readonly) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function onKeydownCapture(event: KeyboardEvent) {
  if (
    (props.disabled || props.readonly) &&
    (event.key === " " || event.key === "Spacebar" || event.key === "Enter")
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
}
</script>

<template>
  <SwitchRoot
    v-bind="controlAttrs"
    :id="inputId ?? id"
    :name="name"
    :class="rootClass"
    :style="($attrs.style as any)"
    :model-value="modelValue"
    :disabled="disabled"
    :required="required"
    :aria-invalid="invalid || undefined"
    :aria-readonly="readonly || undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    @click.capture="onClickCapture"
    @keydown.capture="onKeydownCapture"
    @update:model-value="onUpdateModelValue"
  >
    <SwitchThumb class="mw-toggle-switch__thumb" />
  </SwitchRoot>
</template>

<style scoped>
.mw-toggle-switch {
  --_ts-w: calc(var(--size-md-h) + var(--space-1-5));
  --_ts-h: calc(var(--icon-md) + var(--space-1));
  --_ts-thumb: var(--icon-sm);
  --_ts-shift: calc(var(--_ts-w) - 2 * var(--border-width) - 2 * var(--space-0-5) - var(--_ts-thumb));
  position: relative;
  display: inline-flex;
  align-items: center;
  width: var(--_ts-w);
  height: var(--_ts-h);
  padding: var(--space-0-5);
  border-radius: var(--radius-full);
  background-color: var(--fill-strong);
  background-image: none;
  border: var(--border-width) solid var(--border-strong);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.mw-toggle-switch[data-state="checked"] {
  background-color: var(--accent);
  border-color: var(--accent);
}

/* 根节点带 .mw-control，全局 hover 会以更高优先级把轨道刷成近白、吞掉白片旋钮；
   这里用 data-state + :not 链压过它（同 Checkbox）。 */
.mw-toggle-switch[data-state="unchecked"]:hover:not(:disabled):not([data-disabled]):not([data-readonly]) {
  background-color: var(--fill-strong);
}

.mw-toggle-switch[data-state="checked"]:hover:not(:disabled):not([data-disabled]):not([data-readonly]) {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.mw-toggle-switch__thumb {
  display: block;
  width: var(--_ts-thumb);
  height: var(--_ts-thumb);
  border-radius: var(--radius-full);
  /* 旋钮恒为「纸」粒，开合语义由轨道色表达。 */
  background-color: var(--control-knob); /* opaque-ok: physical switch thumb */
  box-shadow: var(--shadow-raised);
  transition: transform var(--duration-base) var(--ease-spring-pop);
  transform: translateX(0);
}

.mw-toggle-switch[data-state="checked"] .mw-toggle-switch__thumb {
  transform: translateX(var(--_ts-shift));
}

@media (prefers-reduced-motion: reduce) {
  .mw-toggle-switch,
  .mw-toggle-switch__thumb {
    transition: none;
  }
}
</style>
