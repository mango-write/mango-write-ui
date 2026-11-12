<script setup lang="ts">
import { computed, ref, useAttrs, watch, type CSSProperties } from "vue";
import { ChevronDown, ChevronUp, Minus, Plus, X } from "lucide-vue-next";
import type {
  InputNumberButtonLayout,
  InputNumberClassValue,
  InputNumberEmits,
  InputNumberInputEvent,
  InputNumberMode,
  InputNumberProps,
  InputNumberSize,
} from "./input-number.js";

export type {
  InputNumberButtonLayout,
  InputNumberClassValue,
  InputNumberEmits,
  InputNumberInputEvent,
  InputNumberMode,
  InputNumberProps,
  InputNumberSize,
};

defineOptions({
  name: "MwInputNumber",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<InputNumberProps>(), {
  modelValue: null,
  min: undefined,
  max: undefined,
  step: 1,
  minFractionDigits: undefined,
  maxFractionDigits: undefined,
  useGrouping: true,
  prefix: undefined,
  suffix: undefined,
  mode: "decimal",
  currency: undefined,
  locale: undefined,
  showButtons: false,
  buttonLayout: "stacked",
  showClear: false,
  allowEmpty: true,
  placeholder: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  fluid: false,
  size: undefined,
  inputId: undefined,
  id: undefined,
  name: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  inputClass: undefined,
  inputStyle: undefined,
});

const emit = defineEmits<InputNumberEmits>();

const attrs = useAttrs();
const inputEl = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);

const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  if (props.size === "xs" || props.size === "md") return props.size;
  return undefined;
});

function countDecimals(num: number): number {
  if (!Number.isFinite(num)) return 0;
  const str = String(num);
  const expIdx = str.indexOf("e-");
  if (expIdx !== -1) {
    return parseInt(str.slice(expIdx + 2), 10) || 0;
  }
  const dotIdx = str.indexOf(".");
  return dotIdx === -1 ? 0 : str.length - dotIdx - 1;
}

function roundToPrecision(val: number): number {
  if (props.maxFractionDigits !== undefined && props.maxFractionDigits >= 0) {
    const factor = 10 ** props.maxFractionDigits;
    return Math.round((val + Number.EPSILON) * factor) / factor;
  }
  return val;
}

function clampValue(val: number): number {
  let next = roundToPrecision(val);
  if (props.min !== undefined && next < props.min) {
    next = props.min;
  }
  if (props.max !== undefined && next > props.max) {
    next = props.max;
  }
  return next;
}

function formatValue(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return "";
  }
  const rounded = roundToPrecision(val);
  let core: string;

  if (props.mode === "currency" && props.currency) {
    try {
      core = new Intl.NumberFormat(props.locale, {
        style: "currency",
        currency: props.currency,
        useGrouping: props.useGrouping !== false,
        minimumFractionDigits: props.minFractionDigits,
        maximumFractionDigits: props.maxFractionDigits,
      }).format(rounded);
    } catch {
      core = String(rounded);
    }
  } else if (
    props.useGrouping === false &&
    props.minFractionDigits === undefined &&
    props.maxFractionDigits === undefined
  ) {
    core = String(rounded);
  } else if (props.useGrouping === false && props.minFractionDigits !== undefined) {
    const maxFrac =
      props.maxFractionDigits !== undefined
        ? Math.max(props.minFractionDigits, props.maxFractionDigits)
        : Math.max(props.minFractionDigits, countDecimals(rounded));
    core = rounded.toFixed(Math.min(20, Math.max(props.minFractionDigits, Math.min(maxFrac, countDecimals(rounded)))));
  } else if (props.useGrouping === false) {
    core = String(rounded);
  } else {
    try {
      const minFrac = props.minFractionDigits;
      const maxFrac =
        props.maxFractionDigits ??
        (minFrac !== undefined ? Math.max(minFrac, 3) : Math.max(3, countDecimals(rounded)));
      core = new Intl.NumberFormat(props.locale, {
        style: "decimal",
        useGrouping: true,
        minimumFractionDigits: minFrac,
        maximumFractionDigits: Math.min(20, maxFrac),
      }).format(rounded);
    } catch {
      core = String(rounded);
    }
  }

  return `${props.prefix ?? ""}${core}${props.suffix ?? ""}`;
}

