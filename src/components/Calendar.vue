<script setup lang="ts">
import { computed, ref, useAttrs, watch, type CSSProperties } from "vue";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { areaDurationMs } from "../lib/area-transition";
import { uiMessages, type UiLocaleSource } from "../locale/index.js";
import type {
  CalendarFirstDayOfWeek,
  CalendarModelValue,
  CalendarProps,
  CalendarSelectionMode,
  CalendarVariant,
  CalendarViewRange,
} from "./calendar";

export type {
  CalendarFirstDayOfWeek,
  CalendarModelValue,
  CalendarProps,
  CalendarSelectionMode,
  CalendarVariant,
  CalendarViewRange,
};

defineOptions({
  name: "MwCalendar",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<CalendarProps>(), {
  modelValue: undefined,
  selected: undefined,
  selectionMode: "single",
  minDate: null,
  maxDate: null,
  firstDayOfWeek: 1,
  days: undefined,
  onlySelectableWithDays: false,
  showTodayShortcut: true,
  variant: "card",
  fluid: false,
  disabled: false,
  readonly: false,
  locale: undefined,
  hours: 0,
  minutes: 0,
  id: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: Date | Array<Date | null> | null];
  "update:selected": [value: string | null];
  "date-select": [value: Date];
  select: [isoDate: string];
  view: [range: CalendarViewRange];
}>();

const attrs = useAttrs();

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toIsoDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseDateValue(val: unknown): Date | null {
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
      const candidate = new Date(y, m, d, props.hours, props.minutes, 0, 0);
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

const resolvedLocale = computed<string>(() => {
  if (props.locale) {
    return props.locale.toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
  }
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang?.toLowerCase() ?? "";
    if (htmlLang.startsWith("en")) return "en-US";
  }
  return "zh-CN";
});

const localeKey = computed<UiLocaleSource>(() =>
  resolvedLocale.value.startsWith("en") ? "en-US" : "zh-CN",
);

const copy = computed(() => uiMessages[localeKey.value].common.calendar);

const now = new Date();
const todayYear = now.getFullYear();
const todayMonth = now.getMonth();
const todayDate = now.getDate();

const viewYear = ref<number>(todayYear);
const viewMonth = ref<number>(todayMonth);
const pickerYear = ref<number>(todayYear);
const switcherOpen = ref<boolean>(false);

function resolvePrimarySelectedDate(): Date | null {
  if (props.selected) {
    const fromSelected = parseDateValue(props.selected);
    if (fromSelected) return fromSelected;
  }
  if (Array.isArray(props.modelValue)) {
    return parseDateValue(props.modelValue[0]) ?? parseDateValue(props.modelValue[1]);
  }
  return parseDateValue(props.modelValue);
}

function syncViewFromProps(): void {
  const primary = resolvePrimarySelectedDate();
  if (primary) {
    viewYear.value = primary.getFullYear();
    viewMonth.value = primary.getMonth();
    pickerYear.value = primary.getFullYear();
  }
}

syncViewFromProps();

watch(
  () => [props.modelValue, props.selected],
  () => {
    syncViewFromProps();
  },
  { deep: true },
);

const isCurrentMonth = computed<boolean>(
  () => viewYear.value === todayYear && viewMonth.value === todayMonth,
);

const monthLabel = computed<string>(() => {
  const date = new Date(viewYear.value, viewMonth.value, 1);
  return new Intl.DateTimeFormat(resolvedLocale.value, {
    year: "numeric",
    month: "long",
  }).format(date);
});

const yearLabel = computed<string>(() => {
  const date = new Date(pickerYear.value, 0, 1);
  return new Intl.DateTimeFormat(resolvedLocale.value, {
    year: "numeric",
  }).format(date);
});

const monthNames = computed<string[]>(() =>
  Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(resolvedLocale.value, { month: "short" }).format(
      new Date(2000, i, 1),
    ),
  ),
);

const weekdayLabels = computed<string[]>(() => {
  const zhWeekdaysSun = ["日", "一", "二", "三", "四", "五", "六"];
  const enWeekdaysSun = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const base = localeKey.value === "en-US" ? enWeekdaysSun : zhWeekdaysSun;
  if (props.firstDayOfWeek === 1) {
    return [...base.slice(1), base[0]!];
  }
  return base;
});

