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
