import type { HTMLAttributes, ReactNode } from "react";

export type SelectButtonSize = "xs" | "sm" | "md" | "lg" | "small" | "large";

export type SelectButtonOptionAccessor<T = any, R = any> = string | ((option: T) => R);

export interface SelectButtonChangeEvent<T = any> {
  originalEvent: Event;
  value: T;
}

export interface SelectButtonProps<T = any>
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "unselectable"> {
  value?: T;
  defaultValue?: T;
  modelValue?: T;
  onValueChange?: (value: any) => void;
  onChange?: (event: SelectButtonChangeEvent<any>) => void;
  options?: readonly any[];
  optionLabel?: SelectButtonOptionAccessor<any, string>;
  optionValue?: SelectButtonOptionAccessor<any, any>;
  optionDisabled?: SelectButtonOptionAccessor<any, boolean>;
  multiple?: boolean;
  allowEmpty?: boolean;
  unselectable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  size?: SelectButtonSize;
  ariaLabel?: string;
  ariaLabelledby?: string;
  dataKey?: string;
  renderOption?: (option: any, index: number) => ReactNode;
}
