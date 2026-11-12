import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from "react";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";
import type { SliderProps, SliderValue } from "./slider-defs";

export type {
  SliderOrientation,
  SliderProps,
  SliderSlideEndEvent,
  SliderValue,
} from "./slider-defs";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

function countDecimals(num: number): number {
  if (!Number.isFinite(num)) return 0;
  const str = String(num);
  const dotIdx = str.indexOf(".");
  return dotIdx === -1 ? 0 : str.length - dotIdx - 1;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function MwSlider(
  props,
  forwardedRef,
) {
  const {
    value,
    defaultValue,
    modelValue,
    onValueChange,
    onChange,
    onSlideEnd,
    onSlideend,
    min = 0,
    max = 100,
    step,
    range = false,
    orientation = "horizontal",
    disabled,
    readOnly,
    readonly,
    invalid,
    inputId,
    id,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    showTicks = false,
    className,
    style,
    "aria-label": nativeAriaLabel,
    "aria-labelledby": nativeAriaLabelledby,
    "aria-describedby": nativeAriaDescribedby,
    onPointerDown: userOnPointerDown,
    onPointerMove: userOnPointerMove,
    onPointerUp: userOnPointerUp,
    onPointerCancel: userOnPointerCancel,
    ...restAttrs
  } = props;

  const fieldContext = useFormFieldContext();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const activeHandleRef = useRef<0 | 1>(0);
  const lastPointerValueRef = useRef<SliderValue | null>(null);

  const controlledProp = value !== undefined ? value : modelValue;
  const isControlled = controlledProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<SliderValue>(() =>
    defaultValue !== undefined ? defaultValue : range ? [min, max] : min,
  );
  const currentValue = isControlled ? controlledProp : uncontrolledValue;

  const resolvedId = inputId ?? id ?? fieldContext.inputId;
  const resolvedDisabled = Boolean(disabled ?? fieldContext.disabled);
  const resolvedReadOnly = Boolean(readOnly ?? readonly);
  const resolvedInvalid = Boolean(invalid ?? fieldContext.invalid);
  const resolvedDescribedBy = mergeDescribedBy(
    ariaDescribedby ?? nativeAriaDescribedby,
    fieldContext.describedBy,
  );

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  function clamp(val: number): number {
    if (!Number.isFinite(val)) return min;
    return Math.min(max, Math.max(min, val));
  }

  const validStep = step && step > 0 && Number.isFinite(step) ? step : null;
  const nativeStep: number | "any" = validStep ?? "any";

  function snapToStep(raw: number): number {
    if (!validStep) return raw;
    const steps = Math.round((raw - min) / validStep);
    const precision = Math.max(countDecimals(min), countDecimals(validStep));
    const snapped = Number((min + steps * validStep).toFixed(Math.min(20, precision)));
    return clamp(snapped);
  }

  function toPercent(val: number): number {
    const span = max - min;
    if (span <= 0) return 0;
    return Math.min(100, Math.max(0, ((clamp(val) - min) / span) * 100));
  }

  const singleValue = Array.isArray(currentValue)
    ? clamp(currentValue[0] ?? min)
    : clamp(typeof currentValue === "number" ? currentValue : min);

  const rangeValues: [number, number] = (() => {
    if (Array.isArray(currentValue)) {
      const start = clamp(currentValue[0] ?? min);
      const end = clamp(currentValue[1] ?? max);
      return start <= end ? [start, end] : [end, start];
    }
    const val = clamp(typeof currentValue === "number" ? currentValue : min);
    return [min, val];
  })();

  const startPercent = range ? toPercent(rangeValues[0]) : 0;
  const endPercent = range ? toPercent(rangeValues[1]) : toPercent(singleValue);

  const tickPositions: number[] = (() => {
    if (!showTicks || !validStep) return [];
    const span = max - min;
    if (span <= 0) return [toPercent(min)];
    const positions: number[] = [];
    for (let i = 0; i <= Math.floor(span / validStep); i += 1) {
      positions.push(toPercent(min + i * validStep));
    }
    const maxPercent = toPercent(max);
    const lastTick = positions[positions.length - 1] ?? 0;
    if (Math.abs(lastTick - maxPercent) > 1e-6) {
      positions.push(maxPercent);
    }
    return positions;
  })();

  function posStyle(percent: number): CSSProperties {
    return orientation === "vertical" ? { bottom: `${percent}%` } : { left: `${percent}%` };
  }

  const rangeStyle: CSSProperties =
    orientation === "vertical"
      ? {
          bottom: `${startPercent}%`,
          height: `${Math.max(0, endPercent - startPercent)}%`,
        }
      : {
          left: `${startPercent}%`,
          width: `${Math.max(0, endPercent - startPercent)}%`,
        };

  function computeNextValue(rawNumber: number, handleIndex: 0 | 1): SliderValue {
    const clamped = clamp(rawNumber);
    if (!range) {
      return clamped;
    }
    const [curStart, curEnd] = rangeValues;
    if (handleIndex === 0) {
      return [Math.min(clamped, curEnd), curEnd];
    }
    return [curStart, Math.max(clamped, curStart)];
  }

  function emitSlideEnd(originalEvent: Event, val: SliderValue) {
    const payload = { originalEvent, value: val };
    onSlideEnd?.(payload);
    onSlideend?.(payload);
  }

  function commitValue(nextValue: SliderValue, slideEndEvent?: Event) {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }
    onValueChange?.(nextValue);
    onChange?.(nextValue);
    if (slideEndEvent) {
      emitSlideEnd(slideEndEvent, nextValue);
    }
  }

  function handleRangeChange(handleIndex: 0 | 1, event: ChangeEvent<HTMLInputElement>) {
    if (resolvedDisabled || resolvedReadOnly) return;
    const nextVal = computeNextValue(Number(event.currentTarget.value), handleIndex);
    const isCommitEvent = event.nativeEvent.type === "change";
    commitValue(nextVal, isCommitEvent ? event.nativeEvent : undefined);
  }

  function valueFromPointer(event: PointerEvent<HTMLDivElement>): number {
    const el = rootRef.current;
    if (!el) return min;
    const rect = el.getBoundingClientRect();
    const span = orientation === "vertical" ? rect.bottom - rect.top : rect.right - rect.left;
    if (span <= 0) return min;
    const distance =
      orientation === "vertical" ? rect.bottom - event.clientY : event.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, distance / span));
    return min + ratio * (max - min);
  }

  function nearestHandleIndex(raw: number): 0 | 1 {
    if (!range) return 0;
    const [start, end] = rangeValues;
    return Math.abs(raw - start) <= Math.abs(raw - end) ? 0 : 1;
  }

  function applyPointer(raw: number) {
    const snapped = snapToStep(raw);
    const nextVal = computeNextValue(snapped, range ? activeHandleRef.current : 0);
    lastPointerValueRef.current = nextVal;
    commitValue(nextVal);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    userOnPointerDown?.(event);
    if (resolvedDisabled || resolvedReadOnly) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const el = rootRef.current;
    if (!el || activePointerIdRef.current !== null) return;
    const raw = valueFromPointer(event);
    activeHandleRef.current = nearestHandleIndex(raw);
    activePointerIdRef.current = event.pointerId;
    try {
      el.setPointerCapture(event.pointerId);
    } catch {
      // 测试 DOM 未实现 Pointer Capture 时降级为元素内监听
    }
    const inputs = el.querySelectorAll<HTMLInputElement>('input[type="range"]');
    inputs[range ? activeHandleRef.current : 0]?.focus();
    event.preventDefault();
    applyPointer(raw);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    userOnPointerMove?.(event);
    if (activePointerIdRef.current === null) return;
    applyPointer(valueFromPointer(event));
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    const el = rootRef.current;
    if (activePointerIdRef.current === null || event.pointerId !== activePointerIdRef.current) {
      return;
    }
    activePointerIdRef.current = null;
    if (el?.hasPointerCapture?.(event.pointerId)) {
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        // 测试 DOM 降级
      }
    }
    if (lastPointerValueRef.current !== null) {
      emitSlideEnd(event.nativeEvent, lastPointerValueRef.current);
    }
    lastPointerValueRef.current = null;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    userOnPointerUp?.(event);
    finishPointer(event);
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    userOnPointerCancel?.(event);
    finishPointer(event);
  }

  function handleKeyDown(handleIndex: 0 | 1, event: KeyboardEvent<HTMLInputElement>) {
    if (resolvedDisabled || resolvedReadOnly) return;
    const stepAmount = validStep ?? 1;
    const current = range ? rangeValues[handleIndex] : singleValue;
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
      targetVal = min;
    } else if (event.key === "End") {
      event.preventDefault();
      targetVal = max;
    }

    if (targetVal !== null) {
      const nextVal = computeNextValue(targetVal, handleIndex);
      commitValue(nextVal, event.nativeEvent);
    }
  }

  const rootClass = [
    "mw-slider",
    `mw-slider--${orientation}`,
    range ? "mw-slider--range" : undefined,
    resolvedDisabled ? "mw-slider--disabled" : undefined,
    resolvedReadOnly ? "mw-slider--readonly" : undefined,
    resolvedInvalid ? "mw-slider--invalid" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const resolvedAriaLabel = ariaLabel ?? nativeAriaLabel;
  const resolvedAriaLabelledby = ariaLabelledby ?? nativeAriaLabelledby;

  return (
    <div
      {...restAttrs}
      ref={setRefs}
      className={rootClass}
      style={style}
      data-orientation={orientation}
      data-disabled={resolvedDisabled ? "" : undefined}
      data-readonly={resolvedReadOnly ? "" : undefined}
      data-invalid={resolvedInvalid ? "" : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="mw-slider__track">
        <div className="mw-slider__range" style={rangeStyle} />
      </div>

      {tickPositions.length > 0 ? (
        <div className="mw-slider__ticks" aria-hidden="true">
          {tickPositions.map((percent, index) => (
            <span key={index} className="mw-slider__tick" style={posStyle(percent)} />
          ))}
        </div>
      ) : null}

      {range ? (
        <>
          <input
            type="range"
            className="mw-slider__input mw-slider__input--start"
            id={resolvedId}
            min={min}
            max={max}
            step={nativeStep}
            value={rangeValues[0]}
            disabled={resolvedDisabled}
            aria-orientation={orientation}
            aria-valuemin={min}
            aria-valuemax={rangeValues[1]}
            aria-valuenow={rangeValues[0]}
            aria-label={resolvedAriaLabel}
            aria-labelledby={resolvedAriaLabelledby}
            aria-describedby={resolvedDescribedBy}
            aria-invalid={resolvedInvalid || undefined}
            data-disabled={resolvedDisabled ? "" : undefined}
            data-invalid={resolvedInvalid ? "" : undefined}
            onChange={(e) => handleRangeChange(0, e)}
            onKeyDown={(e) => handleKeyDown(0, e)}
          />
          <input
            type="range"
            className="mw-slider__input mw-slider__input--end"
            min={min}
            max={max}
            step={nativeStep}
            value={rangeValues[1]}
            disabled={resolvedDisabled}
            aria-orientation={orientation}
            aria-valuemin={rangeValues[0]}
            aria-valuemax={max}
            aria-valuenow={rangeValues[1]}
            aria-label={resolvedAriaLabel}
            aria-labelledby={resolvedAriaLabelledby}
            aria-describedby={resolvedDescribedBy}
            aria-invalid={resolvedInvalid || undefined}
            data-disabled={resolvedDisabled ? "" : undefined}
            data-invalid={resolvedInvalid ? "" : undefined}
            onChange={(e) => handleRangeChange(1, e)}
            onKeyDown={(e) => handleKeyDown(1, e)}
          />
          <span className="mw-slider__handle" style={posStyle(startPercent)} aria-hidden="true" />
          <span className="mw-slider__handle" style={posStyle(endPercent)} aria-hidden="true" />
        </>
      ) : (
        <>
          <input
            type="range"
            className="mw-slider__input"
            id={resolvedId}
            min={min}
            max={max}
            step={nativeStep}
            value={singleValue}
            disabled={resolvedDisabled}
            aria-orientation={orientation}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={singleValue}
            aria-label={resolvedAriaLabel}
            aria-labelledby={resolvedAriaLabelledby}
            aria-describedby={resolvedDescribedBy}
            aria-invalid={resolvedInvalid || undefined}
            data-disabled={resolvedDisabled ? "" : undefined}
            data-readonly={resolvedReadOnly ? "" : undefined}
            data-invalid={resolvedInvalid ? "" : undefined}
            onChange={(e) => handleRangeChange(0, e)}
            onKeyDown={(e) => handleKeyDown(0, e)}
          />
          <span className="mw-slider__handle" style={posStyle(endPercent)} aria-hidden="true" />
        </>
      )}
    </div>
  );
});

Slider.displayName = "MwSlider";

export default Slider;
