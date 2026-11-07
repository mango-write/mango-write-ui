import type { CalendarFirstDayOfWeek } from "./calendar-defs";

export type DatePickerSelectionMode = "single" | "range" | "multiple";

export type DatePickerHourFormat = "12" | "24";

export type DatePickerSize = "sm" | "md" | "lg" | "small" | "large";

export type DatePickerModelValue = Date | string | Array<Date | null> | null;

export interface DatePickerProps {
  modelValue?: DatePickerModelValue;
  selectionMode?: DatePickerSelectionMode;
  showTime?: boolean;
  timeOnly?: boolean;
  hourFormat?: DatePickerHourFormat;
  dateFormat?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  firstDayOfWeek?: CalendarFirstDayOfWeek;
  days?: Record<string, number>;
  locale?: string;
  showIcon?: boolean;
  showClear?: boolean;
  showButtonBar?: boolean;
  hideOnRangeSelection?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  size?: DatePickerSize;
  inputId?: string;
  id?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  title?: string;
}
