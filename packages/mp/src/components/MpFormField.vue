<script setup lang="ts">
import { computed, getCurrentInstance, useAttrs } from "vue";

defineOptions({
  name: "MwMpFormField",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpFormFieldProps {
  inputId: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

const props = withDefaults(defineProps<MpFormFieldProps>(), {
  hint: undefined,
  error: undefined,
  required: false,
});
const uid = getCurrentInstance()?.uid ?? 0;
const hintId = computed(() => `mp-field-${uid}-${props.inputId}-hint`);
const errorId = computed(() => `mp-field-${uid}-${props.inputId}-error`);
const describedBy = computed(() =>
  [props.hint ? hintId.value : null, props.error ? errorId.value : null].filter(Boolean).join(" ") || undefined,
);
</script>

<template>
  <section :data-testid="attrs['data-testid']" class="mw-mp-form-field">
    <label class="mw-mp-form-field__label" :for="inputId">
      <span>{{ label }}</span>
      <span v-if="required" class="mw-mp-form-field__required" aria-hidden="true">*</span>
    </label>
    <div class="mw-mp-form-field__control">
      <slot :input-id="inputId" :described-by="describedBy" :invalid="Boolean(error)" :required="required" />
    </div>
    <p v-if="hint" :id="hintId" class="mw-mp-form-field__message">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="mw-mp-form-field__message mw-mp-form-field__message--error" role="alert">
      {{ error }}
    </p>
  </section>
</template>
