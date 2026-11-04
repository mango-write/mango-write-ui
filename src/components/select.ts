import type { CSSProperties } from "vue";

export type SelectSize = "sm" | "md" | "lg" | "small" | "large";

export type SelectOptionAccessor<T = any, R = any> = string | ((option: T) => R);

export interface SelectChangeEvent<T = any> {
  value: T;
  originalEvent?: Event;
}

export interface SelectFilterEvent {
  value: string;
  originalEvent?: Event;
}

export interface SelectProps<T = any> {
  modelValue?: T | null;
  options?: readonly any[];
  optionLabel?: SelectOptionAccessor<any, string>;
  optionValue?: SelectOptionAccessor<any, any>;
  optionDisabled?: SelectOptionAccessor<any, boolean>;
  placeholder?: string;
  filter?: boolean;
  filterPlaceholder?: string;
  showClear?: boolean;
  allowEmpty?: boolean;
  editable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  fluid?: boolean;
  size?: SelectSize;
  inputId?: string;
  id?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  emptyMessage?: string;
  scrollHeight?: string;
  overlayStyle?: string | CSSProperties | Record<string, any>;
  appendTo?: string | HTMLElement;
}
