export type ColorPickerFormat = "hex" | "rgb" | "hsb";

export interface ColorPickerChangeEvent {
  originalEvent: Event;
  value: string;
}

export interface ColorPickerProps {
  modelValue?: string;
  defaultColor?: string;
  inline?: boolean;
  disabled?: boolean;
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

export interface ColorPickerEmits {
  "update:modelValue": [value: string];
  change: [event: ColorPickerChangeEvent];
}
