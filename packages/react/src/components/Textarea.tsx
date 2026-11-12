import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows" | "value" | "defaultValue"> {
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  inputId?: string;
  rows?: number | string;
  autoResize?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  maxlength?: number | string;
  autocomplete?: string;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function MwTextarea(
  props,
  forwardedRef,
) {
  const {
    value,
    defaultValue,
    onValueChange,
    inputId,
    id,
    name,
    rows = 3,
    autoResize = false,
    placeholder,
    disabled,
    readOnly,
    readonly,
    invalid,
    required,
    fluid = false,
    maxLength,
    maxlength,
    autoComplete,
    autocomplete,
    className,
    style,
    "aria-describedby": ariaDescribedBy,
    onChange,
    onCompositionStart,
    onCompositionEnd,
    ...restAttrs
  } = props;

  const fieldContext = useFormFieldContext();
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
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
  const resolvedRows = typeof rows === "string" ? Number(rows) || undefined : rows;

  const rootClass = [
    "mw-textarea",
    "mw-control",
    fluid ? "mw-textarea--fluid" : undefined,
    autoResize ? "mw-textarea--autoresize" : undefined,
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

  const resize = useCallback(() => {
    const el = innerRef.current;
    if (!el || !autoResize) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoResize]);

  useIsomorphicLayoutEffect(() => {
    resize();
  }, [displayedValue, resize]);

  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  function handleCompositionStart(event: CompositionEvent<HTMLTextAreaElement>) {
    isComposingRef.current = true;
    setComposingValue(event.currentTarget.value ?? "");
    onCompositionStart?.(event);
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLTextAreaElement>) {
    onCompositionEnd?.(event);
    if (!isComposingRef.current) return;
    isComposingRef.current = false;
    const nextVal = event.currentTarget.value ?? "";
    setComposingValue(null);
    if (!isControlled) {
      setUncontrolledValue(nextVal);
    }
    onValueChange?.(nextVal);
    resize();
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(event);
    resize();
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
    <textarea
      {...restAttrs}
      ref={setRefs}
      id={resolvedId}
      name={name}
      rows={resolvedRows}
      className={rootClass}
      style={style}
      value={displayedValue}
      placeholder={placeholder}
      disabled={resolvedDisabled}
      readOnly={resolvedReadOnly}
      required={resolvedRequired}
      maxLength={resolvedMaxLength}
      autoComplete={autoComplete ?? autocomplete}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid || undefined}
      data-invalid={resolvedInvalid ? "" : undefined}
      data-disabled={resolvedDisabled ? "" : undefined}
      data-readonly={resolvedReadOnly ? "" : undefined}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onChange={handleChange}
    />
  );
});

Textarea.displayName = "MwTextarea";

export default Textarea;
