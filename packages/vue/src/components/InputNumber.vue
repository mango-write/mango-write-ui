<script setup lang="ts">
import { computed, ref, useAttrs, watch, type CSSProperties } from "vue";
import { ChevronDown, ChevronUp, Minus, Plus, X } from "lucide-vue-next";
import {
  clampNumberValue,
  countNumberDecimals,
  countSemanticTokensBeforeCaret,
  formatCommittedNumber,
  isAllowedNumberInputText,
  mapSemanticCaretToFormattedText,
  normalizeNegativeZero,
  parseNumberRaw,
  reconcileNumberEdit,
  resolveEffectiveMaxFractionDigits,
  roundNumberToPrecision,
  type NumberFormatOptions,
} from "@mango-write/ui-core/headless/number-edit";
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
const isComposing = ref(false);

const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  if (props.size === "xs" || props.size === "md") return props.size;
  return undefined;
});

const formatOptions = computed<NumberFormatOptions>(() => ({
  useGrouping: props.useGrouping,
  minFractionDigits: props.minFractionDigits,
  maxFractionDigits: props.maxFractionDigits,
  prefix: props.prefix,
  suffix: props.suffix,
  mode: props.mode,
  currency: props.currency,
  locale: props.locale,
}));

const effectiveMaxFrac = computed(() => resolveEffectiveMaxFractionDigits(formatOptions.value));

const formatSignature = computed(() =>
  [
    props.useGrouping,
    props.minFractionDigits,
    props.maxFractionDigits,
    props.prefix ?? "",
    props.suffix ?? "",
    props.mode,
    props.currency ?? "",
    props.locale ?? "",
  ].join("\u0001"),
);

function formatValue(val: number | null | undefined): string {
  return formatCommittedNumber(val, formatOptions.value);
}

function clampValue(val: number): number {
  return clampNumberValue(val, props.min, props.max, effectiveMaxFrac.value);
}

function isSameNumericModel(a: number | null | undefined, b: number | null | undefined): boolean {
  if (a === null || a === undefined || b === null || b === undefined) {
    return (a ?? null) === (b ?? null);
  }
  return normalizeNegativeZero(a) === normalizeNegativeZero(b);
}

const displayText = ref<string>(formatValue(props.modelValue));
let draftVersion = 0;
let lastEcho: { version: number; value: number | null | undefined } = {
  version: 0,
  value: props.modelValue,
};
let capturedSelection: { start: number; end: number } | null = null;
let compositionStartText: string | null = null;
let skipRedundantPostCompositionInput = false;

function setSelectionSafely(el: HTMLInputElement | null, caret: number) {
  if (!el) return;
  try {
    if (el.selectionStart !== caret || el.selectionEnd !== caret) {
      el.setSelectionRange(caret, caret);
    }
  } catch {
    // 忽略不支持选区 API 的退化环境。
  }
}