function startOfDayTime(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isSameCalendarDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateOutOfBounds(d: Date): boolean {
  const dayTime = startOfDayTime(d);
  if (props.minDate instanceof Date && !Number.isNaN(props.minDate.getTime())) {
    if (dayTime < startOfDayTime(props.minDate)) return true;
  }
  if (props.maxDate instanceof Date && !Number.isNaN(props.maxDate.getTime())) {
    if (dayTime > startOfDayTime(props.maxDate)) return true;
  }
  return false;
}

function isDateSelected(d: Date, isoKey: string): boolean {
  if (props.selected !== undefined && props.selected !== null) {
    return props.selected === isoKey;
  }
  if (Array.isArray(props.modelValue)) {
    if (props.selectionMode === "range") {
      const start = parseDateValue(props.modelValue[0]);
      const end = parseDateValue(props.modelValue[1]);
      return isSameCalendarDay(d, start) || isSameCalendarDay(d, end);
    }
    return props.modelValue.some((item) => isSameCalendarDay(d, parseDateValue(item)));
  }
  return isSameCalendarDay(d, parseDateValue(props.modelValue));
}

function isDateInRange(d: Date): boolean {
  if (props.selectionMode !== "range" || !Array.isArray(props.modelValue)) return false;
  const start = parseDateValue(props.modelValue[0]);
  const end = parseDateValue(props.modelValue[1]);
  if (!start || !end) return false;
  const t = startOfDayTime(d);
  return t > startOfDayTime(start) && t < startOfDayTime(end);
}

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

const calendarWeeks = computed<CalendarCell[][]>(() => {
  const year = viewYear.value;
  const month = viewMonth.value;
  const firstOfMonth = new Date(year, month, 1);
  const firstDow = firstOfMonth.getDay();
  const offset =
    props.firstDayOfWeek === 1 ? (firstDow + 6) % 7 : firstDow;
  const gridStart = new Date(year, month, 1 - offset);
  const todayObj = new Date(todayYear, todayMonth, todayDate);

  const weeks: CalendarCell[][] = [];
  const cursor = new Date(gridStart.getTime());

  for (let w = 0; w < 6; w += 1) {
    const row: CalendarCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const cellDate = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
        props.hours,
        props.minutes,
        0,
        0,
      );
      const otherMonth = cellDate.getMonth() !== month;
      const isoDate = toIsoDateKey(cellDate);
      const count = !otherMonth && props.days ? (props.days[isoDate] ?? 0) : 0;
      const heat: 0 | 1 | 2 = count >= 2 ? 2 : count === 1 ? 1 : 0;
      const outOfBounds = isDateOutOfBounds(cellDate);
      const blockedByDays = props.onlySelectableWithDays && (otherMonth || count <= 0);
      const disabled = Boolean(props.disabled || outOfBounds || blockedByDays);
      const interactive = !disabled && !props.readonly;

      row.push({
        date: cellDate,
        day: cellDate.getDate(),
        isoDate,
        otherMonth,
        today: isSameCalendarDay(cellDate, todayObj),
        selected: !otherMonth && isDateSelected(cellDate, isoDate),
        inRange: !otherMonth && isDateInRange(cellDate),
        disabled,
        interactive,
        count,
        heat,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
});

function emitViewRange(): void {
  const from = new Date(viewYear.value, viewMonth.value, 1);
  const until = new Date(viewYear.value, viewMonth.value + 1, 1);
  emit("view", {
    from: from.toISOString(),
    until: until.toISOString(),
    year: viewYear.value,
    month: viewMonth.value + 1,
  });
}

function prevMonth(): void {
  if (props.disabled) return;
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value -= 1;
  } else {
    viewMonth.value -= 1;
  }
  pickerYear.value = viewYear.value;
  emitViewRange();
}

function nextMonth(): void {
  if (props.disabled) return;
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value += 1;
  } else {
    viewMonth.value += 1;
  }
  pickerYear.value = viewYear.value;
  emitViewRange();
}

function backToToday(): void {
  if (props.disabled) return;
  viewYear.value = todayYear;
  viewMonth.value = todayMonth;
  pickerYear.value = todayYear;
  switcherOpen.value = false;
  emitViewRange();
}

function toggleSwitcher(): void {
  if (props.disabled) return;
  pickerYear.value = viewYear.value;
  switcherOpen.value = !switcherOpen.value;
}

function pickMonth(monthIndexZeroBased: number): void {
  if (props.disabled) return;
  viewYear.value = pickerYear.value;
  viewMonth.value = monthIndexZeroBased;
  switcherOpen.value = false;
  emitViewRange();
}

function setView(year: number, monthZeroBased: number): void {
  viewYear.value = year;
  viewMonth.value = monthZeroBased;
  pickerYear.value = year;
}

function onSelectDay(cell: CalendarCell): void {
  if (cell.disabled || props.disabled || props.readonly) return;
  const chosen = new Date(
    cell.date.getFullYear(),
    cell.date.getMonth(),
    cell.date.getDate(),
    props.hours,
    props.minutes,
    0,
    0,
  );

  if (cell.otherMonth) {
    viewYear.value = chosen.getFullYear();
    viewMonth.value = chosen.getMonth();
    pickerYear.value = chosen.getFullYear();
    emitViewRange();
  }

  emit("update:selected", cell.isoDate);
  emit("select", cell.isoDate);

  if (props.selectionMode === "range") {
    const current = Array.isArray(props.modelValue) ? props.modelValue : [];
    const start = parseDateValue(current[0]);
    const end = parseDateValue(current[1]);

    let nextRange: Array<Date | null>;
    if (!start || (start && end)) {
      nextRange = [chosen, null];
    } else if (chosen.getTime() < start.getTime()) {
      nextRange = [chosen, start];
    } else {
      nextRange = [start, chosen];
    }
    emit("update:modelValue", nextRange);
    emit("date-select", chosen);
    return;
  }

  if (props.selectionMode === "multiple") {
    const current = Array.isArray(props.modelValue)
      ? props.modelValue
          .map((d) => parseDateValue(d))
          .filter((d): d is Date => d !== null)
      : [];
    const existsIndex = current.findIndex((d) => isSameCalendarDay(d, chosen));
    const nextList =
      existsIndex >= 0
        ? current.filter((_, idx) => idx !== existsIndex)
        : [...current, chosen];
    emit("update:modelValue", nextList);
    emit("date-select", chosen);
    return;
  }

  emit("update:modelValue", chosen);
  emit("date-select", chosen);
}

const rootClasses = computed(() => [
  "mw-calendar",
  `mw-calendar--${props.variant}`,
  {
    "mw-calendar--fluid": props.fluid,
    "mw-calendar--disabled": props.disabled,
    "mw-calendar--has-days": Boolean(props.days),
  },
  attrs.class,
]);

const passthroughAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

defineExpose({
  setView,
  backToToday,
});
</script>

<template>
  <div
    v-bind="passthroughAttrs"
    :id="id"
    :class="rootClasses"
    :style="($attrs.style as CSSProperties)"
    :data-disabled="disabled ? '' : undefined"
    :aria-label="ariaLabel"
  >
    <div class="mw-calendar__header">
      <div class="mw-calendar__header-start">
        <button
          type="button"
          class="mw-calendar__switcher-btn"
          :disabled="disabled"
          :aria-expanded="switcherOpen ? 'true' : 'false'"
          @click="toggleSwitcher"
        >
          <span class="mw-calendar__month-label">{{ monthLabel }}</span>
          <ChevronDown
            :size="12"
            class="mw-calendar__switcher-chevron"
            :class="{ 'mw-calendar__switcher-chevron--open': switcherOpen }"
            aria-hidden="true"
          />
        </button>

        <button
          v-if="showTodayShortcut && !isCurrentMonth"
          type="button"
          class="mw-calendar__today-shortcut"
          :disabled="disabled"
          @click="backToToday"
        >
          {{ copy.backToToday }}
        </button>
      </div>

      <div class="mw-calendar__nav">
        <button
          type="button"
          class="mw-calendar__nav-btn"
          :disabled="disabled"
          :aria-label="copy.prevMonth"
          @click="prevMonth"
        >
          <ChevronLeft :size="14" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="mw-calendar__nav-btn"
          :disabled="disabled"
          :aria-label="copy.nextMonth"
          @click="nextMonth"
        >
          <ChevronRight :size="14" aria-hidden="true" />
        </button>
      </div>
    </div>

    <Transition name="mw-calendar-fade" :duration="areaDurationMs()">
      <div
        v-if="switcherOpen"
        class="mw-calendar__switcher mw-frost"
        role="region"
        :aria-label="yearLabel"
      >
        <div class="mw-calendar__switcher-head">
          <button
            type="button"
            class="mw-calendar__nav-btn"
            :aria-label="copy.prevYear"
            @click="pickerYear -= 1"
          >
            <ChevronLeft :size="14" aria-hidden="true" />
          </button>
          <span class="mw-calendar__switcher-year mw-tabular">{{ yearLabel }}</span>
          <button
            type="button"
            class="mw-calendar__nav-btn"
            :aria-label="copy.nextYear"
            @click="pickerYear += 1"
          >
            <ChevronRight :size="14" aria-hidden="true" />
          </button>
        </div>

        <div class="mw-calendar__month-grid">
          <button
            v-for="(name, idx) in monthNames"
            :key="idx"
            type="button"
            class="mw-calendar__month-option"
            :class="{
              'mw-calendar__month-option--active':
                idx === viewMonth && pickerYear === viewYear,
            }"
            :aria-pressed="idx === viewMonth && pickerYear === viewYear ? 'true' : 'false'"
            @click="pickMonth(idx)"
          >
            {{ name }}
          </button>
        </div>
      </div>
    </Transition>

    <div class="mw-calendar__weekdays" role="row">
      <span
        v-for="weekday in weekdayLabels"
        :key="weekday"
        role="columnheader"
        class="mw-calendar__weekday"
      >
        {{ weekday }}
      </span>
    </div>

    <div class="mw-calendar__body">
      <Transition name="mw-calendar-fade" :duration="areaDurationMs()">
        <div
          :key="`${viewYear}-${viewMonth}`"
          class="mw-calendar__grid"
          role="grid"
          :aria-label="monthLabel"
        >
          <template v-for="(week, wIdx) in calendarWeeks" :key="wIdx">
            <button
              v-for="cell in week"
              :key="cell.isoDate"
              type="button"
              class="mw-calendar__day mw-date-picker__day mw-tabular"
              :class="{
                'mw-calendar__day--other-month': cell.otherMonth,
                'mw-calendar__day--today': cell.today,
                'mw-calendar__day--selected': cell.selected,
                'mw-calendar__day--in-range': cell.inRange,
                'mw-calendar__day--heat-1': cell.heat === 1 && !cell.selected,
                'mw-calendar__day--heat-2': cell.heat === 2 && !cell.selected,
                'mw-calendar__day--disabled': cell.disabled,
                'mw-calendar__day--muted': !cell.otherMonth && days && cell.count === 0,
              }"
              :data-date="cell.isoDate"
              :data-count="!cell.otherMonth && cell.count > 0 ? cell.count : undefined"
              :data-heat="!cell.otherMonth && cell.heat > 0 ? cell.heat : undefined"
              :data-selected="cell.selected ? '' : undefined"
              :data-today="cell.today ? '' : undefined"
              :disabled="cell.disabled"
              :aria-selected="cell.selected ? 'true' : 'false'"
              :aria-disabled="cell.disabled ? 'true' : undefined"
              @click="onSelectDay(cell)"
            >
              {{ cell.day }}
            </button>
          </template>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style>
