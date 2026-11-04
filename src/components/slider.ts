export type SliderValue = number | [number, number];

export type SliderOrientation = "horizontal" | "vertical";

export interface SliderSlideEndEvent {
  originalEvent: Event;
  value: SliderValue;
}

export interface SliderProps {
  modelValue?: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  orientation?: SliderOrientation;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  inputId?: string;
  id?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

export interface SliderEmits {
  "update:modelValue": [value: SliderValue];
  change: [value: SliderValue];
  slideend: [event: SliderSlideEndEvent];
}
