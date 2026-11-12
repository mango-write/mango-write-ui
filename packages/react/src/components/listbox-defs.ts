import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type ListboxOptionAccessor<T = any, R = any> =
  | string
  | ((option: T) => R);

export interface ListboxChangeEvent<T = any> {
  originalEvent: Event;
  value: T;
}

export interface ListboxOptionSlotProps<TOption = any> {
  option: TOption;
  index: number;
  selected: boolean;
  disabled: boolean;
  label: string;
}

export interface ListboxProps<T = any>
  extends Omit<HTMLAttributes<HTMLUListElement>, "defaultValue" | "onChange"> {
  value?: T;
  modelValue?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  onChange?: (event: ListboxChangeEvent<T>) => void;
  options?: readonly any[];
  optionLabel?: ListboxOptionAccessor<any, string>;
  optionValue?: ListboxOptionAccessor<any, unknown>;
  optionDisabled?: ListboxOptionAccessor<any, boolean>;
  multiple?: boolean;
  filter?: boolean;
  filterPlaceholder?: string;
  emptyMessage?: string;
  emptyFilterMessage?: string;
  listStyle?: CSSProperties;
  disabled?: boolean;
  readonly?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  inputId?: string;
  id?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  renderOption?: (props: ListboxOptionSlotProps) => ReactNode;
}