.mw-calendar {
  --mw-calendar-cell: var(--size-sm-h);
  --mw-calendar-gap: var(--space-1);
  --mw-calendar-pad: var(--space-3);
  --mw-calendar-width: calc(
    var(--mw-calendar-cell) * 7 + var(--mw-calendar-gap) * 6 + var(--mw-calendar-pad) * 2 +
      var(--border-width) * 2
  );
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: var(--mw-calendar-width);
  max-width: 100%;
  justify-self: start;
  user-select: none;
}

.mw-calendar--card {
  padding: var(--mw-calendar-pad);
  border-radius: var(--radius-card);
  border: var(--border-width) solid var(--border-subtle);
  background-color: var(--bg-raised);
}

.mw-calendar--plain {
  --mw-calendar-pad: var(--space-0);
  --mw-calendar-width: calc(var(--mw-calendar-cell) * 7 + var(--mw-calendar-gap) * 6);
  padding: var(--space-0);
  border: 0;
  background: transparent;
}

.mw-calendar--fluid {
  width: 100%;
  justify-self: stretch;
}

.mw-calendar--disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-1-5);
}

.mw-calendar__header-start {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1-5);
  min-width: 0;
}

.mw-calendar__switcher-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-0-5) var(--space-1-5);
  margin-inline-start: calc(var(--space-1-5) * -1);
  border: 0;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-calendar__switcher-btn:hover:not(:disabled) {
  background-color: var(--fill-default);
  color: var(--text-accent);
}

