export type RadioButtonSize = "sm" | "md" | "lg" | "small" | "large";

export interface RadioButtonChangeEvent<T = any> {
  originalEvent: Event;
  value: T;
}

export interface RadioButtonProps<T = any> {
  modelValue?: T;
  value?: T;
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
}

export interface RadioButtonEmits {
  "update:modelValue": [value: any];
  change: [event: RadioButtonChangeEvent];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}