type ParseResult =
  | { kind: "empty"; value: null }
  | { kind: "incomplete"; value: null }
  | { kind: "invalid"; value: null }
  | { kind: "number"; value: number };

function parseRaw(raw: string): ParseResult {
  let str = raw;
  if (props.prefix && str.startsWith(props.prefix)) {
    str = str.slice(props.prefix.length);
  }
  if (props.suffix && str.endsWith(props.suffix)) {
    str = str.slice(0, str.length - props.suffix.length);
  }
  str = str.trim();
  if (str === "") {
    return { kind: "empty", value: null };
  }

  let cleaned = str.replace(/[\s,_]/g, "");
  if (props.mode === "currency") {
    cleaned = cleaned.replace(/^[^\d+-]+|[^\d.]+$/g, "");
  }
  if (cleaned === "") {
    return { kind: "empty", value: null };
  }
  if (
    cleaned === "-" ||
    cleaned === "+" ||
    cleaned === "." ||
    cleaned === "-." ||
    cleaned === "+."
  ) {
    return { kind: "incomplete", value: null };
  }
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(cleaned)) {
    return { kind: "invalid", value: null };
  }
  const num = Number(cleaned);
  if (!Number.isFinite(num)) {
    return { kind: "invalid", value: null };
  }
  return { kind: "number", value: num };
}

const displayText = ref<string>(formatValue(props.modelValue));

watch(
  () => [
    props.modelValue,
    props.useGrouping,
    props.minFractionDigits,
    props.maxFractionDigits,
    props.prefix,
    props.suffix,
    props.mode,
    props.currency,
    props.locale,
  ],
  () => {
    const val = props.modelValue;
    if (val === null || val === undefined || !Number.isFinite(val)) {
      if (!isFocused.value || parseRaw(displayText.value).kind === "number") {
        displayText.value = "";
      }
      return;
    }
    if (!isFocused.value) {
      displayText.value = formatValue(val);
      return;
    }
    const currentParsed = parseRaw(displayText.value);
    if (currentParsed.kind !== "number" || currentParsed.value !== val) {
      displayText.value = formatValue(val);
    }
  },
);

const rootId = computed(() => {
  if (props.inputId && props.id && props.id !== props.inputId) {
    return props.id;
  }
  return undefined;
});

const resolvedInputId = computed(() => props.inputId ?? props.id);

const rootClass = computed(() => [
  "mw-input-number",
  resolvedSize.value ? [`mw-input-number--${resolvedSize.value}`, `mw-size-${resolvedSize.value}`] : undefined,
  {
    "mw-input-number--fluid": props.fluid,
    "mw-input-number--buttons": props.showButtons,
    [`mw-input-number--${props.buttonLayout}`]: props.showButtons,
    [`mw-input-number--buttons-${props.buttonLayout}`]: props.showButtons,
    "mw-input-number--disabled": props.disabled,
    "mw-input-number--readonly": props.readonly,
    "mw-input-number--invalid": props.invalid,
  },
  attrs.class,
]);

const inputClasses = computed(() => [
  "mw-input-number__input",
  "mw-control",
  "mw-input",
  resolvedSize.value ? `mw-input-number__input--${resolvedSize.value}` : undefined,
  props.inputClass,
]);

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const isAtMin = computed(() => {
  if (props.min === undefined) return false;
  if (props.modelValue === null || props.modelValue === undefined) return false;
  return props.modelValue <= props.min;
});

const isAtMax = computed(() => {
  if (props.max === undefined) return false;
  if (props.modelValue === null || props.modelValue === undefined) return false;
  return props.modelValue >= props.max;
});

const showClearButton = computed(
  () =>
    props.showClear &&
    props.allowEmpty !== false &&
    props.modelValue !== null &&
    props.modelValue !== undefined &&
    !props.disabled &&
    !props.readonly,
);

