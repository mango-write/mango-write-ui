import type { HTMLAttributes } from "react";
import type { CalendarFirstDayOfWeek } from "./calendar-defs";

export type DatePickerSelectionMode = "single" | "range" | "multiple";

export type DatePickerHourFormat = "12" | "24";

export type DatePickerSize = "sm" | "md" | "lg" | "small" | "large";

export type DatePickerMode = "date" | "datetime" | "time";

export type DatePickerModelValue =
  | Date
  | string
  | Array<Date | string | null>
  | null;

export type DatePickerOutputValue = Date | Array<Date | null> | null;

export interface DatePickerProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange" | "onSelect"
  > {
  value?: DatePickerModelValue;
  modelValue?: DatePickerModelValue;
  defaultValue?: DatePickerModelValue;
  onValueChange?: (value: DatePickerOutputValue) => void;
  onChange?: (value: DatePickerOutputValue) => void;
  onDateSelect?: (date: Date) => void;
  onClear?: () => void;
  onClearClick?: (event: MouseEvent) => void;
  onShow?: () => void;
  onHide?: () => void;
  selectionMode?: DatePickerSelectionMode;
  mode?: DatePickerMode;
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
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  size?: DatePickerSize;
  inputId?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  title?: string;
}
