import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent as ReactCompositionEvent,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type Ref,
} from "react";
import { ChevronDown, ChevronUp, Minus, Plus, X } from "lucide-react";
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

function isSameNumericModel(a: number | null | undefined, b: number | null | undefined): boolean {
  if (a === null || a === undefined || b === null || b === undefined) {
    return (a ?? null) === (b ?? null);
  }
  return normalizeNegativeZero(a) === normalizeNegativeZero(b);
}

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
    onCompositionStart,
    onCompositionEnd,
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

  const formatOptions = useMemo<NumberFormatOptions>(
    () => ({
      useGrouping,
      minFractionDigits,
      maxFractionDigits,
      prefix,
      suffix,
      mode,
      currency,
      locale,
    }),
    [currency, locale, maxFractionDigits, minFractionDigits, mode, prefix, suffix, useGrouping],
  );

  const effectiveMaxFrac = useMemo(
    () => resolveEffectiveMaxFractionDigits(formatOptions),
    [formatOptions],
  );

  const formatSignature = useMemo(
    () =>
      [
        useGrouping,
        minFractionDigits,
        maxFractionDigits,
        prefix ?? "",
        suffix ?? "",
        mode,
        currency ?? "",
        locale ?? "",
      ].join("\u0001"),
    [currency, locale, maxFractionDigits, minFractionDigits, mode, prefix, suffix, useGrouping],
  );

  const clampValue = useCallback(
    (val: number): number => clampNumberValue(val, min, max, effectiveMaxFrac),
    [min, max, effectiveMaxFrac],
  );

  const formatValue = useCallback(
    (val: number | null | undefined): string => formatCommittedNumber(val, formatOptions),
    [formatOptions],
  );

  const inputElRef = useRef<HTMLInputElement | null>(null);
  const isFocusedRef = useRef(false);
  const isComposingRef = useRef(false);
  const draftVersionRef = useRef(0);
  const lastEchoRef = useRef<{ version: number; value: number | null | undefined }>({
    version: 0,
    value: currentValue,
  });
  const capturedSelectionRef = useRef<{ start: number; end: number } | null>(null);
  const compositionStartTextRef = useRef<string | null>(null);
  const skipPostCompositionInputRef = useRef(false);
  const prevFormatSigRef = useRef<string>(formatSignature);
  const pendingCaretRef = useRef<number | null>(null);
  const [, bumpRender] = useState(0);

  const [displayText, setDisplayTextState] = useState<string>(() => formatValue(currentValue));
  const displayTextRef = useRef<string>(displayText);

  const setDisplayText = useCallback((next: string) => {
    displayTextRef.current = next;
    setDisplayTextState(next);
  }, []);

  useEffect(() => {
    const val = currentValue;
    const optionsChanged = prevFormatSigRef.current !== formatSignature;
    prevFormatSigRef.current = formatSignature;

    if (val === null || val === undefined || !Number.isFinite(val)) {
      const isCurrentDraftEcho =
        !optionsChanged &&
        lastEchoRef.current.version === draftVersionRef.current &&
        isSameNumericModel(val, lastEchoRef.current.value);
      if (!isFocusedRef.current || optionsChanged || !isCurrentDraftEcho) {
        if (
          !isFocusedRef.current ||
          parseNumberRaw(displayTextRef.current, formatOptions).kind === "number" ||
          !isCurrentDraftEcho
        ) {
          setDisplayText("");
        }
        draftVersionRef.current += 1;
        lastEchoRef.current = { version: draftVersionRef.current, value: val ?? null };
      }
      return;
    }

    if (!isFocusedRef.current || optionsChanged) {
      draftVersionRef.current += 1;
      lastEchoRef.current = { version: draftVersionRef.current, value: val };
      setDisplayText(formatValue(val));
      return;
    }

    if (
      lastEchoRef.current.version === draftVersionRef.current &&
      isSameNumericModel(val, lastEchoRef.current.value)
    ) {
      return;
    }

    const el = inputElRef.current;
    const prevTokens = el
      ? countSemanticTokensBeforeCaret(
          displayTextRef.current,
          el.selectionEnd ?? el.selectionStart ?? displayTextRef.current.length,
          formatOptions,
        )
      : null;
    const formatted = formatValue(val);
    draftVersionRef.current += 1;
    lastEchoRef.current = { version: draftVersionRef.current, value: val };
    if (prevTokens !== null) {
      pendingCaretRef.current = mapSemanticCaretToFormattedText(formatted, prevTokens, formatOptions);
    }
    setDisplayText(formatted);
  }, [currentValue, formatOptions, formatSignature, formatValue, setDisplayText]);

  useIsomorphicLayoutEffect(() => {
    const caret = pendingCaretRef.current;
    if (caret === null) return;
    pendingCaretRef.current = null;
    setSelectionSafely(inputElRef.current, caret);
  });

  const emitValue = useCallback(
    (nextVal: number | null, version: number) => {
      lastEchoRef.current = { version, value: nextVal };
      if (!isControlled) {
        setUncontrolledValue(nextVal);
      }
      onValueChange?.(nextVal);
    },
    [isControlled, onValueChange],
  );

  const applyRawEdit = useCallback(
    (
      rawText: string,
      rawCaret: number,
      inputType: string | undefined,
      originalEvent: Event,
      prevSel?: { start: number; end: number } | null,
    ) => {
      const prev = displayTextRef.current;
      const reconciled = reconcileNumberEdit({
        rawText,
        rawCaret,
        prevText: prev,
        prevSelectionStart: prevSel?.start,
        prevSelectionEnd: prevSel?.end,
        inputType,
        options: formatOptions,
      });

      pendingCaretRef.current = reconciled.caret;
      if (reconciled.rejected) {
        if (rawText !== reconciled.text) {
          bumpRender((n) => n + 1);
        }
        if (inputElRef.current && inputElRef.current.value !== reconciled.text) {
          inputElRef.current.value = reconciled.text;
        }
        setSelectionSafely(inputElRef.current, reconciled.caret);
        return;
      }

      draftVersionRef.current += 1;
      const nextVersion = draftVersionRef.current;

      if (reconciled.text === prev) {
        if (rawText !== reconciled.text) {
          bumpRender((n) => n + 1);
        }
        if (inputElRef.current && inputElRef.current.value !== reconciled.text) {
          inputElRef.current.value = reconciled.text;
        }
        setSelectionSafely(inputElRef.current, reconciled.caret);
      } else {
        setDisplayText(reconciled.text);
        if (inputElRef.current && inputElRef.current.value !== reconciled.text) {
          inputElRef.current.value = reconciled.text;
        }
        setSelectionSafely(inputElRef.current, reconciled.caret);
      }

      if (reconciled.parsed.kind === "empty") {
        if (allowEmpty !== false) {
          onInput?.({ originalEvent, value: null, formattedValue: "" });
          emitValue(null, nextVersion);
        }
        return;
      }
      if (reconciled.parsed.kind === "number") {
        const val = roundNumberToPrecision(reconciled.parsed.value, effectiveMaxFrac);
        onInput?.({ originalEvent, value: val, formattedValue: reconciled.text });
        emitValue(val, nextVersion);
      }
    },
    [allowEmpty, effectiveMaxFrac, emitValue, formatOptions, onInput, setDisplayText],
  );

  const beforeInputHandlerRef = useRef<(event: globalThis.InputEvent) => void>(() => {});
  beforeInputHandlerRef.current = (event: globalThis.InputEvent) => {
    if (resolvedDisabled || resolvedReadOnly) {
      event.preventDefault();
      return;
    }
    if (isComposingRef.current || event.isComposing) return;
    skipPostCompositionInputRef.current = false;
    const el = inputElRef.current;
    if (el) {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? start;
      capturedSelectionRef.current = { start, end };
    } else {
      capturedSelectionRef.current = null;
    }
    if (
      event.inputType === "insertText" &&
      event.data &&
      !isAllowedNumberInputText(event.data, formatOptions)
    ) {
      capturedSelectionRef.current = null;
      event.preventDefault();
    }
  };

  const keypressHandlerRef = useRef<(event: globalThis.KeyboardEvent) => void>(() => {});
  keypressHandlerRef.current = (event: globalThis.KeyboardEvent) => {
    if (resolvedDisabled || resolvedReadOnly) {
      event.preventDefault();
      return;
    }
    if (isComposingRef.current || event.isComposing) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const ch =
      event.key && event.key.length === 1
        ? event.key
        : event.charCode
          ? String.fromCharCode(event.charCode)
          : "";
    if (!ch) return;

    if (!isAllowedNumberInputText(ch, formatOptions)) {
      event.preventDefault();
      return;
    }

    // 真实浏览器走原生输入链；合成 DOM 测试（fireEvent.keyPress）不会自动派发 input，在此承接。
    if (event.isTrusted) return;

    event.preventDefault();
    const el = inputElRef.current;
    const current = el ? el.value : displayTextRef.current;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const nextRaw = `${current.slice(0, start)}${ch}${current.slice(end)}`;
    applyRawEdit(nextRaw, start + ch.length, "insertText", event, { start, end });
  };

  useIsomorphicLayoutEffect(() => {
    const el = inputElRef.current;
    if (!el) return;
    const onNativeBeforeInput = (event: Event) =>
      beforeInputHandlerRef.current(event as globalThis.InputEvent);
    const onNativeKeypress = (event: globalThis.KeyboardEvent) =>
      keypressHandlerRef.current(event);
    el.addEventListener("beforeinput", onNativeBeforeInput);
    el.addEventListener("keypress", onNativeKeypress);
    return () => {
      el.removeEventListener("beforeinput", onNativeBeforeInput);
      el.removeEventListener("keypress", onNativeKeypress);
    };
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
    const currentParsed = parseNumberRaw(displayTextRef.current, formatOptions);
    const baseVal =
      currentParsed.kind === "number"
        ? currentParsed.value
        : currentValue !== null && currentValue !== undefined && Number.isFinite(currentValue)
          ? currentValue
          : 0;

    const precision = Math.max(
      countNumberDecimals(baseVal),
      countNumberDecimals(stepAmount),
      effectiveMaxFrac ?? 0,
    );
    const rawNext = Number((baseVal + direction * stepAmount).toFixed(Math.min(20, precision)));
    const clamped = clampValue(rawNext);
    const formatted = formatValue(clamped);
    draftVersionRef.current += 1;
    const nextVersion = draftVersionRef.current;
    setDisplayText(formatted);
    if (inputElRef.current) {
      inputElRef.current.value = formatted;
    }
    onInput?.({ originalEvent, value: clamped, formattedValue: formatted });
    emitValue(clamped, nextVersion);
  }

  function commitDisplayValue() {
    const raw = inputElRef.current ? inputElRef.current.value : displayTextRef.current;
    const parsed = parseNumberRaw(raw, formatOptions);
    if (parsed.kind === "empty" || parsed.kind === "incomplete") {
      draftVersionRef.current += 1;
      const nextVersion = draftVersionRef.current;
      if (allowEmpty !== false) {
        setDisplayText("");
        if (inputElRef.current) {
          inputElRef.current.value = "";
        }
        emitValue(null, nextVersion);
      } else {
        const fallback = clampValue(min ?? 0);
        const formatted = formatValue(fallback);
        setDisplayText(formatted);
        if (inputElRef.current) {
          inputElRef.current.value = formatted;
        }
        emitValue(fallback, nextVersion);
      }
      return;
    }
    if (parsed.kind === "number") {
      const clamped = clampValue(parsed.value);
      const formatted = formatValue(clamped);
      draftVersionRef.current += 1;
      const nextVersion = draftVersionRef.current;
      setDisplayText(formatted);
      if (inputElRef.current) {
        inputElRef.current.value = formatted;
      }
      if (!isSameNumericModel(clamped, currentValue)) {
        emitValue(clamped, nextVersion);
      } else {
        lastEchoRef.current = { version: nextVersion, value: clamped };
      }
      return;
    }
    const restored = formatValue(currentValue);
    draftVersionRef.current += 1;
    lastEchoRef.current = { version: draftVersionRef.current, value: currentValue };
    setDisplayText(restored);
    if (inputElRef.current) {
      inputElRef.current.value = restored;
    }
  }

  function handleCompositionStart(event: ReactCompositionEvent<HTMLInputElement>) {
    isComposingRef.current = true;
    skipPostCompositionInputRef.current = false;
    compositionStartTextRef.current = displayTextRef.current;
    const target = event.currentTarget;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? start;
    capturedSelectionRef.current = { start, end };
    onCompositionStart?.(event);
  }

  function handleCompositionEnd(event: ReactCompositionEvent<HTMLInputElement>) {
    onCompositionEnd?.(event);
    if (!isComposingRef.current) return;
    isComposingRef.current = false;
    const startSnapshot = compositionStartTextRef.current;
    const selSnapshot = capturedSelectionRef.current;
    compositionStartTextRef.current = null;
    capturedSelectionRef.current = null;
    if (resolvedDisabled || resolvedReadOnly) return;
    const target = event.currentTarget;
    if (startSnapshot !== null && target.value === startSnapshot) {
      setDisplayText(startSnapshot);
      skipPostCompositionInputRef.current = true;
      return;
    }
    displayTextRef.current = startSnapshot ?? displayTextRef.current;
    const rawCaret = target.selectionEnd ?? target.selectionStart ?? target.value.length;
    applyRawEdit(target.value, rawCaret, "insertCompositionText", event.nativeEvent, selSnapshot);
    skipPostCompositionInputRef.current = true;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (resolvedDisabled || resolvedReadOnly) return;
    const nativeInputEvent = event.nativeEvent as InputEvent;
    if (isComposingRef.current || nativeInputEvent.isComposing) {
      setDisplayTextState(event.currentTarget.value);
      return;
    }
    const target = event.currentTarget;
    if (skipPostCompositionInputRef.current) {
      skipPostCompositionInputRef.current = false;
      if (target.value === displayTextRef.current) {
        return;
      }
    }
    const prevSel = capturedSelectionRef.current;
    capturedSelectionRef.current = null;
    const rawCaret = target.selectionEnd ?? target.selectionStart ?? target.value.length;
    applyRawEdit(target.value, rawCaret, nativeInputEvent.inputType, event.nativeEvent, prevSel);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (resolvedDisabled || resolvedReadOnly) return;
    if (
      isComposingRef.current ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229
    ) {
      return;
    }
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
    isComposingRef.current = false;
    capturedSelectionRef.current = null;
    compositionStartTextRef.current = null;
    skipPostCompositionInputRef.current = false;
    commitDisplayValue();
    onBlur?.(event);
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    if (resolvedDisabled || resolvedReadOnly || allowEmpty === false) return;
    draftVersionRef.current += 1;
    const nextVersion = draftVersionRef.current;
    setDisplayText("");
    if (inputElRef.current) {
      inputElRef.current.value = "";
    }
    onInput?.({ originalEvent: event.nativeEvent, value: null, formattedValue: "" });
    emitValue(null, nextVersion);
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
        inputMode={effectiveMaxFrac === 0 ? "numeric" : "decimal"}
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
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
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
