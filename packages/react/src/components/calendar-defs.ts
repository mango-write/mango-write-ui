import type { HTMLAttributes, ReactNode, Ref } from "react";
import type {
  CalendarCustomizationProps,
  CalendarFirstDayOfWeek,
  CalendarModelValue,
  CalendarMonthContext,
  CalendarNavigationContext,
  CalendarSelectionMode,
  CalendarTitleContext,
  CalendarVariant,
  CalendarViewRange,
} from "@mango-write/ui-core/defs";
import type { CalendarCell } from "@mango-write/ui-core/headless/calendar-grid";

export type {
  CalendarCell,
  CalendarFirstDayOfWeek,
  CalendarModelValue,
  CalendarMonthContext,
  CalendarNavigationContext,
  CalendarSelectionMode,
  CalendarTitleContext,
  CalendarVariant,
  CalendarViewRange,
};

export type CalendarOutputValue = Date | Array<Date | null> | null;

export interface CalendarHandle {
  setView: (year: number, monthZeroBased: number) => void;
  backToToday: () => void;
}

export interface CalendarProps
  extends CalendarCustomizationProps, Omit<
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
  onToday?: (date: Date) => void;
  selectionMode?: CalendarSelectionMode;
  minDate?: Date | null;
  maxDate?: Date | null;
  firstDayOfWeek?: CalendarFirstDayOfWeek;
  days?: Record<string, number>;
  counts?: Record<string, number>;
  onlySelectableWithDays?: boolean;
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
  renderTitle?: (context: CalendarTitleContext) => ReactNode;
  renderNavigation?: (context: CalendarNavigationContext) => ReactNode;
  renderWeekday?: (context: { label: string; index: number }) => ReactNode;
  renderDay?: (context: { cell: CalendarCell }) => ReactNode;
  renderMonth?: (context: CalendarMonthContext) => ReactNode;
  renderFooter?: (context: CalendarTitleContext) => ReactNode;
}
