<script setup lang="ts">
import { computed, useAttrs, type CSSProperties } from "vue";
import type {
  SliderEmits,
  SliderOrientation,
  SliderProps,
  SliderSlideEndEvent,
  SliderValue,
} from "./slider.js";

export type {
  SliderEmits,
  SliderOrientation,
  SliderProps,
  SliderSlideEndEvent,
  SliderValue,
};

defineOptions({
  name: "MwSlider",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  range: false,
  orientation: "horizontal",
  disabled: false,
  readonly: false,
  invalid: false,
  inputId: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
});

const emit = defineEmits<SliderEmits>();

const attrs = useAttrs();
let emittedInCurrentTurn = false;

function countDecimals(num: number): number {
  if (!Number.isFinite(num)) return 0;
  const str = String(num);
  const dotIdx = str.indexOf(".");
  return dotIdx === -1 ? 0 : str.length - dotIdx - 1;
}

function clamp(val: number): number {
  const minVal = props.min ?? 0;
  const maxVal = props.max ?? 100;
  if (!Number.isFinite(val)) return minVal;
  return Math.min(maxVal, Math.max(minVal, val));
}

const singleValue = computed<number>(() => {
  if (Array.isArray(props.modelValue)) {
    return clamp(props.modelValue[0] ?? props.min);
  }
  return clamp(typeof props.modelValue === "number" ? props.modelValue : props.min);
});

const rangeValues = computed<[number, number]>(() => {
  if (Array.isArray(props.modelValue)) {
    const start = clamp(props.modelValue[0] ?? props.min);
    const end = clamp(props.modelValue[1] ?? props.max);
    return start <= end ? [start, end] : [end, start];
  }
  const val = clamp(typeof props.modelValue === "number" ? props.modelValue : props.min);
  return [props.min, val];
});

function toPercent(val: number): number {
  const span = (props.max ?? 100) - (props.min ?? 0);
  if (span <= 0) return 0;
  return Math.min(100, Math.max(0, ((clamp(val) - (props.min ?? 0)) / span) * 100));
}

const startPercent = computed<number>(() =>
  props.range ? toPercent(rangeValues.value[0]) : 0,
);

const endPercent = computed<number>(() =>
  props.range ? toPercent(rangeValues.value[1]) : toPercent(singleValue.value),
);

const rangeStyle = computed<CSSProperties>(() => {
  if (props.orientation === "vertical") {
    return {
      bottom: `${startPercent.value}%`,
      height: `${Math.max(0, endPercent.value - startPercent.value)}%`,
    };
  }
  return {
    left: `${startPercent.value}%`,
    width: `${Math.max(0, endPercent.value - startPercent.value)}%`,
  };
});

function handleStyle(percent: number): CSSProperties {
  if (props.orientation === "vertical") {
    return { bottom: `${percent}%` };
  }
  return { left: `${percent}%` };
}

const rootClass = computed(() => [
  "mw-slider",
  "p-slider",
  `mw-slider--${props.orientation}`,
  `p-slider-${props.orientation}`,
  {
    "mw-slider--range": props.range,
    "mw-slider--disabled": props.disabled,
    "p-disabled": props.disabled,
    "mw-slider--readonly": props.readonly,
    "mw-slider--invalid": props.invalid,
  },
  attrs.class,
]);

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function computeNextValue(rawNumber: number, handleIndex: 0 | 1): SliderValue {
  const clamped = clamp(rawNumber);
  if (!props.range) {
    return clamped;
  }
  const [curStart, curEnd] = rangeValues.value;
  if (handleIndex === 0) {
    return [Math.min(clamped, curEnd), curEnd];
  }
  return [curStart, Math.max(clamped, curStart)];
}

function commitValue(nextValue: SliderValue, emitSlideEndEvent?: Event) {
  if (!emittedInCurrentTurn) {
    emittedInCurrentTurn = true;
    queueMicrotask(() => {
      emittedInCurrentTurn = false;
    });
    emit("update:modelValue", nextValue);
    emit("change", nextValue);
  }
  if (emitSlideEndEvent) {
    emit("slideend", { originalEvent: emitSlideEndEvent, value: nextValue });
  }
}

