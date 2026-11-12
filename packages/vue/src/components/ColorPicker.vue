<script setup lang="ts">
import { computed, useAttrs, type CSSProperties } from "vue";
import type {
  ColorPickerChangeEvent,
  ColorPickerEmits,
  ColorPickerFormat,
  ColorPickerProps,
} from "./color-picker.js";

export type {
  ColorPickerChangeEvent,
  ColorPickerEmits,
  ColorPickerFormat,
  ColorPickerProps,
};

defineOptions({
  name: "MwColorPicker",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ColorPickerProps>(), {
  modelValue: "ff0000",
  defaultColor: "ff0000",
  inline: false,
  disabled: false,
  readonly: false,
  invalid: false,
  format: "hex",
  inputId: undefined,
  id: undefined,
  name: undefined,
  tabindex: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
});

const emit = defineEmits<ColorPickerEmits>();

const attrs = useAttrs();
let emittedInCurrentTurn = false;

const HASH = String.fromCharCode(35);

function extractCleanHex6(raw: string | undefined, fallback: string): string {
  const source = (raw || fallback || "ff0000").trim();
  const stripped = source.startsWith(HASH) ? source.slice(1) : source;
  if (/^[0-9a-fA-F]{6}$/.test(stripped)) {
    return stripped.toLowerCase();
  }
  if (/^[0-9a-fA-F]{3}$/.test(stripped)) {
    return stripped
      .split("")
      .map((c) => c + c)
      .join("")
      .toLowerCase();
  }
  return "ff0000";
}

function hexToRgb(hex6: string): { r: number; g: number; b: number } {
  const num = parseInt(hex6, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsb(r: number, g: number, b: number): { h: number; s: number; b: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (max !== min) {
    if (max === rn) {
      h = (gn - bn) / delta + (gn < bn ? 6 : 0);
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(v * 100),
  };
}

function formatOutput(hex6: string): string {
  if (props.format === "rgb") {
    const { r, g, b } = hexToRgb(hex6);
    return ["rgb", "(", r, ", ", g, ", ", b, ")"].join("");
  }
  if (props.format === "hsb") {
    const { r, g, b } = hexToRgb(hex6);
    const hsb = rgbToHsb(r, g, b);
    return ["hsb", "(", hsb.h, ", ", hsb.s, "%, ", hsb.b, "%)"].join("");
  }
  const hadLeadingHash =
    typeof props.modelValue === "string" && props.modelValue.trim().startsWith(HASH);
  return hadLeadingHash ? `${HASH}${hex6}` : hex6;
}

const nativeColorValue = computed<string>(() => {
  const hex6 = extractCleanHex6(props.modelValue, props.defaultColor);
  return `${HASH}${hex6}`;
});

const rootClass = computed(() => [
  "mw-color-picker",
  {
    "mw-color-picker--inline": props.inline,
    "mw-color-picker--disabled": props.disabled,
    "mw-color-picker--readonly": props.readonly,
    "mw-color-picker--invalid": props.invalid,
  },
  attrs.class,
]);

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function handleColorEvent(event: Event) {
  if (props.disabled || props.readonly) return;
  if (emittedInCurrentTurn) return;
  emittedInCurrentTurn = true;
  queueMicrotask(() => {
    emittedInCurrentTurn = false;
  });

  const target = event.target as HTMLInputElement;
  const hex6 = extractCleanHex6(target.value, props.defaultColor);
  const formatted = formatOutput(hex6);
  emit("update:modelValue", formatted);
  emit("change", { originalEvent: event, value: formatted });
}
</script>

<template>
  <span
    :class="rootClass"
    :style="($attrs.style as CSSProperties)"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-inline="inline ? '' : undefined"
  >
    <input
      v-bind="controlAttrs"
      type="color"
      class="mw-color-picker__input mw-control"
      :id="inputId ?? id"
      :name="name"
      :value="nativeColorValue"
      :disabled="disabled || readonly"
      :tabindex="tabindex"
      :aria-label="ariaLabel ?? (attrs['aria-label'] as string | undefined)"
      :aria-labelledby="ariaLabelledby ?? (attrs['aria-labelledby'] as string | undefined)"
      :aria-describedby="ariaDescribedby ?? (attrs['aria-describedby'] as string | undefined)"
      :aria-invalid="invalid || undefined"
      :aria-readonly="readonly || undefined"
      :data-invalid="invalid ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
      :data-readonly="readonly ? '' : undefined"
      @input="handleColorEvent"
      @change="handleColorEvent"
    />
  </span>
</template>