.mw-calendar__switcher-chevron {
  color: var(--text-tertiary);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.mw-calendar__switcher-chevron--open {
  transform: rotate(180deg);
}

.mw-calendar__today-shortcut {
  padding: var(--space-0-5) var(--space-1-5);
  border: 0;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--text-accent);
  font-family: var(--font-sans);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-calendar__today-shortcut:hover:not(:disabled) {
  background-color: var(--accent-subtle);
}

.mw-calendar__nav {
  display: inline-flex;
  align-items: center;
  gap: var(--space-0-5);
  flex-shrink: 0;
}

.mw-calendar__nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-xs-h);
  height: var(--size-xs-h);
  border: 0;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-calendar__nav-btn:hover:not(:disabled) {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-calendar__switcher {
  position: absolute;
  inset-inline: var(--space-2);
  top: calc(var(--size-sm-h) + var(--space-3));
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2-5);
  border-radius: var(--radius-float);
}

.mw-calendar--plain .mw-calendar__switcher {
  inset-inline: var(--space-0);
  top: calc(var(--size-sm-h) + var(--space-1));
}

.mw-calendar__switcher-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.mw-calendar__switcher-year {
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.mw-calendar__month-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-1);
}

.mw-calendar__month-option {
  padding: var(--space-1-5) var(--space-1);
  border: 0;
  border-radius: var(--radius-item);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-calendar__month-option:hover:not(.mw-calendar__month-option--active) {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-calendar__month-option--active {
  background-color: var(--accent);
  color: var(--text-on-accent);
  font-weight: var(--weight-semibold);
}

.mw-calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--mw-calendar-gap);
  text-align: center;
}

