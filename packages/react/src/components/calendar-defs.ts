import type { HTMLAttributes, Ref } from "react";
import type {
  CalendarFirstDayOfWeek,
  CalendarModelValue,
  CalendarSelectionMode,
  CalendarVariant,
  CalendarViewRange,
} from "@mango-write/ui-core/defs";
import type { CalendarCell } from "@mango-write/ui-core/headless/calendar-grid";

export type {
  CalendarCell,
  CalendarFirstDayOfWeek,
  CalendarModelValue,
  CalendarSelectionMode,
  CalendarVariant,
  CalendarViewRange,
};

export type CalendarOutputValue = Date | Array<Date | null> | null;

export interface CalendarHandle {
  setView: (year: number, monthZeroBased: number) => void;
  backToToday: () => void;
}

export interface CalendarProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange" | "onSelect"
  > {
  value?: CalendarModelValue;
  modelValue?: CalendarModelValue;
  defaultValue?: CalendarModelValue;
  onValueChange?: (value: CalendarOutputValue) => void;
  onChange?: (value: CalendarOutputValue) => void;
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (isoDate: string | null) => void;
  onSelect?: (isoDate: string) => void;
  onDateSelect?: (date: Date) => void;
  onView?: (range: CalendarViewRange) => void;
  selectionMode?: CalendarSelectionMode;
  minDate?: Date | null;
  maxDate?: Date | null;
  firstDayOfWeek?: CalendarFirstDayOfWeek;
  days?: Record<string, number>;
  counts?: Record<string, number>;
  onlySelectableWithDays?: boolean;
  showTodayShortcut?: boolean;
  variant?: CalendarVariant;
  fluid?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  readOnly?: boolean;
  locale?: string;
  hours?: number;
  minutes?: number;
  id?: string;
  ariaLabel?: string;
  calendarRef?: Ref<CalendarHandle>;
}
