import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Check, Minus } from "lucide-react";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";

export type CheckboxSize = "sm" | "md" | "lg" | "small" | "large";

export interface CheckboxChangeEvent<T = any> {
  originalEvent: Event;
  value: T;
  checked: boolean;
}

export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultChecked" | "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  modelValue?: any;
  defaultModelValue?: any;
  value?: any;
  onValueChange?: (value: any) => void;
  onChange?: (event: CheckboxChangeEvent) => void;
  binary?: boolean;
  indeterminate?: boolean;
  trueValue?: any;
  falseValue?: any;
  inputId?: string;
  readOnly?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: CheckboxSize;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function MwCheckbox(
  props,
  ref,
) {
  const {
    checked,
    defaultChecked = false,
    onCheckedChange,
    modelValue,
    defaultModelValue,
    value,
    onValueChange,
    onChange,
    binary = false,
    indeterminate = false,
    trueValue = true,
    falseValue = false,
    inputId,
    id,
    name,
    disabled,
    readOnly,
    readonly,
    invalid,
    required,
    size = "md",
    tabIndex,
    className,
    style,
    "aria-describedby": ariaDescribedBy,
    onClick,
    onKeyDown,
    ...restAttrs
  } = props;

  const fieldContext = useFormFieldContext();
  const resolvedId = inputId ?? id ?? fieldContext.inputId;
  const resolvedDisabled = Boolean(disabled ?? fieldContext.disabled);
  const resolvedReadOnly = Boolean(readOnly ?? readonly);
  const resolvedInvalid = Boolean(invalid ?? fieldContext.invalid);
  const resolvedRequired = Boolean(required ?? fieldContext.required);
  const resolvedDescribedBy = mergeDescribedBy(ariaDescribedBy, fieldContext.describedBy);

  const isCheckedControlled = checked !== undefined;
  const isModelControlled = modelValue !== undefined;

  const [uncontrolledValue, setUncontrolledValue] = useState<any>(() =>
    defaultModelValue !== undefined ? defaultModelValue : defaultChecked ? trueValue : falseValue,
  );

  const activeModel = isModelControlled ? modelValue : uncontrolledValue;
  const isArrayMode = !binary && !isCheckedControlled && Array.isArray(activeModel);

  const isChecked = isCheckedControlled
    ? Boolean(checked)
    : isArrayMode
      ? (activeModel as unknown[]).includes(value)
      : activeModel === trueValue;

  const dataState: "checked" | "unchecked" | "indeterminate" = indeterminate
    ? "indeterminate"
    : isChecked
      ? "checked"
      : "unchecked";

  const ariaChecked: "true" | "false" | "mixed" = indeterminate
    ? "mixed"
    : isChecked
      ? "true"
      : "false";

  const resolvedSize =
    size === "small" || size === "sm"
      ? "sm"
      : size === "large" || size === "lg"
        ? "lg"
        : "md";

  const rootClass = [
    "mw-checkbox",
    "mw-control",
    `mw-checkbox--${resolvedSize}`,
    isChecked && !indeterminate ? "mw-checkbox--checked" : undefined,
    indeterminate ? "mw-checkbox--indeterminate" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function toggle(originalEvent: Event) {
    if (resolvedDisabled || resolvedReadOnly) return;

    if (isArrayMode) {
      const current = activeModel as unknown[];
      const nextChecked = !isChecked;
      const nextValue = isChecked
        ? current.filter((item) => item !== value)
        : [...current, value];
      if (!isModelControlled) {
        setUncontrolledValue(nextValue);
      }
      onCheckedChange?.(nextChecked);
      onValueChange?.(nextValue);
      onChange?.({ originalEvent, value: nextValue, checked: nextChecked });
      return;
    }

    const nextChecked = indeterminate ? true : !isChecked;
    const nextValue = nextChecked ? trueValue : falseValue;
    if (!isCheckedControlled && !isModelControlled) {
      setUncontrolledValue(nextValue);
    }
    onCheckedChange?.(nextChecked);
    onValueChange?.(nextValue);
    onChange?.({ originalEvent, value: nextValue, checked: nextChecked });
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (resolvedDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    toggle(event.nativeEvent);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      if (resolvedDisabled || resolvedReadOnly) return;
      toggle(event.nativeEvent);
    }
  }

  return (
    <button
      {...restAttrs}
      ref={ref}
      type="button"
      role="checkbox"
      id={resolvedId}
      name={name}
      className={rootClass}
      style={style}
      disabled={resolvedDisabled}
      tabIndex={tabIndex}
      aria-checked={ariaChecked}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid || undefined}
      aria-readonly={resolvedReadOnly || undefined}
      aria-required={resolvedRequired || undefined}
      data-state={dataState}
      data-disabled={resolvedDisabled ? "" : undefined}
      data-readonly={resolvedReadOnly ? "" : undefined}
      data-invalid={resolvedInvalid ? "" : undefined}
      data-size={resolvedSize}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="mw-checkbox__indicator" aria-hidden="true">
        {indeterminate ? (
          <Minus className="mw-checkbox__icon" aria-hidden="true" />
        ) : isChecked ? (
          <Check className="mw-checkbox__icon" aria-hidden="true" />
        ) : null}
      </span>
    </button>
  );
});

Checkbox.displayName = "MwCheckbox";

export default Checkbox;