.mw-calendar__weekday {
  padding: var(--space-0-5) var(--space-0);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
}

.mw-calendar__body {
  position: relative;
}

.mw-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--mw-calendar-gap);
}

.mw-calendar__day {
  width: 100%;
  min-height: var(--mw-calendar-cell);
  aspect-ratio: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-0);
  border: 0;
  border-radius: var(--radius-item);
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-calendar__day:hover:not(:disabled):not(.mw-calendar__day--selected):not(.mw-calendar__day--heat-1):not(.mw-calendar__day--heat-2) {
  background-color: var(--fill-default);
}

.mw-calendar__day--muted {
  color: var(--text-secondary);
}

.mw-calendar__day--other-month {
  color: var(--text-disabled);
}

.mw-calendar__day--today:not(.mw-calendar__day--selected) {
  font-weight: var(--weight-semibold);
  box-shadow: inset 0 0 0 var(--border-width) var(--accent-border);
  color: var(--text-accent);
}

.mw-calendar__day--in-range {
  background-color: var(--fill-selected);
}

.mw-calendar__day--heat-1 {
  background-color: var(--accent-subtle);
  color: var(--text-accent);
  font-weight: var(--weight-semibold);
}

.mw-calendar__day--heat-1:hover:not(:disabled) {
  background-color: var(--accent-subtle-hover);
}

.mw-calendar__day--heat-2 {
  background-color: var(--accent);
  color: var(--text-on-accent);
  font-weight: var(--weight-semibold);
}

.mw-calendar__day--heat-2:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.mw-calendar__day--selected,
.mw-calendar__day--selected:hover:not(:disabled) {
  background-color: var(--accent);
  color: var(--text-on-accent);
  font-weight: var(--weight-semibold);
}

.mw-calendar--has-days .mw-calendar__day--selected,
.mw-calendar--has-days .mw-calendar__day--selected:hover:not(:disabled) {
  background-color: var(--accent-pressed);
  color: var(--text-on-accent);
}

.mw-calendar__day--disabled {
  cursor: not-allowed;
}

.mw-calendar:not(.mw-calendar--has-days) .mw-calendar__day--disabled {
  opacity: var(--opacity-disabled);
}

.mw-calendar--has-days .mw-calendar__day--disabled {
  cursor: default;
}

.mw-calendar__body > .mw-calendar-fade-leave-active {
  position: absolute;
  inset-inline: 0;
  top: 0;
}

.mw-calendar-fade-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-enter),
    transform var(--duration-base) var(--ease-enter);
}

.mw-calendar-fade-leave-active {
  pointer-events: none;
  transition:
    opacity var(--duration-base) var(--ease-exit),
    transform var(--duration-base) var(--ease-exit);
}

.mw-calendar-fade-enter-from {
  opacity: 0;
  transform: translateY(var(--motion-enter-offset));
}

.mw-calendar-fade-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--motion-enter-offset) * -1));
}

@media (prefers-reduced-motion: reduce) {
  .mw-calendar__switcher-btn,
  .mw-calendar__switcher-chevron,
  .mw-calendar__today-shortcut,
  .mw-calendar__nav-btn,
  .mw-calendar__month-option,
  .mw-calendar__day,
  .mw-calendar-fade-enter-active,
  .mw-calendar-fade-leave-active {
    transition: none;
  }
}
</style>
