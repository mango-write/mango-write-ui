<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { readMpInputValue } from "../lib/mp-dom.js";

defineOptions({
  name: "MwMpTextarea",
  inheritAttrs: false,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export interface MpTextareaProps {
  modelValue?: string;
  inputId?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  maxlength?: number;
  showCount?: boolean;
  ariaLabel?: string;
  dataTestid?: string;
}

const props = withDefaults(defineProps<MpTextareaProps>(), {
  modelValue: "",
  inputId: undefined,
  placeholder: "",
  disabled: false,
  readonly: false,
  required: false,
  invalid: false,
  maxlength: undefined,
  showCount: true,
  ariaLabel: undefined,
  dataTestid: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
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
</script>

<template>
  <div class="mw-mp-textarea-wrap" :class="$attrs.class" :style="($attrs.style as any)">
    <textarea
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
      class="mw-mp-textarea"
      :class="{ 'is-focused': focused, 'is-invalid': invalid, 'is-disabled': disabled }"
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
    />
    <span v-if="showCount && maxlength" class="mw-mp-textarea__count mw-tabular">
      {{ modelValue.length }} / {{ maxlength }}
    </span>
  </div>
</template>
