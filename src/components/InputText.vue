<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";

defineOptions({
  name: "MwInputText",
  inheritAttrs: false,
});

export type InputTextSize = "sm" | "md" | "lg" | "small" | "large";

export interface InputTextProps {
  modelValue?: string | null;
  inputId?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  fluid?: boolean;
  size?: InputTextSize;
  maxlength?: number | string;
  min?: number | string;
  step?: number | string;
  autocomplete?: string;
  autofocus?: boolean;
  inputmode?: string;
  spellcheck?: boolean;
}

const props = withDefaults(defineProps<InputTextProps>(), {
  modelValue: "",
  inputId: undefined,
  id: undefined,
  name: undefined,
  type: "text",
  placeholder: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  fluid: false,
  size: "md",
  maxlength: undefined,
  min: undefined,
  step: undefined,
  autocomplete: undefined,
  autofocus: false,
  inputmode: undefined,
  spellcheck: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  input: [event: Event];
  change: [event: Event];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
  keyup: [event: KeyboardEvent];
  click: [event: MouseEvent];
}>();

const attrs = useAttrs();
const inputEl = ref<HTMLInputElement | null>(null);
const isComposing = ref(false);

const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  return "md";
});

const rootClass = computed(() => [
  "mw-input-text",
  "mw-control",
  "mw-input",
  `mw-input-text--${resolvedSize.value}`,
  {
    "mw-input-text--fluid": props.fluid,
  },
  attrs.class,
]);

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function onCompositionStart() {
  isComposing.value = true;
}

function onCompositionEnd(event: CompositionEvent) {
  if (!isComposing.value) return;
  isComposing.value = false;
  const target = event.target as HTMLInputElement | null;
  emit("update:modelValue", target?.value ?? "");
}

function onInput(event: Event) {
  emit("input", event);
  const inputEvent = event as InputEvent;
  if (isComposing.value || inputEvent.isComposing) {
    return;
  }
  const target = event.target as HTMLInputElement | null;
  emit("update:modelValue", target?.value ?? "");
}

defineExpose({
  focus: () => inputEl.value?.focus(),
  el: inputEl,
});
</script>

<template>
  <input
    ref="inputEl"
    v-bind="controlAttrs"
    :id="inputId ?? id"
    :name="name"
    :type="type"
    :class="rootClass"
    :style="($attrs.style as any)"
    :value="modelValue ?? ''"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :maxlength="maxlength"
    :min="min"
    :step="step"
    :autocomplete="autocomplete"
    :autofocus="autofocus"
    :inputmode="(inputmode as any)"
    :spellcheck="spellcheck"
    :aria-invalid="invalid || undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-size="resolvedSize"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
    @input="onInput"
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @keydown="emit('keydown', $event)"
    @keyup="emit('keyup', $event)"
    @click="emit('click', $event)"
  />
</template>

<style scoped>
.mw-input-text {
  display: inline-block;
  min-height: var(--control-height-default);
  padding-inline: var(--space-3);
  padding-block: var(--space-2);
  border-radius: var(--radius);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
  color: var(--color-text-primary);
}

.mw-input-text::placeholder {
  color: var(--color-text-tertiary);
}

.mw-input-text--sm {
  min-height: var(--control-height-compact);
  padding-inline: var(--space-2);
  padding-block: var(--space-1);
  font-size: var(--font-size-caption);
}

.mw-input-text--lg {
  min-height: var(--control-height-large);
  padding-inline: var(--space-4);
  padding-block: var(--space-3);
  font-size: var(--font-size-body);
}

.mw-input-text--fluid {
  width: 100%;
}
</style>
