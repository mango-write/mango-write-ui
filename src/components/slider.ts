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
  /** 缺省为连续拖动（无级）；显式传入正数后拖动按刻度吸附，键盘亦按该步长增减 */
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
  /** 渲染每个 step 刻度位置的小节点；仅在显式传入有效 step > 0 时生效 */
  showTicks?: boolean;
}

export interface SliderEmits {
  "update:modelValue": [value: SliderValue];
  change: [value: SliderValue];
  slideend: [event: SliderSlideEndEvent];
}