watch(
  [() => props.modelValue, formatSignature],
  ([val, nextSig], [, prevSig]) => {
    const optionsChanged = nextSig !== prevSig;
    if (val === null || val === undefined || !Number.isFinite(val)) {
      const isCurrentDraftEcho =
        !optionsChanged && lastEcho.version === draftVersion && isSameNumericModel(val, lastEcho.value);
      if (!isFocused.value || optionsChanged || !isCurrentDraftEcho) {
        if (!isFocused.value || parseNumberRaw(displayText.value, formatOptions.value).kind === "number" || !isCurrentDraftEcho) {
          displayText.value = "";
          if (inputEl.value && inputEl.value.value !== "") {
            inputEl.value.value = "";
          }
        }
        draftVersion += 1;
        lastEcho = { version: draftVersion, value: val ?? null };
      }
      return;
    }

    if (!isFocused.value || optionsChanged) {
      draftVersion += 1;
      lastEcho = { version: draftVersion, value: val };
      displayText.value = formatValue(val);
      return;
    }

    // 仅当回流值对应当前草稿版本且数值一致时视为自身回声并跳过重刷；过期异步回流或父组件修正均同步。
    if (lastEcho.version === draftVersion && isSameNumericModel(val, lastEcho.value)) {
      return;
    }

    const el = inputEl.value;
    const prevTokens = el
      ? countSemanticTokensBeforeCaret(
          displayText.value,
          el.selectionEnd ?? el.selectionStart ?? displayText.value.length,
          formatOptions.value,
        )
      : null;
    const formatted = formatValue(val);
    draftVersion += 1;
    lastEcho = { version: draftVersion, value: val };
    displayText.value = formatted;
    if (el) {
      if (el.value !== formatted) {
        el.value = formatted;
      }
      if (prevTokens !== null) {
        setSelectionSafely(
          el,
          mapSemanticCaretToFormattedText(formatted, prevTokens, formatOptions.value),
        );
      }
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

function applyRawEdit(
  rawText: string,
  rawCaret: number,
  inputType: string | undefined,
  event: Event,
  prevSel?: { start: number; end: number } | null,
) {
  const reconciled = reconcileNumberEdit({
    rawText,
    rawCaret,
    prevText: displayText.value,
    prevSelectionStart: prevSel?.start,
    prevSelectionEnd: prevSel?.end,
    inputType,
    options: formatOptions.value,
  });

  const el = inputEl.value;
  if (reconciled.rejected) {
    if (el) {
      if (el.value !== reconciled.text) {
        el.value = reconciled.text;
      }
      setSelectionSafely(el, reconciled.caret);
    }
    return;
  }

  draftVersion += 1;
  displayText.value = reconciled.text;
  if (el) {
    if (el.value !== reconciled.text) {
      el.value = reconciled.text;
    }
    setSelectionSafely(el, reconciled.caret);
  }

  if (reconciled.parsed.kind === "empty") {
    if (props.allowEmpty !== false) {
      lastEcho = { version: draftVersion, value: null };
      emit("input", { originalEvent: event, value: null, formattedValue: "" });
      emit("update:modelValue", null);
    }
    return;
  }
  if (reconciled.parsed.kind === "number") {
    const val = roundNumberToPrecision(reconciled.parsed.value, effectiveMaxFrac.value);
    lastEcho = { version: draftVersion, value: val };
    emit("input", { originalEvent: event, value: val, formattedValue: reconciled.text });
    emit("update:modelValue", val);
  }
}

function captureCurrentSelection(el: HTMLInputElement | null) {
  if (!el) {
    capturedSelection = null;
    return;
  }
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  capturedSelection = { start, end };
}

function onCompositionStart(event: CompositionEvent) {
  isComposing.value = true;
  skipRedundantPostCompositionInput = false;
  const target = (event.target as HTMLInputElement | null) ?? inputEl.value;
  compositionStartText = displayText.value;
  captureCurrentSelection(target);
}

function onCompositionEnd(event: CompositionEvent) {
  if (!isComposing.value) return;
  isComposing.value = false;
  const startSnapshot = compositionStartText;
  const selSnapshot = capturedSelection;
  compositionStartText = null;
  capturedSelection = null;
  if (props.disabled || props.readonly) return;
  const target = (event.target as HTMLInputElement | null) ?? inputEl.value;
  if (!target) return;
  if (startSnapshot !== null && target.value === startSnapshot) {
    displayText.value = startSnapshot;
    skipRedundantPostCompositionInput = true;
    return;
  }
  displayText.value = startSnapshot ?? displayText.value;
  const rawCaret = target.selectionEnd ?? target.selectionStart ?? target.value.length;
  applyRawEdit(target.value, rawCaret, "insertCompositionText", event, selSnapshot);
  skipRedundantPostCompositionInput = true;
}

function onBeforeInput(event: Event) {
  if (props.disabled || props.readonly) {
    event.preventDefault();
    return;
  }
  const ie = event as InputEvent;
  if (isComposing.value || ie.isComposing) return;
  skipRedundantPostCompositionInput = false;
  const target = (event.target as HTMLInputElement | null) ?? inputEl.value;
  captureCurrentSelection(target);
  if (
    ie.inputType === "insertText" &&
    ie.data &&
    !isAllowedNumberInputText(ie.data, formatOptions.value)
  ) {
    capturedSelection = null;
    event.preventDefault();
  }
}

function onInput(event: Event) {
  if (props.disabled || props.readonly) return;
  const ie = event as InputEvent;
  if (isComposing.value || ie.isComposing) {
    return;
  }
  const target = event.target as HTMLInputElement;
  if (skipRedundantPostCompositionInput) {
    skipRedundantPostCompositionInput = false;
    if (target.value === displayText.value) {
      return;
    }
  }
  const prevSel = capturedSelection;
  capturedSelection = null;
  const rawCaret = target.selectionEnd ?? target.selectionStart ?? target.value.length;
  applyRawEdit(target.value, rawCaret, ie.inputType, event, prevSel);
}

function onKeypress(event: KeyboardEvent) {
  if (props.disabled || props.readonly) {
    event.preventDefault();
    return;
  }
  if (isComposing.value || event.isComposing) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const ch =
    event.key && event.key.length === 1
      ? event.key
      : event.charCode
        ? String.fromCharCode(event.charCode)
        : "";
  if (!ch) return;

  if (!isAllowedNumberInputText(ch, formatOptions.value)) {
    event.preventDefault();
    return;
  }

  // 真实浏览器走原生输入链以保留选区与撤销栈；合成 DOM 测试（!isTrusted）不会派发 input，在此承接。
  if (event.isTrusted) return;

  event.preventDefault();
  const el = inputEl.value;
  const current = el ? el.value : displayText.value;
  const start = el?.selectionStart ?? current.length;
  const end = el?.selectionEnd ?? current.length;
  const nextRaw = `${current.slice(0, start)}${ch}${current.slice(end)}`;
  applyRawEdit(nextRaw, start + ch.length, "insertText", event, { start, end });
}

function stepBy(direction: 1 | -1, event: Event) {
  if (props.disabled || props.readonly) return;
  const stepAmount = props.step && props.step > 0 ? props.step : 1;
  const currentParsed = parseNumberRaw(displayText.value, formatOptions.value);
  const currentVal =
    currentParsed.kind === "number"
      ? currentParsed.value
      : props.modelValue !== null && props.modelValue !== undefined && Number.isFinite(props.modelValue)
        ? props.modelValue
        : 0;

  const precision = Math.max(
    countNumberDecimals(currentVal),
    countNumberDecimals(stepAmount),
    effectiveMaxFrac.value ?? 0,
  );
  const rawNext = Number((currentVal + direction * stepAmount).toFixed(Math.min(20, precision)));
  const clamped = clampValue(rawNext);
  const formatted = formatValue(clamped);
  draftVersion += 1;
  lastEcho = { version: draftVersion, value: clamped };
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
  if (isComposing.value || event.isComposing || event.keyCode === 229) return;
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
  const parsed = parseNumberRaw(raw, formatOptions.value);
  if (parsed.kind === "empty" || parsed.kind === "incomplete") {
    if (props.allowEmpty !== false) {
      draftVersion += 1;
      lastEcho = { version: draftVersion, value: null };
      displayText.value = "";
      if (inputEl.value) {
        inputEl.value.value = "";
      }
      emit("update:modelValue", null);
    } else {
      const fallback = clampValue(props.min ?? 0);
      const formatted = formatValue(fallback);
      draftVersion += 1;
      lastEcho = { version: draftVersion, value: fallback };
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
    draftVersion += 1;
    lastEcho = { version: draftVersion, value: clamped };
    displayText.value = formatted;
    if (inputEl.value) {
      inputEl.value.value = formatted;
    }
    if (!isSameNumericModel(clamped, props.modelValue)) {
      emit("update:modelValue", clamped);
    }
    return;
  }
  const restored = formatValue(props.modelValue);
  draftVersion += 1;
  lastEcho = { version: draftVersion, value: props.modelValue };
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
  isComposing.value = false;
  capturedSelection = null;
  compositionStartText = null;
  skipRedundantPostCompositionInput = false;
  commitDisplayValue();
  emit("blur", event);
}

function onClear(event: MouseEvent) {
  if (props.disabled || props.readonly || props.allowEmpty === false) return;
  draftVersion += 1;
  lastEcho = { version: draftVersion, value: null };
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
      :inputmode="effectiveMaxFrac === 0 ? 'numeric' : 'decimal'"
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
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      @beforeinput="onBeforeInput"
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
