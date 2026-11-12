import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
} from "react";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";
import type { RadioButtonProps } from "./radio-button";

export type {
  RadioButtonChangeEvent,
  RadioButtonProps,
  RadioButtonSize,
} from "./radio-button";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

function isSameValue(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function MwRadioButton(
  props,
  forwardedRef,
) {
  const {
    modelValue,
    value,
    checked,
    defaultChecked = false,
    onCheckedChange,
    onValueChange,
    onChange,
    binary = false,
    name,
    inputId,
    id,
    tabIndex,
    tabindex,
    disabled,
    invalid,
    readOnly,
    readonly,
    required,
    size = "md",
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    className,
    style,
    "aria-label": nativeAriaLabel,
    "aria-labelledby": nativeAriaLabelledby,
    "aria-describedby": nativeAriaDescribedby,
    onFocus,
    onBlur,
    ...restAttrs
  } = props;

  const fieldContext = useFormFieldContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastHandledEventRef = useRef<Event | null>(null);
  const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>(defaultChecked);

  const resolvedId = inputId ?? id ?? fieldContext.inputId;
  const resolvedDisabled = Boolean(disabled ?? fieldContext.disabled);
  const resolvedReadOnly = Boolean(readOnly ?? readonly);
  const resolvedInvalid = Boolean(invalid ?? fieldContext.invalid);
  const resolvedRequired = Boolean(required ?? fieldContext.required);
  const resolvedDescribedBy = mergeDescribedBy(
    ariaDescribedby ?? nativeAriaDescribedby,
    fieldContext.describedBy,
  );

  const isControlled = checked !== undefined || modelValue !== undefined;

  const isChecked =
    checked !== undefined
      ? Boolean(checked)
      : binary
        ? modelValue !== undefined
          ? Boolean(modelValue)
          : uncontrolledChecked
        : modelValue !== undefined && value !== undefined
          ? isSameValue(modelValue, value)
          : isControlled
            ? false
            : uncontrolledChecked;

  const resolvedSize: "sm" | "md" | "lg" =
    size === "small" || size === "sm"
      ? "sm"
      : size === "large" || size === "lg"
        ? "lg"
        : "md";

  const rootClass = [
    "mw-radio",
    `mw-radio--${resolvedSize}`,
    isChecked ? "mw-radio--checked" : undefined,
    resolvedDisabled ? "mw-radio--disabled" : undefined,
    resolvedReadOnly ? "mw-radio--readonly" : undefined,
    resolvedInvalid ? "mw-radio--invalid" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  function commitSelection(originalEvent: Event) {
    if (resolvedDisabled || resolvedReadOnly) return;
    if (lastHandledEventRef.current === originalEvent) return;
    lastHandledEventRef.current = originalEvent;

    const nextChecked = binary ? !isChecked : true;
    const nextValue = binary ? nextChecked : value;
    if (!isControlled) {
      setUncontrolledChecked(nextChecked);
    }
    onCheckedChange?.(nextChecked);
    onValueChange?.(nextValue);
    onChange?.({ originalEvent, value: nextValue });
  }

  function handleInputClick(event: MouseEvent<HTMLInputElement>) {
    if (resolvedDisabled || resolvedReadOnly) {
      event.preventDefault();
      return;
    }
    if (binary && isChecked) {
      commitSelection(event.nativeEvent);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (resolvedDisabled || resolvedReadOnly) {
      event.preventDefault();
      if (inputRef.current) {
        inputRef.current.checked = isChecked;
      }
      return;
    }
    commitSelection(event.nativeEvent);
  }

  function handleRootClick(event: MouseEvent<HTMLDivElement>) {
    if (resolvedDisabled || resolvedReadOnly) {
      event.preventDefault();
      return;
    }
    if (event.target === inputRef.current) return;
    inputRef.current?.focus();
    commitSelection(event.nativeEvent);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      if (resolvedDisabled || resolvedReadOnly) return;
      commitSelection(event.nativeEvent);
    }
  }

  const domValue =
    typeof value === "string" || typeof value === "number" ? value : undefined;

  return (
    <div
      className={rootClass}
      style={style}
      data-state={isChecked ? "checked" : "unchecked"}
      data-disabled={resolvedDisabled ? "" : undefined}
      data-readonly={resolvedReadOnly ? "" : undefined}
      data-invalid={resolvedInvalid ? "" : undefined}
      data-size={resolvedSize}
      onClick={handleRootClick}
    >
      <input
        {...restAttrs}
        ref={setRefs}
        type="radio"
        className="mw-radio__input"
        id={resolvedId}
        name={name}
        value={domValue}
        checked={isChecked}
        disabled={resolvedDisabled}
        readOnly={resolvedReadOnly}
        required={resolvedRequired}
        tabIndex={tabIndex ?? tabindex}
        aria-checked={isChecked ? "true" : "false"}
        aria-label={ariaLabel ?? nativeAriaLabel}
        aria-labelledby={ariaLabelledby ?? nativeAriaLabelledby}
        aria-describedby={resolvedDescribedBy}
        aria-invalid={resolvedInvalid || undefined}
        aria-readonly={resolvedReadOnly || undefined}
        data-state={isChecked ? "checked" : "unchecked"}
        data-invalid={resolvedInvalid ? "" : undefined}
        data-disabled={resolvedDisabled ? "" : undefined}
        data-readonly={resolvedReadOnly ? "" : undefined}
        onClick={handleInputClick}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <span className="mw-radio__box mw-control" aria-hidden="true">
        <span className="mw-radio__icon" />
      </span>
    </div>
  );
});

RadioButton.displayName = "MwRadioButton";

export default RadioButton;