function onRangeInput(handleIndex: 0 | 1, event: Event) {
  if (props.disabled || props.readonly) return;
  const target = event.target as HTMLInputElement;
  const nextVal = computeNextValue(Number(target.value), handleIndex);
  commitValue(nextVal);
}

function onRangeChange(handleIndex: 0 | 1, event: Event) {
  if (props.disabled || props.readonly) return;
  const target = event.target as HTMLInputElement;
  const nextVal = computeNextValue(Number(target.value), handleIndex);
  commitValue(nextVal, event);
}

function onKeydown(handleIndex: 0 | 1, event: KeyboardEvent) {
  if (props.disabled || props.readonly) return;
  const stepAmount = props.step && props.step > 0 ? props.step : 1;
  const current = props.range ? rangeValues.value[handleIndex] : singleValue.value;
  const precision = Math.max(countDecimals(current), countDecimals(stepAmount));

  let targetVal: number | null = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    event.preventDefault();
    targetVal = Number((current + stepAmount).toFixed(Math.min(20, precision)));
  } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    event.preventDefault();
    targetVal = Number((current - stepAmount).toFixed(Math.min(20, precision)));
  } else if (event.key === "PageUp") {
    event.preventDefault();
    targetVal = Number((current + stepAmount * 10).toFixed(Math.min(20, precision)));
  } else if (event.key === "PageDown") {
    event.preventDefault();
    targetVal = Number((current - stepAmount * 10).toFixed(Math.min(20, precision)));
  } else if (event.key === "Home") {
    event.preventDefault();
    targetVal = props.min ?? 0;
  } else if (event.key === "End") {
    event.preventDefault();
    targetVal = props.max ?? 100;
  }

  if (targetVal !== null) {
    const nextVal = computeNextValue(targetVal, handleIndex);
    commitValue(nextVal, event);
  }
}
</script>

<template>
  <div
    :class="rootClass"
    :style="($attrs.style as CSSProperties)"
    :data-orientation="orientation"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
  >
    <div class="mw-slider__track">
      <div class="mw-slider__range p-slider-range" :style="rangeStyle" />
    </div>

    <template v-if="range">
      <input
        v-bind="controlAttrs"
        type="range"
        class="mw-slider__input mw-slider__input--start"
        :id="inputId ?? id"
        :min="min"
        :max="max"
        :step="step"
        :value="rangeValues[0]"
        :disabled="disabled"
        :aria-orientation="orientation"
        :aria-valuemin="min"
        :aria-valuemax="rangeValues[1]"
        :aria-valuenow="rangeValues[0]"
        :aria-label="ariaLabel ?? (attrs['aria-label'] as string | undefined)"
        :aria-labelledby="ariaLabelledby ?? (attrs['aria-labelledby'] as string | undefined)"
        :aria-describedby="ariaDescribedby ?? (attrs['aria-describedby'] as string | undefined)"
        :aria-invalid="invalid || undefined"
        :data-disabled="disabled ? '' : undefined"
        :data-invalid="invalid ? '' : undefined"
        @input="onRangeInput(0, $event)"
        @change="onRangeChange(0, $event)"
        @keydown="onKeydown(0, $event)"
      />
      <input
        type="range"
        class="mw-slider__input mw-slider__input--end"
        :min="min"
        :max="max"
        :step="step"
        :value="rangeValues[1]"
        :disabled="disabled"
        :aria-orientation="orientation"
        :aria-valuemin="rangeValues[0]"
        :aria-valuemax="max"
        :aria-valuenow="rangeValues[1]"
        :aria-label="ariaLabel ?? (attrs['aria-label'] as string | undefined)"
        :aria-labelledby="ariaLabelledby ?? (attrs['aria-labelledby'] as string | undefined)"
        :aria-describedby="ariaDescribedby ?? (attrs['aria-describedby'] as string | undefined)"
        :aria-invalid="invalid || undefined"
        :data-disabled="disabled ? '' : undefined"
        :data-invalid="invalid ? '' : undefined"
        @input="onRangeInput(1, $event)"
        @change="onRangeChange(1, $event)"
        @keydown="onKeydown(1, $event)"
      />
      <span
        class="mw-slider__handle p-slider-handle"
        :style="handleStyle(startPercent)"
        aria-hidden="true"
      />
      <span
        class="mw-slider__handle p-slider-handle"
        :style="handleStyle(endPercent)"
        aria-hidden="true"
      />
    </template>

    <template v-else>
      <input
        v-bind="controlAttrs"
        type="range"
        class="mw-slider__input"
        :id="inputId ?? id"
        :min="min"
        :max="max"
        :step="step"
        :value="singleValue"
        :disabled="disabled"
        :aria-orientation="orientation"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="singleValue"
        :aria-label="ariaLabel ?? (attrs['aria-label'] as string | undefined)"
        :aria-labelledby="ariaLabelledby ?? (attrs['aria-labelledby'] as string | undefined)"
        :aria-describedby="ariaDescribedby ?? (attrs['aria-describedby'] as string | undefined)"
        :aria-invalid="invalid || undefined"
        :data-disabled="disabled ? '' : undefined"
        :data-readonly="readonly ? '' : undefined"
        :data-invalid="invalid ? '' : undefined"
        @input="onRangeInput(0, $event)"
        @change="onRangeChange(0, $event)"
        @keydown="onKeydown(0, $event)"
      />
      <span
        class="mw-slider__handle p-slider-handle"
        :style="handleStyle(endPercent)"
        aria-hidden="true"
      />
    </template>
  </div>
