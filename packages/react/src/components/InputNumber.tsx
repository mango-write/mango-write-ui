import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type Ref,
} from "react";
import { ChevronDown, ChevronUp, Minus, Plus, X } from "lucide-react";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";
import type { InputNumberProps } from "./input-number";

export type {
  InputNumberButtonLayout,
  InputNumberInputEvent,
  InputNumberMode,
  InputNumberProps,
  InputNumberSize,
} from "./input-number";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  const expIdx = str.indexOf("e-");
  if (expIdx !== -1) {
    return parseInt(str.slice(expIdx + 2), 10) || 0;
  }
  const dotIdx = str.indexOf(".");
  return dotIdx === -1 ? 0 : str.length - dotIdx - 1;
}

type ParseResult =
  | { kind: "empty"; value: null }
  | { kind: "incomplete"; value: null }
  | { kind: "invalid"; value: null }
  | { kind: "number"; value: number };

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function MwInputNumber(
  props,
  forwardedRef,
) {
  const {
    value,
    defaultValue,
    onValueChange,
    onInput,
    min,
    max,
    step = 1,
    minFractionDigits,
    maxFractionDigits,
    useGrouping = true,
    prefix,
    suffix,
    mode = "decimal",
    currency,
    locale,
    showButtons = false,
    buttonLayout = "stacked",
    showClear = false,
    allowEmpty = true,
    placeholder,
    disabled,
    readOnly,
    readonly,
    invalid,
    required,
    fluid = false,
    size,
    inputId,
    id,
    name,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    inputClassName,
    inputClass,
    inputStyle,
    className,
    style,
    "aria-label": nativeAriaLabel,
    "aria-labelledby": nativeAriaLabelledby,
    "aria-describedby": nativeAriaDescribedby,
    onFocus,
    onBlur,
    onKeyDown,
    onChange,
    ...restAttrs
  } = props;

  const fieldContext = useFormFieldContext();
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(defaultValue ?? null);
  const currentValue = isControlled ? (value ?? null) : uncontrolledValue;

  const resolvedDisabled = Boolean(disabled ?? fieldContext.disabled);
  const resolvedReadOnly = Boolean(readOnly ?? readonly);
  const resolvedInvalid = Boolean(invalid ?? fieldContext.invalid);
  const resolvedRequired = Boolean(required ?? fieldContext.required);
  const resolvedInputId = inputId ?? id ?? fieldContext.inputId;
  const rootId = inputId && id && id !== inputId ? id : undefined;
  const resolvedDescribedBy = mergeDescribedBy(
    ariaDescribedby ?? nativeAriaDescribedby,
    fieldContext.describedBy,
  );

  const resolvedSize =
    size === "small" || size === "sm"
      ? "sm"
      : size === "large" || size === "lg"
        ? "lg"
        : size === "xs" || size === "md"
          ? size
          : undefined;

  const roundToPrecision = useCallback(
    (val: number): number => {
      if (maxFractionDigits !== undefined && maxFractionDigits >= 0) {
        const factor = 10 ** maxFractionDigits;
        return Math.round((val + Number.EPSILON) * factor) / factor;
      }
      return val;
    },
    [maxFractionDigits],
  );

  const clampValue = useCallback(
    (val: number): number => {
      let next = roundToPrecision(val);
      if (min !== undefined && next < min) {
        next = min;
      }
      if (max !== undefined && next > max) {
        next = max;
      }
      return next;
    },
    [min, max, roundToPrecision],
  );

  const formatValue = useCallback(
    (val: number | null | undefined): string => {
      if (val === null || val === undefined || !Number.isFinite(val)) {
        return "";
      }
      const rounded = roundToPrecision(val);
      let core: string;

      if (mode === "currency" && currency) {
        try {
          core = new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            useGrouping: useGrouping !== false,
            minimumFractionDigits: minFractionDigits,
            maximumFractionDigits: maxFractionDigits,
          }).format(rounded);
        } catch {
          core = String(rounded);
        }
      } else if (
        useGrouping === false &&
        minFractionDigits === undefined &&
        maxFractionDigits === undefined
      ) {
        core = String(rounded);
      } else if (useGrouping === false && minFractionDigits !== undefined) {
        const maxFrac =
          maxFractionDigits !== undefined
            ? Math.max(minFractionDigits, maxFractionDigits)
            : Math.max(minFractionDigits, countDecimals(rounded));
        core = rounded.toFixed(
          Math.min(20, Math.max(minFractionDigits, Math.min(maxFrac, countDecimals(rounded)))),
        );
      } else if (useGrouping === false) {
        core = String(rounded);
      } else {
        try {
          const minFrac = minFractionDigits;
          const maxFrac =
            maxFractionDigits ??
            (minFrac !== undefined ? Math.max(minFrac, 3) : Math.max(3, countDecimals(rounded)));
          core = new Intl.NumberFormat(locale, {
            style: "decimal",
            useGrouping: true,
            minimumFractionDigits: minFrac,
            maximumFractionDigits: Math.min(20, maxFrac),
          }).format(rounded);
        } catch {
          core = String(rounded);
        }
      }

      return `${prefix ?? ""}${core}${suffix ?? ""}`;
    },
    [
      currency,
      locale,
      maxFractionDigits,
      minFractionDigits,
      mode,
      prefix,
      roundToPrecision,
      suffix,
      useGrouping,
    ],
  );

  const parseRaw = useCallback(
    (raw: string): ParseResult => {
      let str = raw;
      if (prefix && str.startsWith(prefix)) {
        str = str.slice(prefix.length);
      }
      if (suffix && str.endsWith(suffix)) {
        str = str.slice(0, str.length - suffix.length);
      }
      str = str.trim();
      if (str === "") {
        return { kind: "empty", value: null };
      }

      let cleaned = str.replace(/[\s,_]/g, "");
      if (mode === "currency") {
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
    },
    [mode, prefix, suffix],
  );

  const inputElRef = useRef<HTMLInputElement | null>(null);
  const isFocusedRef = useRef(false);
  const [displayText, setDisplayTextState] = useState<string>(() => formatValue(currentValue));
  const displayTextRef = useRef<string>(displayText);

  const setDisplayText = useCallback((next: string) => {
    displayTextRef.current = next;
    setDisplayTextState(next);
  }, []);

  useEffect(() => {
    const val = currentValue;
    if (val === null || val === undefined || !Number.isFinite(val)) {
      if (!isFocusedRef.current || parseRaw(displayTextRef.current).kind === "number") {
        setDisplayText("");
      }
      return;
    }
    if (!isFocusedRef.current) {
      setDisplayText(formatValue(val));
      return;
    }
    const currentParsed = parseRaw(displayTextRef.current);
    if (currentParsed.kind !== "number" || currentParsed.value !== val) {
      setDisplayText(formatValue(val));
    }
  }, [currentValue, formatValue, parseRaw, setDisplayText]);

  const emitValue = useCallback(
    (nextVal: number | null) => {
      if (!isControlled) {
        setUncontrolledValue(nextVal);
      }
      onValueChange?.(nextVal);
    },
    [isControlled, onValueChange],
  );

  const handleRawChange = useCallback(
    (raw: string, originalEvent: Event) => {
      setDisplayText(raw);
      const parsed = parseRaw(raw);
      if (parsed.kind === "empty") {
        if (allowEmpty !== false) {
          onInput?.({ originalEvent, value: null, formattedValue: "" });
          emitValue(null);
        }
        return;
      }
      if (parsed.kind === "number") {
        const val = roundToPrecision(parsed.value);
        onInput?.({ originalEvent, value: val, formattedValue: raw });
        emitValue(val);
      }
    },
    [allowEmpty, emitValue, onInput, parseRaw, roundToPrecision, setDisplayText],
  );

  const keypressHandlerRef = useRef<(event: globalThis.KeyboardEvent) => void>(() => {});
  keypressHandlerRef.current = (event: globalThis.KeyboardEvent) => {
    if (resolvedDisabled || resolvedReadOnly) {
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

    // 合成 DOM 测试（fireEvent.keyPress）不会自动写入字符并派发 input，在此统一承接。
    event.preventDefault();
    const el = inputElRef.current;
    const current = el ? el.value : displayTextRef.current;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const nextRaw = `${current.slice(0, start)}${ch}${current.slice(end)}`;
    if (el) {
      el.value = nextRaw;
    }
    handleRawChange(nextRaw, event);
  };

  useIsomorphicLayoutEffect(() => {
    const el = inputElRef.current;
    if (!el) return;
    const listener = (event: globalThis.KeyboardEvent) => keypressHandlerRef.current(event);
    el.addEventListener("keypress", listener);
    return () => el.removeEventListener("keypress", listener);
  }, []);

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputElRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  function stepBy(direction: 1 | -1, originalEvent: Event) {
    if (resolvedDisabled || resolvedReadOnly) return;
    const stepAmount = step && step > 0 ? step : 1;
    const currentParsed = parseRaw(displayTextRef.current);
    const baseVal =
      currentParsed.kind === "number"
        ? currentParsed.value
        : currentValue !== null && currentValue !== undefined && Number.isFinite(currentValue)
          ? currentValue
          : 0;

    const precision = Math.max(
      countDecimals(baseVal),
      countDecimals(stepAmount),
      maxFractionDigits ?? 0,
    );
    const rawNext = Number((baseVal + direction * stepAmount).toFixed(Math.min(20, precision)));
    const clamped = clampValue(rawNext);
    const formatted = formatValue(clamped);
    setDisplayText(formatted);
    if (inputElRef.current) {
      inputElRef.current.value = formatted;
    }
    onInput?.({ originalEvent, value: clamped, formattedValue: formatted });
    emitValue(clamped);
  }

  function commitDisplayValue() {
    const raw = inputElRef.current ? inputElRef.current.value : displayTextRef.current;
    const parsed = parseRaw(raw);
    if (parsed.kind === "empty" || parsed.kind === "incomplete") {
      if (allowEmpty !== false) {
        setDisplayText("");
        if (inputElRef.current) {
          inputElRef.current.value = "";
        }
        emitValue(null);
      } else {
        const fallback = clampValue(min ?? 0);
        const formatted = formatValue(fallback);
        setDisplayText(formatted);
        if (inputElRef.current) {
          inputElRef.current.value = formatted;
        }
        emitValue(fallback);
      }
      return;
    }
    if (parsed.kind === "number") {
      const clamped = clampValue(parsed.value);
      const formatted = formatValue(clamped);
      setDisplayText(formatted);
      if (inputElRef.current) {
        inputElRef.current.value = formatted;
      }
      if (clamped !== currentValue) {
        emitValue(clamped);
      }
      return;
    }
    const restored = formatValue(currentValue);
    setDisplayText(restored);
    if (inputElRef.current) {
      inputElRef.current.value = restored;
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (resolvedDisabled || resolvedReadOnly) return;
    handleRawChange(event.currentTarget.value, event.nativeEvent);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (resolvedDisabled || resolvedReadOnly) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepBy(1, event.nativeEvent);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(-1, event.nativeEvent);
    } else if (event.key === "Enter") {
      commitDisplayValue();
    }
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    isFocusedRef.current = true;
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    isFocusedRef.current = false;
    commitDisplayValue();
    onBlur?.(event);
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    if (resolvedDisabled || resolvedReadOnly || allowEmpty === false) return;
    setDisplayText("");
    if (inputElRef.current) {
      inputElRef.current.value = "";
    }
    onInput?.({ originalEvent: event.nativeEvent, value: null, formattedValue: "" });
    emitValue(null);
  }

  const isAtMin =
    min !== undefined && currentValue !== null && currentValue !== undefined && currentValue <= min;
  const isAtMax =
    max !== undefined && currentValue !== null && currentValue !== undefined && currentValue >= max;
  const showClearButton = Boolean(
    showClear &&
      allowEmpty !== false &&
      currentValue !== null &&
      currentValue !== undefined &&
      !resolvedDisabled &&
      !resolvedReadOnly,
  );

  const rootClass = [
    "mw-input-number",
    resolvedSize ? `mw-input-number--${resolvedSize} mw-size-${resolvedSize}` : undefined,
    fluid ? "mw-input-number--fluid" : undefined,
    showButtons
      ? `mw-input-number--buttons mw-input-number--${buttonLayout} mw-input-number--buttons-${buttonLayout}`
      : undefined,
    resolvedDisabled ? "mw-input-number--disabled" : undefined,
    resolvedReadOnly ? "mw-input-number--readonly" : undefined,
    resolvedInvalid ? "mw-input-number--invalid" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inputClasses = [
    "mw-input-number__input",
    "mw-control",
    "mw-input",
    resolvedSize ? `mw-input-number__input--${resolvedSize}` : undefined,
    inputClassName,
    inputClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      id={rootId}
      className={rootClass}
      style={style}
      data-disabled={resolvedDisabled ? "" : undefined}
      data-readonly={resolvedReadOnly ? "" : undefined}
      data-invalid={resolvedInvalid ? "" : undefined}
      data-size={resolvedSize}
    >
      {showButtons && buttonLayout === "horizontal" ? (
        <button
          type="button"
          className="mw-input-number__button mw-input-number__button--down"
          disabled={resolvedDisabled || resolvedReadOnly || isAtMin}
          tabIndex={-1}
          aria-label="Decrement"
          onClick={(e) => stepBy(-1, e.nativeEvent)}
        >
          <Minus size={12} aria-hidden="true" />
        </button>
      ) : null}

      {showButtons && buttonLayout === "vertical" ? (
        <button
          type="button"
          className="mw-input-number__button mw-input-number__button--up"
          disabled={resolvedDisabled || resolvedReadOnly || isAtMax}
          tabIndex={-1}
          aria-label="Increment"
          onClick={(e) => stepBy(1, e.nativeEvent)}
        >
          <ChevronUp size={12} aria-hidden="true" />
        </button>
      ) : null}

      <input
        {...restAttrs}
        ref={setRefs}
        type="text"
        role="spinbutton"
        id={resolvedInputId}
        name={name}
        className={inputClasses}
        style={inputStyle}
        value={displayText}
        placeholder={placeholder}
        disabled={resolvedDisabled}
        readOnly={resolvedReadOnly}
        required={resolvedRequired}
        inputMode={maxFractionDigits === 0 ? "numeric" : "decimal"}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue ?? undefined}
        aria-label={ariaLabel ?? nativeAriaLabel}
        aria-labelledby={ariaLabelledby ?? nativeAriaLabelledby}
        aria-describedby={resolvedDescribedBy}
        aria-invalid={resolvedInvalid || undefined}
        aria-readonly={resolvedReadOnly || undefined}
        aria-required={resolvedRequired || undefined}
        data-invalid={resolvedInvalid ? "" : undefined}
        data-disabled={resolvedDisabled ? "" : undefined}
        data-readonly={resolvedReadOnly ? "" : undefined}
        data-size={resolvedSize}
        autoComplete="off"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {showClearButton ? (
        <button
          type="button"
          className="mw-input-number__clear"
          aria-label="Clear"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
        >
          <X size={12} aria-hidden="true" />
        </button>
      ) : null}

      {showButtons && buttonLayout === "stacked" ? (
        <span className="mw-input-number__button-group">
          <button
            type="button"
            className="mw-input-number__button mw-input-number__button--up"
            disabled={resolvedDisabled || resolvedReadOnly || isAtMax}
            tabIndex={-1}
            aria-label="Increment"
            onClick={(e) => stepBy(1, e.nativeEvent)}
          >
            <ChevronUp size={12} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="mw-input-number__button mw-input-number__button--down"
            disabled={resolvedDisabled || resolvedReadOnly || isAtMin}
            tabIndex={-1}
            aria-label="Decrement"
            onClick={(e) => stepBy(-1, e.nativeEvent)}
          >
            <ChevronDown size={12} aria-hidden="true" />
          </button>
        </span>
      ) : null}

      {showButtons && buttonLayout === "horizontal" ? (
        <button
          type="button"
          className="mw-input-number__button mw-input-number__button--up"
          disabled={resolvedDisabled || resolvedReadOnly || isAtMax}
          tabIndex={-1}
          aria-label="Increment"
          onClick={(e) => stepBy(1, e.nativeEvent)}
        >
          <Plus size={12} aria-hidden="true" />
        </button>
      ) : null}

      {showButtons && buttonLayout === "vertical" ? (
        <button
          type="button"
          className="mw-input-number__button mw-input-number__button--down"
          disabled={resolvedDisabled || resolvedReadOnly || isAtMin}
          tabIndex={-1}
          aria-label="Decrement"
          onClick={(e) => stepBy(-1, e.nativeEvent)}
        >
          <ChevronDown size={12} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
});

InputNumber.displayName = "MwInputNumber";

export default InputNumber;
