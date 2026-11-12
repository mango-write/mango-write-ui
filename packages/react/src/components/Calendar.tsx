import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import {
  buildCalendarWeeks,
  getWeekdayLabels,
  isSameCalendarDay,
  parseDateValue as parseCoreDateValue,
  type CalendarCell,
} from "@mango-write/ui-core/headless/calendar-grid";
import { uiMessages, useUiLocale, type UiLocaleSource } from "../locale";
import type {
  CalendarFirstDayOfWeek,
  CalendarHandle,
  CalendarModelValue,
  CalendarOutputValue,
  CalendarProps,
  CalendarSelectionMode,
  CalendarVariant,
  CalendarViewRange,
} from "./calendar-defs";

export type {
  CalendarCell,
  CalendarFirstDayOfWeek,
  CalendarHandle,
  CalendarModelValue,
  CalendarOutputValue,
  CalendarProps,
  CalendarSelectionMode,
  CalendarVariant,
  CalendarViewRange,
};

function setMergedRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function resolvePrimaryDate(
  modelValue: CalendarModelValue | undefined,
  selected: string | null | undefined,
  hours: number,
  minutes: number,
): Date | null {
  if (selected) {
    const fromSelected = parseCoreDateValue(selected, hours, minutes);
    if (fromSelected) return fromSelected;
  }
  if (Array.isArray(modelValue)) {
    return (
      parseCoreDateValue(modelValue[0], hours, minutes) ??
      parseCoreDateValue(modelValue[1], hours, minutes)
    );
  }
  return parseCoreDateValue(modelValue, hours, minutes);
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function MwCalendar(props, forwardedRef) {
    const {
      value: valueProp,
      modelValue,
      defaultValue,
      onValueChange,
      onChange,
      selected: selectedProp,
      defaultSelected = null,
      onSelectedChange,
      onSelect,
      onDateSelect,
      onView,
      selectionMode = "single",
      minDate = null,
      maxDate = null,
      firstDayOfWeek = 1,
      days,
      counts,
      onlySelectableWithDays = false,
      showTodayShortcut = true,
      variant = "card",
      fluid = false,
      disabled = false,
      readonly: readonlyProp = false,
      readOnly = false,
      locale: localeProp,
      hours = 0,
      minutes = 0,
      id,
      ariaLabel,
      calendarRef,
      className,
      style,
      ...restAttrs
    } = props;

    const isReadonly = Boolean(readonlyProp || readOnly);
    const effectiveDays = days ?? counts;
    const { locale: contextLocale } = useUiLocale();

    const isValueControlled =
      valueProp !== undefined || modelValue !== undefined;
    const controlledValue = valueProp !== undefined ? valueProp : modelValue;
    const [uncontrolledValue, setUncontrolledValue] =
      useState<CalendarModelValue>(() => defaultValue ?? null);
    const currentModelValue = isValueControlled
      ? controlledValue
      : uncontrolledValue;

    const isSelectedControlled = selectedProp !== undefined;
    const [uncontrolledSelected, setUncontrolledSelected] = useState<
      string | null
    >(() => defaultSelected);
    const currentSelected = isSelectedControlled
      ? selectedProp
      : uncontrolledSelected;

    const resolvedLocale = useMemo<UiLocaleSource>(() => {
      if (localeProp) {
        return localeProp.toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
      }
      if (typeof document !== "undefined") {
        const htmlLang = document.documentElement.lang?.toLowerCase() ?? "";
        if (htmlLang.startsWith("en")) return "en-US";
      }
      return contextLocale;
    }, [localeProp, contextLocale]);

    const copy = uiMessages[resolvedLocale].common.calendar;

    const nowRef = useRef<Date | null>(null);
    if (!nowRef.current) {
      nowRef.current = new Date();
    }
    const todayYear = nowRef.current.getFullYear();
    const todayMonth = nowRef.current.getMonth();
    const todayDate = nowRef.current.getDate();

    const initialPrimary = resolvePrimaryDate(
      currentModelValue,
      currentSelected,
      hours,
      minutes,
    );

    const [viewYear, setViewYear] = useState<number>(
      () => initialPrimary?.getFullYear() ?? todayYear,
    );
    const [viewMonth, setViewMonth] = useState<number>(
      () => initialPrimary?.getMonth() ?? todayMonth,
    );
    const [pickerYear, setPickerYear] = useState<number>(
      () => initialPrimary?.getFullYear() ?? todayYear,
    );
    const [switcherOpen, setSwitcherOpen] = useState<boolean>(false);

    useEffect(() => {
      const primary = resolvePrimaryDate(
        currentModelValue,
        currentSelected,
        hours,
        minutes,
      );
      if (primary) {
        setViewYear(primary.getFullYear());
        setViewMonth(primary.getMonth());
        setPickerYear(primary.getFullYear());
      }
    }, [currentModelValue, currentSelected, hours, minutes]);

    const effectiveAriaLabel = ariaLabel ?? restAttrs["aria-label"];

    const isCurrentMonth = viewYear === todayYear && viewMonth === todayMonth;

    const monthLabel = useMemo(() => {
      const date = new Date(viewYear, viewMonth, 1);
      return new Intl.DateTimeFormat(resolvedLocale, {
        year: "numeric",
        month: "long",
      }).format(date);
    }, [viewYear, viewMonth, resolvedLocale]);

    const yearLabel = useMemo(() => {
      const date = new Date(pickerYear, 0, 1);
      return new Intl.DateTimeFormat(resolvedLocale, {
        year: "numeric",
      }).format(date);
    }, [pickerYear, resolvedLocale]);

    const monthNames = useMemo(
      () =>
        Array.from({ length: 12 }, (_, i) =>
          new Intl.DateTimeFormat(resolvedLocale, { month: "short" }).format(
            new Date(2000, i, 1),
          ),
        ),
      [resolvedLocale],
    );

    const weekdayLabels = useMemo(
      () => getWeekdayLabels(resolvedLocale, firstDayOfWeek),
      [resolvedLocale, firstDayOfWeek],
    );

    const calendarWeeks = useMemo<CalendarCell[][]>(
      () =>
        buildCalendarWeeks({
          year: viewYear,
          month: viewMonth,
          today: new Date(todayYear, todayMonth, todayDate),
          firstDayOfWeek,
          selectionMode,
          modelValue: currentModelValue,
          selected: currentSelected,
          minDate,
          maxDate,
          days: effectiveDays,
          onlySelectableWithDays,
          disabled,
          readonly: isReadonly,
          hours,
          minutes,
        }),
      [
        viewYear,
        viewMonth,
        todayYear,
        todayMonth,
        todayDate,
        firstDayOfWeek,
        selectionMode,
        currentModelValue,
        currentSelected,
        minDate,
        maxDate,
        effectiveDays,
        onlySelectableWithDays,
        disabled,
        isReadonly,
        hours,
        minutes,
      ],
    );

    const emitViewRange = useCallback(
      (nextYear: number, nextMonthZero: number) => {
        const from = new Date(nextYear, nextMonthZero, 1);
        const until = new Date(nextYear, nextMonthZero + 1, 1);
        onView?.({
          from: from.toISOString(),
          until: until.toISOString(),
          year: nextYear,
          month: nextMonthZero + 1,
        });
      },
      [onView],
    );

    const prevMonth = useCallback(() => {
      if (disabled) return;
      const nextYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const nextMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      setViewYear(nextYear);
      setViewMonth(nextMonth);
      setPickerYear(nextYear);
      emitViewRange(nextYear, nextMonth);
    }, [disabled, viewMonth, viewYear, emitViewRange]);

    const nextMonth = useCallback(() => {
      if (disabled) return;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      setViewYear(nextY);
      setViewMonth(nextM);
      setPickerYear(nextY);
      emitViewRange(nextY, nextM);
    }, [disabled, viewMonth, viewYear, emitViewRange]);

    const backToToday = useCallback(() => {
      if (disabled) return;
      setViewYear(todayYear);
      setViewMonth(todayMonth);
      setPickerYear(todayYear);
      setSwitcherOpen(false);
      emitViewRange(todayYear, todayMonth);
    }, [disabled, todayYear, todayMonth, emitViewRange]);

    const setView = useCallback((year: number, monthZeroBased: number) => {
      setViewYear(year);
      setViewMonth(monthZeroBased);
      setPickerYear(year);
    }, []);

    useImperativeHandle(
      calendarRef,
      () => ({
        setView,
        backToToday,
      }),
      [setView, backToToday],
    );

    const toggleSwitcher = () => {
      if (disabled) return;
      setPickerYear(viewYear);
      setSwitcherOpen((prev) => !prev);
    };

    const pickMonth = (monthIndexZeroBased: number) => {
      if (disabled) return;
      setViewYear(pickerYear);
      setViewMonth(monthIndexZeroBased);
      setSwitcherOpen(false);
      emitViewRange(pickerYear, monthIndexZeroBased);
    };

    const commitModelOutput = (nextVal: CalendarOutputValue) => {
      if (!isValueControlled) {
        setUncontrolledValue(nextVal);
      }
      onValueChange?.(nextVal);
      onChange?.(nextVal);
    };

    const handleSelectDay = (cell: CalendarCell) => {
      if (cell.disabled || disabled || isReadonly) return;
      const chosen = new Date(
        cell.date.getFullYear(),
        cell.date.getMonth(),
        cell.date.getDate(),
        hours,
        minutes,
        0,
        0,
      );

      if (cell.otherMonth) {
        const y = chosen.getFullYear();
        const m = chosen.getMonth();
        setViewYear(y);
        setViewMonth(m);
        setPickerYear(y);
        emitViewRange(y, m);
      }

      if (!isSelectedControlled && selectedProp === undefined && defaultSelected !== null) {
        setUncontrolledSelected(cell.isoDate);
      }
      onSelectedChange?.(cell.isoDate);
      onSelect?.(cell.isoDate);

      if (selectionMode === "range") {
        const current = Array.isArray(currentModelValue)
          ? currentModelValue
          : [];
        const start = parseCoreDateValue(current[0], hours, minutes);
        const end = parseCoreDateValue(current[1], hours, minutes);

        let nextRange: Array<Date | null>;
        if (!start || (start && end)) {
          nextRange = [chosen, null];
        } else if (chosen.getTime() < start.getTime()) {
          nextRange = [chosen, start];
        } else {
          nextRange = [start, chosen];
        }
        commitModelOutput(nextRange);
        onDateSelect?.(chosen);
        return;
      }

      if (selectionMode === "multiple") {
        const current = Array.isArray(currentModelValue)
          ? currentModelValue
              .map((d) => parseCoreDateValue(d, hours, minutes))
              .filter((d): d is Date => d !== null)
          : [];
        const existsIndex = current.findIndex((d) =>
          isSameCalendarDay(d, chosen),
        );
        const nextList =
          existsIndex >= 0
            ? current.filter((_, idx) => idx !== existsIndex)
            : [...current, chosen];
        commitModelOutput(nextList);
        onDateSelect?.(chosen);
        return;
      }

      commitModelOutput(chosen);
      onDateSelect?.(chosen);
    };

    return (
      <div
        {...restAttrs}
        ref={(node) => setMergedRef(forwardedRef, node)}
        id={id}
        className={cx(
          "mw-calendar",
          `mw-calendar--${variant}`,
          fluid && "mw-calendar--fluid",
          disabled && "mw-calendar--disabled",
          Boolean(effectiveDays) && "mw-calendar--has-days",
          className,
        )}
        style={style}
        data-disabled={disabled ? "" : undefined}
        aria-label={effectiveAriaLabel}
      >
        <div className="mw-calendar__header">
          <div className="mw-calendar__header-start">
            <button
              type="button"
              className="mw-calendar__switcher-btn"
              disabled={disabled}
              aria-expanded={switcherOpen}
              onClick={toggleSwitcher}
            >
              <span className="mw-calendar__month-label">{monthLabel}</span>
              <ChevronDown
                size={12}
                className={cx(
                  "mw-calendar__switcher-chevron",
                  switcherOpen && "mw-calendar__switcher-chevron--open",
                )}
                aria-hidden="true"
              />
            </button>

            {showTodayShortcut && !isCurrentMonth && (
              <button
                type="button"
                className="mw-calendar__today-shortcut"
                disabled={disabled}
                onClick={backToToday}
              >
                {copy.backToToday}
              </button>
            )}
          </div>

          <div className="mw-calendar__nav">
            <button
              type="button"
              className="mw-calendar__nav-btn"
              disabled={disabled}
              aria-label={copy.prevMonth}
              onClick={prevMonth}
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="mw-calendar__nav-btn"
              disabled={disabled}
              aria-label={copy.nextMonth}
              onClick={nextMonth}
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        {switcherOpen && (
          <div
            className="mw-calendar__switcher mw-frost"
            role="region"
            aria-label={yearLabel}
          >
            <div className="mw-calendar__switcher-head">
              <button
                type="button"
                className="mw-calendar__nav-btn"
                aria-label={copy.prevYear}
                onClick={() => setPickerYear((y) => y - 1)}
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <span className="mw-calendar__switcher-year mw-tabular">
                {yearLabel}
              </span>
              <button
                type="button"
                className="mw-calendar__nav-btn"
                aria-label={copy.nextYear}
                onClick={() => setPickerYear((y) => y + 1)}
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="mw-calendar__month-grid">
              {monthNames.map((monthName, idx) => {
                const active = idx === viewMonth && pickerYear === viewYear;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={cx(
                      "mw-calendar__month-option",
                      active && "mw-calendar__month-option--active",
                    )}
                    aria-pressed={active}
                    onClick={() => pickMonth(idx)}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mw-calendar__weekdays" role="row">
          {weekdayLabels.map((weekday) => (
            <span
              key={weekday}
              role="columnheader"
              className="mw-calendar__weekday"
            >
              {weekday}
            </span>
          ))}
        </div>

        <div className="mw-calendar__body">
          <div
            key={`${viewYear}-${viewMonth}`}
            className="mw-calendar__grid"
            role="grid"
            aria-label={monthLabel}
          >
            {calendarWeeks.flatMap((week) =>
              week.map((cell) => (
                <button
                  key={cell.isoDate}
                  type="button"
                  className={cx(
                    "mw-calendar__day",
                    "mw-date-picker__day",
                    "mw-tabular",
                    cell.otherMonth && "mw-calendar__day--other-month",
                    cell.today && "mw-calendar__day--today",
                    cell.selected && "mw-calendar__day--selected",
                    cell.inRange && "mw-calendar__day--in-range",
                    cell.heat === 1 &&
                      !cell.selected &&
                      "mw-calendar__day--heat-1",
                    cell.heat === 2 &&
                      !cell.selected &&
                      "mw-calendar__day--heat-2",
                    cell.disabled && "mw-calendar__day--disabled",
                    !cell.otherMonth &&
                      Boolean(effectiveDays) &&
                      cell.count === 0 &&
                      "mw-calendar__day--muted",
                  )}
                  data-date={cell.isoDate}
                  data-count={
                    !cell.otherMonth && cell.count > 0 ? cell.count : undefined
                  }
                  data-heat={
                    !cell.otherMonth && cell.heat > 0 ? cell.heat : undefined
                  }
                  data-selected={cell.selected ? "" : undefined}
                  data-today={cell.today ? "" : undefined}
                  data-state={cell.selected ? "checked" : "unchecked"}
                  data-disabled={cell.disabled ? "" : undefined}
                  disabled={cell.disabled}
                  aria-selected={cell.selected}
                  aria-disabled={cell.disabled || undefined}
                  onClick={() => handleSelectDay(cell)}
                >
                  {cell.day}
                </button>
              )),
            )}
          </div>
        </div>
      </div>
    );
  },
);

Calendar.displayName = "MwCalendar";

export default Calendar;