</template>

<style scoped>
.mw-slider {
  --_sl-hit: var(--icon-lg);
  --_sl-track: var(--space-1-5);
  --_sl-thumb: var(--icon-sm);
  --_sl-v-len: calc(var(--size-lg-h) * 3.5);
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  min-width: calc(var(--size-lg-h) * 2.5);
  height: var(--_sl-hit);
  cursor: pointer;
  user-select: none;
  touch-action: none;
  vertical-align: middle;
}

.mw-slider--vertical {
  flex-direction: column;
  width: var(--_sl-hit);
  min-width: var(--_sl-hit);
  height: var(--_sl-v-len);
}

.mw-slider--disabled,
.mw-slider[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-slider__track {
  position: relative;
  width: 100%;
  height: var(--_sl-track);
  border-radius: var(--radius-full);
  background-color: var(--fill-strong);
  overflow: hidden;
  pointer-events: none;
}

.mw-slider--vertical .mw-slider__track {
  width: var(--_sl-track);
  height: 100%;
}

.mw-slider__range {
  position: absolute;
  top: 0;
  bottom: 0;
  background-color: var(--accent);
  border-radius: var(--radius-full);
}

.mw-slider--vertical .mw-slider__range {
  left: 0;
  right: 0;
  top: auto;
}

.mw-slider__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 2;
}

.mw-slider--range .mw-slider__input {
  pointer-events: auto;
}

.mw-slider__handle {
  position: absolute;
  top: 50%;
  width: var(--_sl-thumb);
  height: var(--_sl-thumb);
  border-radius: var(--radius-full);
  background-color: var(--bg-raised); /* opaque-ok: physical slider thumb */
  border: calc(var(--border-width) * 2) solid var(--accent);
  box-shadow: var(--shadow-raised);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
  transition:
    transform var(--duration-fast) var(--ease-spring-snap),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.mw-slider--vertical .mw-slider__handle {
  top: auto;
  left: 50%;
  transform: translate(-50%, 50%);
}

.mw-slider__input:focus-visible ~ .mw-slider__handle {
  box-shadow: var(--focus-shadow);
}

@media (prefers-reduced-motion: reduce) {
  .mw-slider__handle {
    transition: none;
  }
}
</style>
