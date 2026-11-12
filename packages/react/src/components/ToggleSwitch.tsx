import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";

export interface ToggleSwitchProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "value" | "defaultChecked" | "onChange"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  value?: boolean | string;
  onValueChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  inputId?: string;
  readOnly?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
}

export const ToggleSwitch = forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  function MwToggleSwitch(props, ref) {
    const {
      checked,
      defaultChecked = false,
      onCheckedChange,
      value,
      onValueChange,
      onChange,
      inputId,
      id,
      name,
      disabled,
      readOnly,
      readonly,
      invalid,
      required,
      className,
      style,
      "aria-describedby": ariaDescribedBy,
      onClickCapture,
      onKeyDownCapture,
      ...restAttrs
    } = props;

    const fieldContext = useFormFieldContext();
    const resolvedId = inputId ?? id ?? fieldContext.inputId;
    const resolvedDisabled = Boolean(disabled ?? fieldContext.disabled);
    const resolvedReadOnly = Boolean(readOnly ?? readonly);
    const resolvedInvalid = Boolean(invalid ?? fieldContext.invalid);
    const resolvedRequired = Boolean(required ?? fieldContext.required);
    const resolvedDescribedBy = mergeDescribedBy(ariaDescribedBy, fieldContext.describedBy);

    const controlledBool =
      checked !== undefined ? checked : typeof value === "boolean" ? value : undefined;
    const isControlled = controlledBool !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>(defaultChecked);
    const currentChecked = isControlled ? controlledBool : uncontrolledChecked;

    const rootClass = [
      "mw-toggle-switch",
      "mw-control",
      currentChecked ? "mw-toggle-switch--checked" : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    function handleCheckedChange(nextChecked: boolean) {
      if (resolvedDisabled || resolvedReadOnly) return;
      if (!isControlled) {
        setUncontrolledChecked(nextChecked);
      }
      onCheckedChange?.(nextChecked);
      onValueChange?.(nextChecked);
      onChange?.(nextChecked);
    }

    function handleClickCapture(event: MouseEvent<HTMLButtonElement>) {
      onClickCapture?.(event);
      if (resolvedDisabled || resolvedReadOnly) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function handleKeyDownCapture(event: KeyboardEvent<HTMLButtonElement>) {
      onKeyDownCapture?.(event);
      if (
        (resolvedDisabled || resolvedReadOnly) &&
        (event.key === " " || event.key === "Spacebar" || event.key === "Enter")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    return (
      <SwitchPrimitive.Root
        {...restAttrs}
        ref={ref}
        id={resolvedId}
        name={name}
        value={typeof value === "string" ? value : undefined}
        className={rootClass}
        style={style}
        checked={currentChecked}
        disabled={resolvedDisabled}
        required={resolvedRequired}
        aria-describedby={resolvedDescribedBy}
        aria-invalid={resolvedInvalid || undefined}
        aria-readonly={resolvedReadOnly || undefined}
        data-invalid={resolvedInvalid ? "" : undefined}
        data-disabled={resolvedDisabled ? "" : undefined}
        data-readonly={resolvedReadOnly ? "" : undefined}
        onClickCapture={handleClickCapture}
        onKeyDownCapture={handleKeyDownCapture}
        onCheckedChange={handleCheckedChange}
      >
        <SwitchPrimitive.Thumb className="mw-toggle-switch__thumb" />
      </SwitchPrimitive.Root>
    );
  },
);

ToggleSwitch.displayName = "MwToggleSwitch";

export default ToggleSwitch;
