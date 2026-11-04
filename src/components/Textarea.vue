<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, watch } from "vue";

defineOptions({
  name: "MwTextarea",
  inheritAttrs: false,
});

export interface TextareaProps {
  modelValue?: string | null;
  inputId?: string;
  id?: string;
  name?: string;
  rows?: number | string;
  autoResize?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  fluid?: boolean;
  maxlength?: number | string;
  autocomplete?: string;
  spellcheck?: boolean | "true" | "false";
}

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: "",
  inputId: undefined,
  id: undefined,
  name: undefined,
  rows: 3,
  autoResize: false,
  placeholder: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  fluid: false,
  maxlength: undefined,
  autocomplete: undefined,
  spellcheck: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  input: [event: Event];
  change: [event: Event];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
  click: [event: MouseEvent];
}>();

const attrs = useAttrs();
const textareaEl = ref<HTMLTextAreaElement | null>(null);
const isComposing = ref(false);

const rootClass = computed(() => [
  "mw-textarea",
  "mw-control",
  {
    "mw-textarea--fluid": props.fluid,
    "mw-textarea--autoresize": props.autoResize,
  },
  attrs.class,
]);

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function resize() {
  const el = textareaEl.value;
  if (!el || !props.autoResize) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function onCompositionStart() {
  isComposing.value = true;
}

function onCompositionEnd(event: CompositionEvent) {
  if (!isComposing.value) return;
  isComposing.value = false;
  const target = event.target as HTMLTextAreaElement | null;
  emit("update:modelValue", target?.value ?? "");
  resize();
}

function onInput(event: Event) {
  emit("input", event);
  resize();
  const inputEvent = event as InputEvent;
  if (isComposing.value || inputEvent.isComposing) {
    return;
  }
  const target = event.target as HTMLTextAreaElement | null;
  emit("update:modelValue", target?.value ?? "");
}

watch(
  () => props.modelValue,
  () => {
    if (props.autoResize) {
      resize();
    }
  },
  { flush: "post" },
);

onMounted(() => {
  if (props.autoResize) {
    resize();
  }
});

defineExpose({
  focus: () => textareaEl.value?.focus(),
  el: textareaEl,
});
</script>

<template>
  <textarea
    ref="textareaEl"
    v-bind="controlAttrs"
    :id="inputId ?? id"
    :name="name"
    :rows="rows"
    :class="rootClass"
    :style="($attrs.style as any)"
    :value="modelValue ?? ''"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :maxlength="maxlength"
    :autocomplete="autocomplete"
    :spellcheck="spellcheck"
    :aria-invalid="invalid || undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
    @input="onInput"
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @keydown="emit('keydown', $event)"
    @click="emit('click', $event)"
  />
</template>

<style scoped>
.mw-textarea {
  display: block;
  width: 100%;
  padding-inline: var(--space-3);
  padding-block: var(--space-2);
  border-radius: var(--radius);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  resize: vertical;
}

.mw-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.mw-textarea--autoresize {
  resize: none;
  overflow: hidden;
}

.mw-textarea--fluid {
  width: 100%;
}
</style>