function handleRawChange(raw: string, event: Event) {
  displayText.value = raw;
  const parsed = parseRaw(raw);
  if (parsed.kind === "empty") {
    if (props.allowEmpty !== false) {
      emit("input", { originalEvent: event, value: null, formattedValue: "" });
      emit("update:modelValue", null);
    }
    return;
  }
  if (parsed.kind === "number") {
    const val = roundToPrecision(parsed.value);
    emit("input", { originalEvent: event, value: val, formattedValue: raw });
    emit("update:modelValue", val);
  }
}

function onInput(event: Event) {
  if (props.disabled || props.readonly) return;
  const target = event.target as HTMLInputElement;
  handleRawChange(target.value, event);
}

function onKeypress(event: KeyboardEvent) {
  if (props.disabled || props.readonly) {
    event.preventDefault();
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const ch =
    event.key && event.key.length === 1
      ? event.key
      : event.charCode
        ? String.fromCharCode(event.charCode)
        : "";
  if (!ch) return;

  if (!/^[0-9.,+-]$/.test(ch)) {
    event.preventDefault();
    return;
  }

  // In synthetic DOM tests (e.g. trigger('keypress', { key: '0' })) the browser
  // does not automatically insert the character or fire 'input'. Intercepting here
  // guarantees both real browsers and synthetic keypress tests behave identically.
  event.preventDefault();
  const el = inputEl.value;
  const current = el ? el.value : displayText.value;
  const start = el?.selectionStart ?? current.length;
  const end = el?.selectionEnd ?? current.length;
  const nextRaw = `${current.slice(0, start)}${ch}${current.slice(end)}`;
  if (el) {
    el.value = nextRaw;
  }
  handleRawChange(nextRaw, event);
}

function stepBy(direction: 1 | -1, event: Event) {
  if (props.disabled || props.readonly) return;
  const stepAmount = props.step && props.step > 0 ? props.step : 1;
  const currentParsed = parseRaw(displayText.value);
  const currentVal =
    currentParsed.kind === "number"
      ? currentParsed.value
      : props.modelValue !== null && props.modelValue !== undefined && Number.isFinite(props.modelValue)
        ? props.modelValue
        : 0;

  const precision = Math.max(
    countDecimals(currentVal),
    countDecimals(stepAmount),
    props.maxFractionDigits ?? 0,
  );
  const rawNext = Number((currentVal + direction * stepAmount).toFixed(Math.min(20, precision)));
  const clamped = clampValue(rawNext);
  const formatted = formatValue(clamped);
  displayText.value = formatted;
  if (inputEl.value) {
    inputEl.value.value = formatted;
  }
  emit("input", { originalEvent: event, value: clamped, formattedValue: formatted });
  emit("update:modelValue", clamped);
}

function onKeydown(event: KeyboardEvent) {
  emit("keydown", event);
  if (props.disabled || props.readonly) return;
  if (event.key === "ArrowUp") {
    event.preventDefault();
    stepBy(1, event);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    stepBy(-1, event);
  } else if (event.key === "Enter") {
    commitDisplayValue();
  }
}

function commitDisplayValue() {
  const raw = inputEl.value ? inputEl.value.value : displayText.value;
  const parsed = parseRaw(raw);
  if (parsed.kind === "empty" || parsed.kind === "incomplete") {
    if (props.allowEmpty !== false) {
      displayText.value = "";
      if (inputEl.value) {
        inputEl.value.value = "";
      }
      emit("update:modelValue", null);
    } else {
      const fallback = clampValue(props.min ?? 0);
      const formatted = formatValue(fallback);
      displayText.value = formatted;
      if (inputEl.value) {
        inputEl.value.value = formatted;
      }
      emit("update:modelValue", fallback);
    }
    return;
  }
  if (parsed.kind === "number") {
    const clamped = clampValue(parsed.value);
    const formatted = formatValue(clamped);
    displayText.value = formatted;
    if (inputEl.value) {
      inputEl.value.value = formatted;
    }
    if (clamped !== props.modelValue) {
      emit("update:modelValue", clamped);
    }
    return;
  }
  const restored = formatValue(props.modelValue);
  displayText.value = restored;
  if (inputEl.value) {
    inputEl.value.value = restored;
  }
}

function onFocus(event: FocusEvent) {
  isFocused.value = true;
  emit("focus", event);
}

function onBlur(event: FocusEvent) {
  isFocused.value = false;
  commitDisplayValue();
  emit("blur", event);
}

function onClear(event: MouseEvent) {
  if (props.disabled || props.readonly || props.allowEmpty === false) return;
  displayText.value = "";
  if (inputEl.value) {
    inputEl.value.value = "";
  }
  emit("input", { originalEvent: event, value: null, formattedValue: "" });
  emit("update:modelValue", null);
}

defineExpose({
  focus: () => inputEl.value?.focus(),
  el: inputEl,
});
</script>

<template>
  <span
    :id="rootId"
    :class="rootClass"
    :style="($attrs.style as CSSProperties)"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-size="resolvedSize"
  >
    <button
      v-if="showButtons && buttonLayout === 'horizontal'"
      type="button"
      class="mw-input-number__button mw-input-number__button--down"
      :disabled="disabled || readonly || isAtMin"
      tabindex="-1"
      aria-label="Decrement"
      @click="stepBy(-1, $event)"
    >
      <Minus :size="12" aria-hidden="true" />
    </button>

    <button
      v-if="showButtons && buttonLayout === 'vertical'"
      type="button"
      class="mw-input-number__button mw-input-number__button--up"
      :disabled="disabled || readonly || isAtMax"
      tabindex="-1"
      aria-label="Increment"
      @click="stepBy(1, $event)"
    >
      <ChevronUp :size="12" aria-hidden="true" />
    </button>

    <input
      ref="inputEl"
      v-bind="controlAttrs"
      type="text"
      role="spinbutton"
      :id="resolvedInputId"
      :name="name"
      :class="inputClasses"
      :style="(inputStyle as CSSProperties)"
      :value="displayText"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :inputmode="maxFractionDigits === 0 ? 'numeric' : 'decimal'"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue ?? undefined"
      :aria-label="ariaLabel ?? (attrs['aria-label'] as string | undefined)"
      :aria-labelledby="ariaLabelledby ?? (attrs['aria-labelledby'] as string | undefined)"
      :aria-describedby="ariaDescribedby ?? (attrs['aria-describedby'] as string | undefined)"
      :aria-invalid="invalid || undefined"
      :aria-readonly="readonly || undefined"
      :aria-required="required || undefined"
      :data-invalid="invalid ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
      :data-readonly="readonly ? '' : undefined"
      :data-size="resolvedSize"
      autocomplete="off"
      @keypress="onKeypress"
      @input="onInput"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
    />

    <button
      v-if="showClearButton"
      type="button"
      class="mw-input-number__clear"
      aria-label="Clear"
      tabindex="-1"
      @mousedown.prevent
      @click="onClear"
    >
      <X :size="12" aria-hidden="true" />
    </button>

    <span
      v-if="showButtons && buttonLayout === 'stacked'"
      class="mw-input-number__button-group"
    >
      <button
        type="button"
        class="mw-input-number__button mw-input-number__button--up"
        :disabled="disabled || readonly || isAtMax"
        tabindex="-1"
        aria-label="Increment"
        @click="stepBy(1, $event)"
      >
        <ChevronUp :size="12" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="mw-input-number__button mw-input-number__button--down"
        :disabled="disabled || readonly || isAtMin"
        tabindex="-1"
        aria-label="Decrement"
        @click="stepBy(-1, $event)"
      >
        <ChevronDown :size="12" aria-hidden="true" />
      </button>
    </span>

    <button
      v-if="showButtons && buttonLayout === 'horizontal'"
      type="button"
      class="mw-input-number__button mw-input-number__button--up"
      :disabled="disabled || readonly || isAtMax"
      tabindex="-1"
      aria-label="Increment"
      @click="stepBy(1, $event)"
    >
      <Plus :size="12" aria-hidden="true" />
    </button>

    <button
      v-if="showButtons && buttonLayout === 'vertical'"
      type="button"
      class="mw-input-number__button mw-input-number__button--down"
      :disabled="disabled || readonly || isAtMin"
      tabindex="-1"
      aria-label="Decrement"
      @click="stepBy(-1, $event)"
    >
      <ChevronDown :size="12" aria-hidden="true" />
    </button>
  </span>
</template>
