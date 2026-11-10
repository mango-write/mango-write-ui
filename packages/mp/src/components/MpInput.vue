<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { readMpInputValue } from "../lib/mp-dom.js";
import MpIcon from "./MpIcon.vue";

defineOptions({
  name: "MwMpInput",
  inheritAttrs: false,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export interface MpInputProps {
  modelValue?: string;
  inputId?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  maxlength?: number;
  clearable?: boolean;
  ariaLabel?: string;
  clearLabel?: string;
  dataTestid?: string;
}

const props = withDefaults(defineProps<MpInputProps>(), {
  modelValue: "",
  inputId: undefined,
  placeholder: "",
  disabled: false,
  readonly: false,
  required: false,
  invalid: false,
  maxlength: undefined,
  clearable: false,
  ariaLabel: undefined,
  clearLabel: "清空输入",
  dataTestid: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  clear: [];
  enter: [value: string];
}>();
const attrs = useAttrs();
const composing = ref(false);
const focused = ref(false);
const controlAttrs = computed<Record<string, any>>(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function onInput(event: unknown): void {
  if (!composing.value) emit("update:modelValue", readMpInputValue(event));
}
function onCompositionEnd(event: unknown): void {
  composing.value = false;
  emit("update:modelValue", readMpInputValue(event));
}
function onFocus(event: FocusEvent): void {
  focused.value = true;
  emit("focus", event);
}
function onBlur(event: FocusEvent): void {
  focused.value = false;
  emit("blur", event);
}
function onClear(): void {
  if (props.disabled || props.readonly) return;
  emit("update:modelValue", "");
  emit("clear");
}
function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !composing.value) emit("enter", props.modelValue);
}
</script>

<template>
  <div
    class="mw-mp-input-wrap"
    :class="[$attrs.class, { 'is-focused': focused, 'is-invalid': invalid, 'is-disabled': disabled }]"
    :style="($attrs.style as any)"
  >
    <input
      :name="controlAttrs.name"
      :autocomplete="controlAttrs.autocomplete"
      :inputmode="controlAttrs.inputmode"
      :enterkeyhint="controlAttrs.enterkeyhint"
      :aria-labelledby="controlAttrs['aria-labelledby']"
      :aria-describedby="controlAttrs['aria-describedby']"
      :aria-required="controlAttrs['aria-required']"
      :aria-hidden="controlAttrs['aria-hidden']"
      :data-testid="dataTestid || controlAttrs['data-testid']"
      :id="inputId"
      type="text"
      class="mw-mp-input"
      :class="{ 'mw-mp-input--clearable': clearable && modelValue && !disabled && !readonly }"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :maxlength="maxlength"
      :aria-label="ariaLabel || placeholder"
      :aria-invalid="invalid ? 'true' : undefined"
      :data-invalid="invalid ? 'true' : undefined"
      :data-disabled="disabled ? 'true' : undefined"
      @input="onInput"
      @compositionstart="composing = true"
      @compositionend="onCompositionEnd"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    />
    <button
      v-if="clearable && modelValue && !disabled && !readonly"
      type="button"
      class="mw-mp-input__clear"
      hover-class="is-pressed"
      :aria-label="clearLabel"
      data-testid="mp-input-clear"
      @click="onClear"
    >
      <MpIcon name="close" :size="18" />
    </button>
  </div>
</template>
