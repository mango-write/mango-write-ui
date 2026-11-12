import type { FocusEventHandler, InputHTMLAttributes } from "react";

export type RadioButtonSize = "sm" | "md" | "lg" | "small" | "large";

export interface RadioButtonChangeEvent<T = any> {
  originalEvent: Event;
  value: T;
}

export interface RadioButtonProps<T = any>
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "checked" | "defaultChecked" | "onChange"
  > {
  modelValue?: T;
  value?: T;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onValueChange?: (value: T) => void;
  onChange?: (event: RadioButtonChangeEvent<T>) => void;
  binary?: boolean;
  name?: string;
  inputId?: string;
  id?: string;
  tabindex?: number;
  disabled?: boolean;
  invalid?: boolean;
  readonly?: boolean;
  required?: boolean;
  size?: RadioButtonSize;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}
