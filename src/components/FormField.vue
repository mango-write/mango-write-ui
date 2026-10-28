<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    inputId: string;
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
  }>(),
  {
    hint: undefined,
    error: undefined,
    required: false,
  },
);

const hintId = computed(() => `${props.inputId}-hint`);
const errorId = computed(() => `${props.inputId}-error`);
const describedBy = computed(() =>
  [props.hint ? hintId.value : null, props.error ? errorId.value : null]
    .filter(Boolean)
    .join(" ") || undefined,
);
</script>

<template>
  <div class="mw-form-field">
    <label class="mw-form-field__label" :for="inputId">
      <span>{{ label }}</span>
      <span v-if="required" class="mw-form-field__required" aria-hidden="true">*</span>
    </label>
    <div class="mw-form-field__control">
      <slot
        :input-id="inputId"
        :described-by="describedBy"
        :invalid="Boolean(error)"
        :required="required"
      />
    </div>
    <p v-if="hint" :id="hintId" class="mw-form-field__message">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="mw-form-field__message mw-form-field__message--error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.mw-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mw-form-field__label {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  font-weight: 500;
}

.mw-form-field__required,
.mw-form-field__message--error {
  color: var(--color-danger-700);
}

.mw-form-field__control {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mw-form-field__message {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-body);
}
</style>
