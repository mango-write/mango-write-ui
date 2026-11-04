import type { CSSProperties } from "vue";

export type ListboxOptionAccessor<T = any, R = any> = string | ((option: T) => R);

export interface ListboxChangeEvent<T = any> {
  originalEvent: Event;
  value: T;
}

export interface ListboxProps<T = any> {
  modelValue?: T;
  options?: readonly any[];
  optionLabel?: ListboxOptionAccessor<any, string>;
  optionValue?: ListboxOptionAccessor<any, unknown>;
  optionDisabled?: ListboxOptionAccessor<any, boolean>;
  multiple?: boolean;
  filter?: boolean;
  filterPlaceholder?: string;
  emptyMessage?: string;
  emptyFilterMessage?: string;
  listStyle?: string | CSSProperties | Record<string, string>;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  inputId?: string;
  id?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}
