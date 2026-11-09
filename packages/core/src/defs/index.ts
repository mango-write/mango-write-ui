export type AccordionPanelValue = string | number;
export type AccordionValue =
  | AccordionPanelValue
  | AccordionPanelValue[]
  | null
  | undefined;

export interface AsyncSearchOption {
  value: string;
  label: string;
  description?: string;
  avatar?: string | null;
}

export type ButtonSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "danger"
  | "contrast"
  | "help";

export type ButtonVariant = "filled" | "tinted" | "outlined" | "text" | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "small" | "large";

export type ButtonIconPosition = "left" | "right";

export type NativeButtonType = "button" | "submit" | "reset";

export function resolveButtonVariant(opts: {
  variant?: ButtonVariant;
  outlined?: boolean;
  text?: boolean;
}): ButtonVariant {
  if (opts.variant) return opts.variant;
  if (opts.outlined) return "outlined";
  if (opts.text) return "text";
  return "filled";
}

export function resolveButtonSize(size?: ButtonSize): "xs" | "sm" | "md" | "lg" {
  if (size === "small") return "sm";
  if (size === "large") return "lg";
  if (size === "xs" || size === "sm" || size === "md" || size === "lg") {
    return size;
  }
  return "md";
}

export function resolveButtonSeverity(
  severity?: ButtonSeverity,
): "primary" | "secondary" | "success" | "info" | "warn" | "danger" | "contrast" {
  if (!severity) return "primary";
  if (severity === "warning") return "warn";
  if (severity === "help") return "secondary";
  return severity;
}

export type CalendarSelectionMode = "single" | "range" | "multiple";

export type CalendarFirstDayOfWeek = 0 | 1;

export type CalendarVariant = "card" | "plain";

export type CalendarModelValue = Date | string | Array<Date | string | null> | null;

export interface CalendarViewRange {
  from: string;
  until: string;
  year: number;
  month: number;
}

export interface CalendarProps {
  modelValue?: CalendarModelValue;
  selected?: string | null;
  selectionMode?: CalendarSelectionMode;
  minDate?: Date | null;
  maxDate?: Date | null;
  firstDayOfWeek?: CalendarFirstDayOfWeek;
  days?: Record<string, number>;
  onlySelectableWithDays?: boolean;
  showTodayShortcut?: boolean;
  variant?: CalendarVariant;
  fluid?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  locale?: string;
  hours?: number;
  minutes?: number;
  id?: string;
  ariaLabel?: string;
}

export type DialogSize = "sm" | "md" | "lg" | "xl";

export type ListboxOptionAccessor<T = any, R = any> = string | ((option: T) => R);

export interface ListboxChangeEvent<T = any> {
  originalEvent: Event;
  value: T;
}

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

export type SkeletonShape = "rectangle" | "circle";
export type SkeletonAnimation = "wave" | "none";

export interface SkeletonProps {
  shape?: SkeletonShape;
  size?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  animation?: SkeletonAnimation;
}

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
  showTicks?: boolean;
}

export interface SliderEmits {
  "update:modelValue": [value: SliderValue];
  change: [value: SliderValue];
  slideend: [event: SliderSlideEndEvent];
}

export type TabValue = string | number;

export interface TabsProps {
  modelValue?: TabValue;
  value?: TabValue;
  defaultValue?: TabValue;
  orientation?: "horizontal" | "vertical";
  activationMode?: "automatic" | "manual";
  unmountOnHide?: boolean;
}

export interface TabsEmits {
  "update:modelValue": [value: TabValue];
  "update:value": [value: TabValue];
}

export interface TabListProps {
  loop?: boolean;
  hideWhenSingle?: boolean;
}

export interface TabProps {
  value: TabValue;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabPanelsProps {}

export interface TabPanelProps {
  value: TabValue;
  forceMount?: boolean;
}

export interface UserSelectOption extends Record<string, unknown> {
  id: string;
  name: string;
  avatar?: string | null;
  email?: string | null;
}
