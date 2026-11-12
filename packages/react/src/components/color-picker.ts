import type { InputHTMLAttributes } from "react";

export type ColorPickerFormat = "hex" | "rgb" | "hsb";

export interface ColorPickerChangeEvent {
  originalEvent: Event;
  value: string;
}

export interface ColorPickerProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue" | "onChange"
  > {
  value?: string;
  defaultValue?: string;
  modelValue?: string;
  defaultColor?: string;
  onValueChange?: (value: string) => void;
  onChange?: (event: ColorPickerChangeEvent) => void;
  inline?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  format?: ColorPickerFormat;
  inputId?: string;
  id?: string;
  name?: string;
  tabindex?: number;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}
