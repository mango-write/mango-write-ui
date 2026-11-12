import type { HTMLAttributes, ReactNode } from "react";

export type MultiSelectSize = "sm" | "md" | "lg" | "small" | "large";

export type MultiSelectDisplay = "comma" | "chip";

export type MultiSelectOptionAccessor<T = any, R = any> =
  | string
  | ((option: T) => R);

export interface MultiSelectChangeEvent<T = any> {
  originalEvent: Event;
  value: T[];
}

export interface MultiSelectValueSlotProps<T = any> {
  value: T[];
  placeholder?: string;
}

export interface MultiSelectOptionSlotProps<TOption = any> {
  option: TOption;
  index: number;
  selected: boolean;
  disabled: boolean;
  label: string;
}

export interface MultiSelectProps<T = any>
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: T[] | null;
  modelValue?: T[] | null;
  defaultValue?: T[] | null;
  onValueChange?: (value: T[]) => void;
  onChange?: (event: MultiSelectChangeEvent<T>) => void;
  onShow?: () => void;
  onHide?: () => void;
  options?: readonly any[];
  optionLabel?: MultiSelectOptionAccessor<any, string>;
  optionValue?: MultiSelectOptionAccessor<any, unknown>;
  optionDisabled?: MultiSelectOptionAccessor<any, boolean>;
  placeholder?: string;
  display?: MultiSelectDisplay;
  maxSelectedLabels?: number;
  selectedItemsLabel?: string;
  filter?: boolean;
  filterPlaceholder?: string;
  emptyMessage?: string;
  emptyFilterMessage?: string;
  showClear?: boolean;
  showToggleAll?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  size?: MultiSelectSize;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  inputId?: string;
  id?: string;
  name?: string;
  scrollHeight?: string;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  renderValue?: (props: MultiSelectValueSlotProps<T>) => ReactNode;
  renderOption?: (props: MultiSelectOptionSlotProps) => ReactNode;
}
