export type SelectButtonSize = "sm" | "md" | "lg" | "small" | "large";

export type SelectButtonOptionAccessor<T = any, R = any> =
  | string
  | ((option: T) => R);

export interface SelectButtonChangeEvent<T = any> {
  originalEvent: Event;
  value: T;
}

export interface SelectButtonProps<T = any> {
  modelValue?: T;
  options?: readonly any[];
  optionLabel?: SelectButtonOptionAccessor<any, string>;
  optionValue?: SelectButtonOptionAccessor<any, any>;
  optionDisabled?: SelectButtonOptionAccessor<any, boolean>;
  multiple?: boolean;
  allowEmpty?: boolean;
  unselectable?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  size?: SelectButtonSize;
  ariaLabel?: string;
  ariaLabelledby?: string;
  dataKey?: string;
}

export interface SelectButtonEmits {
  "update:modelValue": [value: any];
  change: [event: SelectButtonChangeEvent];
}
