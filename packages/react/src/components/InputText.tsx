import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type InputHTMLAttributes,
} from "react";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";

export type InputTextSize = "xs" | "sm" | "md" | "lg" | "small" | "large";

export interface InputTextProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue"> {
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  inputId?: string;
  readonly?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  size?: InputTextSize;
  maxlength?: number | string;
  autocomplete?: string;
  autofocus?: boolean;
  inputmode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
}

export const InputText = forwardRef<HTMLInputElement, InputTextProps>(function MwInputText(
  props,
  ref,
) {
  const {
    value,
    defaultValue,
    onValueChange,
    inputId,
    id,
    name,
    type = "text",
    placeholder,
    disabled,
    readOnly,
    readonly,
    invalid,
    required,
    fluid = false,
    size,
    maxLength,
    maxlength,
    autoComplete,
    autocomplete,
    autoFocus,
    autofocus,
    inputMode,
    inputmode,
    className,
    style,
    "aria-describedby": ariaDescribedBy,
    onChange,
    onCompositionStart,
    onCompositionEnd,
    ...restAttrs
  } = props;

  const fieldContext = useFormFieldContext();
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue ?? "");
  const [composingValue, setComposingValue] = useState<string | null>(null);
  const isComposingRef = useRef(false);

  const resolvedId = inputId ?? id ?? fieldContext.inputId;
  const resolvedDisabled = Boolean(disabled ?? fieldContext.disabled);
  const resolvedReadOnly = Boolean(readOnly ?? readonly);
  const resolvedInvalid = Boolean(invalid ?? fieldContext.invalid);
  const resolvedRequired = Boolean(required ?? fieldContext.required);
  const resolvedDescribedBy = mergeDescribedBy(ariaDescribedBy, fieldContext.describedBy);
  const resolvedMaxLength =
    maxLength ?? (maxlength !== undefined ? Number(maxlength) : undefined);

  const resolvedSize =
    size === "small" || size === "sm"
      ? "sm"
      : size === "large" || size === "lg"
        ? "lg"
        : size === "xs" || size === "md"
          ? size
          : undefined;

  const rootClass = [
    "mw-input-text",
    "mw-control",
    "mw-input",
    resolvedSize ? `mw-input-text--${resolvedSize} mw-size-${resolvedSize}` : undefined,
    fluid ? "mw-input-text--fluid" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const displayedValue =
    composingValue !== null
      ? composingValue
      : isControlled
        ? (value ?? "")
        : uncontrolledValue;

  function handleCompositionStart(event: CompositionEvent<HTMLInputElement>) {
    isComposingRef.current = true;
    setComposingValue(event.currentTarget.value ?? "");
    onCompositionStart?.(event);
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    onCompositionEnd?.(event);
    if (!isComposingRef.current) return;
    isComposingRef.current = false;
    const nextVal = event.currentTarget.value ?? "";
    setComposingValue(null);
    if (!isControlled) {
      setUncontrolledValue(nextVal);
    }
    onValueChange?.(nextVal);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    const nextVal = event.currentTarget.value ?? "";
    const nativeComposing = Boolean((event.nativeEvent as InputEvent | undefined)?.isComposing);
    if (isComposingRef.current || nativeComposing) {
      setComposingValue(nextVal);
      return;
    }
    if (!isControlled) {
      setUncontrolledValue(nextVal);
    }
    onValueChange?.(nextVal);
  }

  return (
    <input
      {...restAttrs}
      ref={ref}
      id={resolvedId}
      name={name}
      type={type}
      className={rootClass}
      style={style}
      value={displayedValue}
      placeholder={placeholder}
      disabled={resolvedDisabled}
      readOnly={resolvedReadOnly}
      required={resolvedRequired}
      maxLength={resolvedMaxLength}
      autoComplete={autoComplete ?? autocomplete}
      autoFocus={autoFocus ?? autofocus}
      inputMode={inputMode ?? inputmode}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid || undefined}
      data-invalid={resolvedInvalid ? "" : undefined}
      data-disabled={resolvedDisabled ? "" : undefined}
      data-readonly={resolvedReadOnly ? "" : undefined}
      data-size={resolvedSize}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onChange={handleChange}
    />
  );
});

InputText.displayName = "MwInputText";

export default InputText;
