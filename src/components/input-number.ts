import type { CSSProperties } from "vue";

export type InputNumberSize = "sm" | "md" | "lg" | "small" | "large";

export type InputNumberMode = "decimal" | "currency";

export type InputNumberButtonLayout = "stacked" | "horizontal" | "vertical";

export type InputNumberClassValue =
  | string
  | Record<string, boolean>
  | Array<string | Record<string, boolean>>;

export interface InputNumberInputEvent {
  originalEvent: Event;
  value: number | null;
  formattedValue: string;
}

export interface InputNumberProps {
  modelValue?: number | null;
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
  inputClass?: InputNumberClassValue;
  inputStyle?: string | CSSProperties | Record<string, string | number>;
}

export interface InputNumberEmits {
  "update:modelValue": [value: number | null];
  input: [event: InputNumberInputEvent];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
}
