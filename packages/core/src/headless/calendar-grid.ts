import type { CalendarFirstDayOfWeek, CalendarModelValue, CalendarSelectionMode } from "../defs/index.js";

export interface CalendarCell {
  date: Date;
  day: number;
  isoDate: string;
  otherMonth: boolean;
  today: boolean;
  selected: boolean;
  inRange: boolean;
  disabled: boolean;
  interactive: boolean;
  count: number;
  heat: 0 | 1 | 2;
}

export interface CalendarGridOptions {
  year: number;
  month: number;
  today?: Date;
  firstDayOfWeek?: CalendarFirstDayOfWeek;
  selectionMode?: CalendarSelectionMode;
  modelValue?: CalendarModelValue;
  selected?: string | null;
  minDate?: Date | null;
  maxDate?: Date | null;
  days?: Record<string, number>;
  onlySelectableWithDays?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hours?: number;
  minutes?: number;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toIsoDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function startOfDayTime(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function isSameCalendarDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseDateValue(val: unknown, hours = 0, minutes = 0): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return Number.isNaN(val.getTime()) ? null : new Date(val.getTime());
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(trimmed);
    if (isoMatch) {
      const y = Number(isoMatch[1]);
      const m = Number(isoMatch[2]) - 1;
      const d = Number(isoMatch[3]);
      const candidate = new Date(y, m, d, hours, minutes, 0, 0);
      if (
        candidate.getFullYear() === y &&
        candidate.getMonth() === m &&
        candidate.getDate() === d
      ) {
        return candidate;
      }
      return null;
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function isDateOutOfBounds(
  d: Date,
  minDate?: Date | null,
  maxDate?: Date | null,
): boolean {
  const dayTime = startOfDayTime(d);
  if (minDate instanceof Date && !Number.isNaN(minDate.getTime())) {
    if (dayTime < startOfDayTime(minDate)) return true;
  }
  if (maxDate instanceof Date && !Number.isNaN(maxDate.getTime())) {
    if (dayTime > startOfDayTime(maxDate)) return true;
  }
  return false;
}

export function getWeekdayLabels(
  locale: "zh-CN" | "en-US",
  firstDayOfWeek: CalendarFirstDayOfWeek = 1,
): string[] {
  const zhWeekdaysSun = ["日", "一", "二", "三", "四", "五", "六"];
  const enWeekdaysSun = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const base = locale === "en-US" ? enWeekdaysSun : zhWeekdaysSun;
  if (firstDayOfWeek === 1) {
    return [...base.slice(1), base[0]!];
  }
  return base;
}

export function buildCalendarWeeks(options: CalendarGridOptions): CalendarCell[][] {
  const {
    year,
    month,
    today = new Date(),
    firstDayOfWeek = 1,
    selectionMode = "single",
    modelValue,
    selected,
    minDate = null,
    maxDate = null,
    days,
    onlySelectableWithDays = false,
    disabled = false,
    readonly = false,
    hours = 0,
    minutes = 0,
  } = options;

  const firstOfMonth = new Date(year, month, 1);
  const firstDow = firstOfMonth.getDay();
  const offset = firstDayOfWeek === 1 ? (firstDow + 6) % 7 : firstDow;
  const gridStart = new Date(year, month, 1 - offset);
  const todayObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const checkSelected = (d: Date, isoKey: string): boolean => {
    if (selected !== undefined && selected !== null) {
      return selected === isoKey;
    }
    if (Array.isArray(modelValue)) {
      if (selectionMode === "range") {
        const start = parseDateValue(modelValue[0], hours, minutes);
        const end = parseDateValue(modelValue[1], hours, minutes);
        return isSameCalendarDay(d, start) || isSameCalendarDay(d, end);
      }
      return modelValue.some((item) =>
        isSameCalendarDay(d, parseDateValue(item, hours, minutes)),
      );
    }
    return isSameCalendarDay(d, parseDateValue(modelValue, hours, minutes));
  };

  const checkInRange = (d: Date): boolean => {
    if (selectionMode !== "range" || !Array.isArray(modelValue)) return false;
    const start = parseDateValue(modelValue[0], hours, minutes);
    const end = parseDateValue(modelValue[1], hours, minutes);
    if (!start || !end) return false;
    const t = startOfDayTime(d);
    return t > startOfDayTime(start) && t < startOfDayTime(end);
  };

  const weeks: CalendarCell[][] = [];
  const cursor = new Date(gridStart.getTime());

  for (let w = 0; w < 6; w += 1) {
    const row: CalendarCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const cellDate = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
        hours,
        minutes,
        0,
        0,
      );
      const otherMonth = cellDate.getMonth() !== month;
      const isoDate = toIsoDateKey(cellDate);
      const count = !otherMonth && days ? (days[isoDate] ?? 0) : 0;
      const heat: 0 | 1 | 2 = count >= 2 ? 2 : count === 1 ? 1 : 0;
      const outOfBounds = isDateOutOfBounds(cellDate, minDate, maxDate);
      const blockedByDays = onlySelectableWithDays && (otherMonth || count <= 0);
      const cellDisabled = Boolean(disabled || outOfBounds || blockedByDays);
      const interactive = !cellDisabled && !readonly;

      row.push({
        date: cellDate,
        day: cellDate.getDate(),
        isoDate,
        otherMonth,
        today: isSameCalendarDay(cellDate, todayObj),
        selected: !otherMonth && checkSelected(cellDate, isoDate),
        inRange: !otherMonth && checkInRange(cellDate),
        disabled: cellDisabled,
        interactive,
        count,
        heat,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
}
