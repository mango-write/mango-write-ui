export type MultiSelectSize = "sm" | "md" | "lg" | "small" | "large";

export type MultiSelectDisplay = "comma" | "chip";

export type MultiSelectOptionAccessor<T = any, R = any> = string | ((option: T) => R);

export interface MultiSelectChangeEvent<T = any> {
  originalEvent: Event;
  value: T[];
}

export interface MultiSelectProps<T = any> {
  modelValue?: T[] | null;
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
  required?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  size?: MultiSelectSize;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  inputId?: string;
  id?: string;
  scrollHeight?: string;
}
