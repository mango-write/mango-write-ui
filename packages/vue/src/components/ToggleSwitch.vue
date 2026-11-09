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
