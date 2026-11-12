import type {
  CSSProperties,
  FocusEventHandler,
  InputHTMLAttributes,
  KeyboardEventHandler,
} from "react";

export type InputNumberSize = "xs" | "sm" | "md" | "lg" | "small" | "large";

export type InputNumberMode = "decimal" | "currency";

export type InputNumberButtonLayout = "stacked" | "horizontal" | "vertical";

export interface InputNumberInputEvent {
  originalEvent: Event;
  value: number | null;
  formattedValue: string;
}

export interface InputNumberProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onInput" | "prefix"
  > {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  onInput?: (event: InputNumberInputEvent) => void;
  min?: number;
  max?: number;
  step?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  useGrouping?: boolean;
  prefix?: string;
  suffix?: string;
  mode?: InputNumberMode;
  currency?: string;
  locale?: string;
  showButtons?: boolean;
  buttonLayout?: InputNumberButtonLayout;
  showClear?: boolean;
  allowEmpty?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  fluid?: boolean;
  size?: InputNumberSize;
  inputId?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  inputClassName?: string;
  inputClass?: string;
  inputStyle?: CSSProperties;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}
