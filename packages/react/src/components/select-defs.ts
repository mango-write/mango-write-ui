import type { CSSProperties, HTMLAttributes, MouseEvent, ReactNode } from "react";

export type SelectSize = "xs" | "sm" | "md" | "lg" | "small" | "large";

export type SelectOptionAccessor<T = any, R = any> = string | ((option: T) => R);

export interface SelectChangeEvent<T = any> {
  value: T;
  originalEvent?: Event;
}

export interface SelectFilterEvent {
  value: string;
  originalEvent?: Event;
}

export interface SelectValueSlotProps<T = any> {
  value: T | null;
  option: any;
  placeholder?: string;
  label: string;
}

export interface SelectOptionSlotProps<TOption = any> {
  option: TOption;
  index: number;
  selected: boolean;
  disabled: boolean;
  label: string;
}

export interface SelectProps<T = any>
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: T | null;
  modelValue?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T | null) => void;
  onChange?: (event: SelectChangeEvent<T | null>) => void;
  onFilter?: (event: SelectFilterEvent) => void;
  onBeforeShow?: () => void;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  fluid?: boolean;
  size?: SelectSize;
  inputId?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  emptyMessage?: string;
  scrollHeight?: string;
  overlayStyle?: CSSProperties;
  appendTo?: "body" | "self" | HTMLElement | null;
  header?: ReactNode;
  empty?: ReactNode;
  renderValue?: (props: SelectValueSlotProps<T>) => ReactNode;
  renderOption?: (props: SelectOptionSlotProps) => ReactNode;
}
