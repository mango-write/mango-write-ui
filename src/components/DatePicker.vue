<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, useId, watch } from "vue";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  X,
} from "lucide-vue-next";
import { useComboPanel } from "../lib/useComboPanel";
import { uiMessages } from "../locale/index.js";
import type {
  DatePickerHourFormat,
  DatePickerModelValue,
  DatePickerProps,
  DatePickerSelectionMode,
  DatePickerSize,
} from "./date-picker";

export type {
  DatePickerHourFormat,
  DatePickerModelValue,
  DatePickerProps,
  DatePickerSelectionMode,
  DatePickerSize,
};

defineOptions({
  name: "DatePicker",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DatePickerProps>(), {
  modelValue: null,
  selectionMode: "single",
  showTime: false,
  timeOnly: false,
  hourFormat: "24",
  dateFormat: "yy-mm-dd",
  minDate: null,
  maxDate: null,
  showIcon: false,
  showClear: false,
  showButtonBar: false,
  hideOnRangeSelection: false,
  placeholder: undefined,
  disabled: false,
  readonly: false,
  required: false,
  invalid: false,
  fluid: false,
  size: undefined,
  inputId: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  title: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: Date | Array<Date | null> | null];
  "date-select": [value: Date];
  clear: [];
  "clear-click": [event: Event];
  show: [];
  hide: [];
}>();

const attrs = useAttrs();
const uid = useId();
const panelId = computed(() => `${props.id || props.inputId || `mw-dp-${uid}`}-panel`);

const rootEl = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const focused = ref(false);

const normalizedSize = computed<"sm" | "md" | "lg">(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  return "md";
});

function toValidDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return Number.isNaN(val.getTime()) ? null : new Date(val.getTime());
  }
  if (typeof val === "string") {
    const parsed = parseSingleDateString(val);
    if (parsed) return parsed;
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toIsoDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatSingleDate(d: Date): string {
  if (props.timeOnly) {
    return formatTimePart(d);
  }
  const yyyy = String(d.getFullYear());
  const yy = yyyy.slice(-2);
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const fmt = props.dateFormat || "yy-mm-dd";
  // PrimeVue convention: "yy" = 4-digit year, "y" = 2-digit year; also support "yyyy"
  let datePart = fmt
    .replace(/yyyy/gi, yyyy)
    .replace(/yy/gi, yyyy)
    .replace(/\by\b/gi, yy)
    .replace(/mm/gi, mm)
    .replace(/dd/gi, dd);
  if (!datePart || datePart === fmt) {
    datePart = `${yyyy}-${mm}-${dd}`;
  }
  if (props.showTime) {
    return `${datePart} ${formatTimePart(d)}`;
  }
  return datePart;
}

function formatTimePart(d: Date): string {
  const h24 = d.getHours();
  const min = pad2(d.getMinutes());
  if (props.hourFormat === "12") {
    const suffix = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${pad2(h12)}:${min} ${suffix}`;
  }
  return `${pad2(h24)}:${min}`;
}

function formatModelValue(val: DatePickerModelValue | undefined): string {
  if (val == null || val === "") return "";
  if (Array.isArray(val)) {
    if (props.selectionMode === "range") {
      const start = toValidDate(val[0]);
      const end = toValidDate(val[1]);
      if (start && end) return `${formatSingleDate(start)} - ${formatSingleDate(end)}`;
      if (start) return formatSingleDate(start);
      return "";
    }
    const validDates = val.map((item) => toValidDate(item)).filter((d): d is Date => d !== null);
    return validDates.map((d) => formatSingleDate(d)).join(", ");
  }
  const single = toValidDate(val);
  return single ? formatSingleDate(single) : "";
}

const inputText = ref(formatModelValue(props.modelValue));

const currentHours = ref<number>(0);
const currentMinutes = ref<number>(0);
const viewYear = ref<number>(new Date().getFullYear());
const viewMonth = ref<number>(new Date().getMonth());

function syncViewAndTimeFromModel(val: DatePickerModelValue | undefined): void {
  let primary: Date | null = null;
  if (Array.isArray(val)) {
    primary = toValidDate(val[0]) ?? toValidDate(val[1]);
  } else {
    primary = toValidDate(val);
  }
  if (primary) {
    viewYear.value = primary.getFullYear();
    viewMonth.value = primary.getMonth();
    currentHours.value = primary.getHours();
    currentMinutes.value = primary.getMinutes();
  }
}

syncViewAndTimeFromModel(props.modelValue);

watch(
  () => [props.modelValue, props.dateFormat, props.showTime, props.timeOnly, props.hourFormat],
  () => {
    inputText.value = formatModelValue(props.modelValue);
    syncViewAndTimeFromModel(props.modelValue);
  },
  { deep: true },
);

const hasValue = computed<boolean>(() => {
  if (props.modelValue == null || props.modelValue === "") return false;
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.some((item) => toValidDate(item) !== null);
  }
  return toValidDate(props.modelValue) !== null;
});

const {
  open,
  panelStyle,
  openPanel: comboOpenPanel,
  closePanel: comboClosePanel,
  reposition,
} = useComboPanel(rootEl, panelEl);

watch(open, (isOpen, wasOpen) => {
  if (isOpen && !wasOpen) {
    emit("show");
  } else if (!isOpen && wasOpen) {
    emit("hide");
  }
});

function closePanel(): void {
  if (!open.value) return;
  comboClosePanel();
}

function openPanel(): void {
  if (props.disabled || props.readonly) return;
  if (open.value) return;
  syncViewAndTimeFromModel(props.modelValue);
  comboOpenPanel();
  void nextTick(() => {
    reposition();
  });
}

function togglePanel(): void {
  if (props.disabled || props.readonly) return;
  if (open.value) {
    closePanel();
  } else {
    openPanel();
  }
}

function startOfDayTime(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isDateDisabled(d: Date): boolean {
  if (props.disabled) return true;
  const dayTime = startOfDayTime(d);
  if (props.minDate instanceof Date && !Number.isNaN(props.minDate.getTime())) {
    if (dayTime < startOfDayTime(props.minDate)) return true;
  }
  if (props.maxDate instanceof Date && !Number.isNaN(props.maxDate.getTime())) {
    if (dayTime > startOfDayTime(props.maxDate)) return true;
  }
  return false;
}

function isSameCalendarDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateSelected(d: Date): boolean {
  if (Array.isArray(props.modelValue)) {
    if (props.selectionMode === "range") {
      const start = toValidDate(props.modelValue[0]);
      const end = toValidDate(props.modelValue[1]);
      return isSameCalendarDay(d, start) || isSameCalendarDay(d, end);
    }
    return props.modelValue.some((item) => isSameCalendarDay(d, toValidDate(item)));
  }
  return isSameCalendarDay(d, toValidDate(props.modelValue));
}

function isDateInRange(d: Date): boolean {
  if (props.selectionMode !== "range" || !Array.isArray(props.modelValue)) return false;
  const start = toValidDate(props.modelValue[0]);
  const end = toValidDate(props.modelValue[1]);
  if (!start || !end) return false;
  const t = startOfDayTime(d);
  return t > startOfDayTime(start) && t < startOfDayTime(end);
}

interface CalendarCell {
  date: Date;
  day: number;
  isoDate: string;
  otherMonth: boolean;
  today: boolean;
  selected: boolean;
  inRange: boolean;
  disabled: boolean;
}

const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];

const currentMonthLabel = computed<string>(() => `${viewMonth.value + 1}月`);

const currentYearLabel = computed<string>(() => `${viewYear.value}年`);

const calendarWeeks = computed<CalendarCell[][]>(() => {
  const year = viewYear.value;
  const month = viewMonth.value;
  const firstOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startDayOfWeek);
  const todayDate = new Date();

  const weeks: CalendarCell[][] = [];
  let cursor = new Date(gridStart.getTime());

  for (let w = 0; w < 6; w += 1) {
    const row: CalendarCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const cellDate = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
        props.showTime ? currentHours.value : 0,
        props.showTime ? currentMinutes.value : 0,
        0,
        0,
      );
      row.push({
        date: cellDate,
        day: cellDate.getDate(),
        isoDate: toIsoDateKey(cellDate),
        otherMonth: cellDate.getMonth() !== month,
        today: isSameCalendarDay(cellDate, todayDate),
        selected: isDateSelected(cellDate),
        inRange: isDateInRange(cellDate),
        disabled: isDateDisabled(cellDate),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
});

function prevMonth(): void {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value -= 1;
  } else {
    viewMonth.value -= 1;
  }
}

function nextMonth(): void {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value += 1;
  } else {
    viewMonth.value += 1;
  }
}

function buildDateWithTime(base: Date): Date {
  const d = new Date(base.getTime());
  if (props.showTime || props.timeOnly) {
    d.setHours(currentHours.value, currentMinutes.value, 0, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function onSelectDay(cell: CalendarCell): void {
  if (cell.disabled || props.disabled || props.readonly) return;
  const chosen = buildDateWithTime(cell.date);

  if (cell.otherMonth) {
    viewYear.value = chosen.getFullYear();
    viewMonth.value = chosen.getMonth();
  }

  if (props.selectionMode === "range") {
    const current = Array.isArray(props.modelValue) ? props.modelValue : [];
    const start = toValidDate(current[0]);
    const end = toValidDate(current[1]);

    let nextRange: Array<Date | null>;
    if (!start || (start && end)) {
      nextRange = [chosen, null];
    } else if (chosen.getTime() < start.getTime()) {
      nextRange = [chosen, start];
    } else {
      nextRange = [start, chosen];
    }
    inputText.value = formatModelValue(nextRange);
    emit("update:modelValue", nextRange);
    emit("date-select", chosen);
    if (nextRange[0] && nextRange[1] && props.hideOnRangeSelection && !props.showTime) {
      closePanel();
    }
    return;
  }

  if (props.selectionMode === "multiple") {
    const current = Array.isArray(props.modelValue)
      ? props.modelValue.map((d) => toValidDate(d)).filter((d): d is Date => d !== null)
      : [];
    const existsIndex = current.findIndex((d) => isSameCalendarDay(d, chosen));
    const nextList =
      existsIndex >= 0 ? current.filter((_, idx) => idx !== existsIndex) : [...current, chosen];
    inputText.value = formatModelValue(nextList);
    emit("update:modelValue", nextList);
    emit("date-select", chosen);
    return;
  }

  inputText.value = formatModelValue(chosen);
  emit("update:modelValue", chosen);
  emit("date-select", chosen);
  if (!props.showTime) {
    closePanel();
  }
}

function applyTimeChange(): void {
  if (props.disabled || props.readonly) return;
  if (props.selectionMode === "range" && Array.isArray(props.modelValue)) {
    const start = toValidDate(props.modelValue[0]);
    const end = toValidDate(props.modelValue[1]);
    if (!start) return;
    const updatedStart = new Date(start.getTime());
    updatedStart.setHours(currentHours.value, currentMinutes.value, 0, 0);
    const nextRange: Array<Date | null> = [updatedStart, end];
    inputText.value = formatModelValue(nextRange);
    emit("update:modelValue", nextRange);
    emit("date-select", updatedStart);
    return;
  }

  const base = toValidDate(props.modelValue) ?? new Date(viewYear.value, viewMonth.value, 1);
  const nextDate = new Date(base.getTime());
  nextDate.setHours(currentHours.value, currentMinutes.value, 0, 0);
  if (isDateDisabled(nextDate) && !props.timeOnly) return;
  inputText.value = formatModelValue(nextDate);
  emit("update:modelValue", nextDate);
  emit("date-select", nextDate);
}

function changeHour(delta: number): void {
  if (props.disabled || props.readonly) return;
  currentHours.value = (currentHours.value + delta + 24) % 24;
  applyTimeChange();
}

function changeMinute(delta: number): void {
  if (props.disabled || props.readonly) return;
  currentMinutes.value = (currentMinutes.value + delta + 60) % 60;
  applyTimeChange();
}

function toggleAmPm(): void {
  if (props.disabled || props.readonly) return;
  currentHours.value = (currentHours.value + 12) % 24;
  applyTimeChange();
}

const displayHour = computed<string>(() => {
  if (props.hourFormat === "12") {
    const h = currentHours.value % 12 === 0 ? 12 : currentHours.value % 12;
    return pad2(h);
  }
  return pad2(currentHours.value);
});

const displayMinute = computed<string>(() => pad2(currentMinutes.value));

const displayAmPm = computed<string>(() => (currentHours.value >= 12 ? "PM" : "AM"));

function parseSingleDateString(raw: string): Date | null {
  const text = raw.trim();
  if (!text) return null;

  if (props.timeOnly) {
    const timeMatch = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(text);
    if (timeMatch) {
      let hours = Number(timeMatch[1]);
      const minutes = Number(timeMatch[2]);
      const ampm = timeMatch[3]?.toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const base = toValidDate(props.modelValue) ?? new Date();
        const d = new Date(base.getTime());
        d.setHours(hours, minutes, 0, 0);
        return d;
      }
    }
  }

  const isoMatch =
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?)?$/i.exec(
      text,
    );
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    let hours = isoMatch[4] !== undefined ? Number(isoMatch[4]) : currentHours.value;
    const minutes = isoMatch[5] !== undefined ? Number(isoMatch[5]) : currentMinutes.value;
    const seconds = isoMatch[6] !== undefined ? Number(isoMatch[6]) : 0;
    const ampm = isoMatch[7]?.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    if (
      month >= 0 &&
      month <= 11 &&
      day >= 1 &&
      day <= 31 &&
      hours >= 0 &&
      hours < 24 &&
      minutes >= 0 &&
      minutes < 60
    ) {
      const candidate = new Date(
        year,
        month,
        day,
        props.showTime || isoMatch[4] !== undefined ? hours : 0,
        props.showTime || isoMatch[5] !== undefined ? minutes : 0,
        seconds,
        0,
      );
      if (
        candidate.getFullYear() === year &&
        candidate.getMonth() === month &&
        candidate.getDate() === day
      ) {
        return candidate;
      }
    }
  }

  return null;
}

function isCompleteStrictInput(raw: string): boolean {
  const text = raw.trim();
  if (props.timeOnly) {
    return /^\d{2}:\d{2}(?:\s*(?:AM|PM))?$/i.test(text);
  }
  if (props.selectionMode === "range") {
    return /^\d{4}[-/]\d{2}[-/]\d{2}\s*-\s*\d{4}[-/]\d{2}[-/]\d{2}$/.test(text);
  }
  if (props.showTime) {
    return /^\d{4}[-/]\d{2}[-/]\d{2}(?:[T\s]+\d{2}:\d{2}(?:\s*(?:AM|PM))?)?$/i.test(text);
  }
  return /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(text);
}

function commitParsedInput(raw: string, allowEmptyClear: boolean): void {
  const text = raw.trim();
  if (!text) {
    if (allowEmptyClear && hasValue.value) {
      emit("update:modelValue", null);
      emit("clear");
    }
    return;
  }

  if (props.selectionMode === "range" && text.includes(" - ")) {
    const parts = text.split(/\s+-\s+/);
    const start = parseSingleDateString(parts[0] ?? "");
    const end = parseSingleDateString(parts[1] ?? "");
    if (start && end && !isDateDisabled(start) && !isDateDisabled(end)) {
      const sorted: Array<Date | null> =
        start.getTime() <= end.getTime() ? [start, end] : [end, start];
      syncViewAndTimeFromModel(sorted);
      emit("update:modelValue", sorted);
      emit("date-select", sorted[1] ?? sorted[0]!);
    }
    return;
  }

  const parsed = parseSingleDateString(text);
  if (!parsed) return;
  if (!props.timeOnly && isDateDisabled(parsed)) return;

  const existing = toValidDate(props.modelValue);
  if (existing && existing.getTime() === parsed.getTime()) {
    return;
  }

  syncViewAndTimeFromModel(parsed);
  if (props.selectionMode === "range") {
    const nextRange: Array<Date | null> = [parsed, null];
    emit("update:modelValue", nextRange);
    emit("date-select", parsed);
    return;
  }
  if (props.selectionMode === "multiple") {
    emit("update:modelValue", [parsed]);
    emit("date-select", parsed);
    return;
  }
  emit("update:modelValue", parsed);
  emit("date-select", parsed);
}

function onInput(event: Event): void {
  if (props.disabled || props.readonly) return;
  const target = event.target as HTMLInputElement | null;
  const nextVal = target?.value ?? "";
  inputText.value = nextVal;
  if (isCompleteStrictInput(nextVal)) {
    commitParsedInput(nextVal, false);
  }
}

function onChange(event: Event): void {
  if (props.disabled || props.readonly) return;
  const target = event.target as HTMLInputElement | null;
  const nextVal = target?.value ?? inputText.value;
  inputText.value = nextVal;
  commitParsedInput(nextVal, true);
}

function onFocus(): void {
  focused.value = true;
  if (!props.disabled && !props.readonly) {
    openPanel();
  }
}

function onBlur(): void {
  focused.value = false;
  if (!inputText.value.trim() && hasValue.value) {
    emit("update:modelValue", null);
    emit("clear");
    return;
  }
  commitParsedInput(inputText.value, false);
  inputText.value = formatModelValue(props.modelValue);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    closePanel();
    return;
  }
  if (event.key === "ArrowDown" && !open.value) {
    event.preventDefault();
    openPanel();
  }
}

function onClearClick(event: MouseEvent): void {
  event.stopPropagation();
  if (props.disabled || props.readonly) return;
  inputText.value = "";
  emit("update:modelValue", null);
  emit("clear");
  emit("clear-click", event);
  closePanel();
}

function onTodayClick(): void {
  if (props.disabled || props.readonly) return;
  const now = buildDateWithTime(new Date());
  viewYear.value = now.getFullYear();
  viewMonth.value = now.getMonth();
  if (isDateDisabled(now)) return;
  if (props.selectionMode === "range") {
    const nextRange: Array<Date | null> = [now, now];
    inputText.value = formatModelValue(nextRange);
    emit("update:modelValue", nextRange);
    emit("date-select", now);
    if (props.hideOnRangeSelection && !props.showTime) closePanel();
    return;
  }
  if (props.selectionMode === "multiple") {
    inputText.value = formatModelValue([now]);
    emit("update:modelValue", [now]);
    emit("date-select", now);
    return;
  }
  inputText.value = formatModelValue(now);
  emit("update:modelValue", now);
  emit("date-select", now);
  if (!props.showTime) closePanel();
}

const rootClasses = computed(() => [
  "mw-date-picker",
  "mw-control",
  `mw-date-picker--${normalizedSize.value}`,
  {
    "mw-date-picker--fluid": props.fluid,
    "mw-date-picker--disabled": props.disabled,
    "mw-date-picker--invalid": props.invalid,
    "mw-date-picker--open": open.value,
    "mw-date-picker--filled": hasValue.value,
    "mw-date-picker--focused": focused.value || open.value,
  },
]);
</script>

<template>
  <div
    ref="rootEl"
    v-bind="attrs"
    :id="id"
    :class="rootClasses"
  >
    <input
      ref="inputEl"
      type="text"
      class="mw-date-picker__input mw-input"
      :id="inputId"
      :value="inputText"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :title="title"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="open ? panelId : undefined"
      autocomplete="off"
      @input="onInput"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    />

    <button
      v-if="showClear && hasValue && !disabled && !readonly"
      type="button"
      class="mw-date-picker__clear"
      :aria-label="uiMessages['zh-CN'].common.select.clear"
      tabindex="-1"
      @click="onClearClick"
    >
      <X :size="12" aria-hidden="true" />
    </button>

    <button
      v-if="showIcon"
      type="button"
      class="mw-date-picker__dropdown"
      :disabled="disabled"
      aria-label="选择日期"
      :aria-expanded="open ? 'true' : 'false'"
      tabindex="-1"
      @click="togglePanel"
    >
      <Clock v-if="timeOnly" :size="14" aria-hidden="true" />
      <Calendar v-else :size="14" aria-hidden="true" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        :id="panelId"
        ref="panelEl"
        class="mw-date-picker__panel mw-frost mw-glass"
        :style="panelStyle"
        role="dialog"
        :aria-label="ariaLabel || '选择日期'"
      >
        <template v-if="!timeOnly">
          <div class="mw-date-picker__header">
            <button
              type="button"
              class="mw-date-picker__nav-btn"
              aria-label="上个月"
              @click="prevMonth"
            >
              <ChevronLeft :size="14" aria-hidden="true" />
            </button>

            <div class="mw-date-picker__title">
              <span class="mw-date-picker__year">{{ currentYearLabel }}</span>
              <span class="mw-date-picker__month">{{ currentMonthLabel }}</span>
            </div>

            <button
              type="button"
              class="mw-date-picker__nav-btn"
              aria-label="下个月"
              @click="nextMonth"
            >
              <ChevronRight :size="14" aria-hidden="true" />
            </button>
          </div>

          <div class="mw-date-picker__calendar-container">
            <table class="mw-date-picker__calendar" role="grid">
              <thead>
                <tr>
                  <th
                    v-for="weekday in weekdayLabels"
                    :key="weekday"
                    scope="col"
                    class="mw-date-picker__weekday"
                  >
                    <span class="mw-date-picker__weekday-text">{{ weekday }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(week, wIdx) in calendarWeeks" :key="wIdx">
                  <td
                    v-for="cell in week"
                    :key="cell.isoDate"
                    class="mw-date-picker__day-cell"
                    :class="{
                      'mw-date-picker__day-cell--other-month': cell.otherMonth,
                      'mw-date-picker__day-cell--today': cell.today,
                    }"
                  >
                    <button
                      type="button"
                      class="mw-date-picker__day"
                      :class="{
                        'mw-date-picker__day--selected': cell.selected,
                        'mw-date-picker__day--in-range': cell.inRange,
                        'mw-date-picker__day--today': cell.today,
                        'mw-date-picker__day--other-month': cell.otherMonth,
                        'mw-date-picker__day--disabled': cell.disabled,
                      }"
                      :data-date="cell.isoDate"
                      :disabled="cell.disabled"
                      :aria-selected="cell.selected ? 'true' : 'false'"
                      :aria-disabled="cell.disabled ? 'true' : undefined"
                      @click="onSelectDay(cell)"
                    >
                      {{ cell.day }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <div
          v-if="showTime || timeOnly"
          class="mw-date-picker__time-picker"
        >
          <div class="mw-date-picker__time-unit">
            <button
              type="button"
              class="mw-date-picker__time-btn"
              aria-label="Next Hour"
              @click="changeHour(1)"
            >
              <ChevronUp :size="12" aria-hidden="true" />
            </button>
            <span class="mw-date-picker__time-val" data-time-part="hour">{{ displayHour }}</span>
            <button
              type="button"
              class="mw-date-picker__time-btn"
              aria-label="Previous Hour"
              @click="changeHour(-1)"
            >
              <ChevronDown :size="12" aria-hidden="true" />
            </button>
          </div>

          <div class="mw-date-picker__time-sep">:</div>

          <div class="mw-date-picker__time-unit">
            <button
              type="button"
              class="mw-date-picker__time-btn"
              aria-label="Next Minute"
              @click="changeMinute(1)"
            >
              <ChevronUp :size="12" aria-hidden="true" />
            </button>
            <span class="mw-date-picker__time-val" data-time-part="minute">{{ displayMinute }}</span>
            <button
              type="button"
              class="mw-date-picker__time-btn"
              aria-label="Previous Minute"
              @click="changeMinute(-1)"
            >
              <ChevronDown :size="12" aria-hidden="true" />
            </button>
          </div>

          <div
            v-if="hourFormat === '12'"
            class="mw-date-picker__time-unit"
          >
            <button
              type="button"
              class="mw-date-picker__time-btn"
              aria-label="Toggle AM/PM"
              @click="toggleAmPm"
            >
              <ChevronUp :size="12" aria-hidden="true" />
            </button>
            <span class="mw-date-picker__time-val" data-time-part="ampm">{{ displayAmPm }}</span>
            <button
              type="button"
              class="mw-date-picker__time-btn"
              aria-label="Toggle AM/PM"
              @click="toggleAmPm"
            >
              <ChevronDown :size="12" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          v-if="showButtonBar"
          class="mw-date-picker__buttonbar"
        >
          <button
            type="button"
            class="mw-date-picker__bar-btn"
            @click="onTodayClick"
          >
            今天
          </button>
          <button
            type="button"
            class="mw-date-picker__bar-btn"
            @click="onClearClick"
          >
            清除
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
.mw-date-picker {
  --_dp-min-w: calc(var(--size-lg-h) * 4);
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: var(--control-h);
  min-width: var(--_dp-min-w);
  padding-inline-end: var(--space-1);
}

.mw-date-picker--fluid {
  width: 100%;
  display: flex;
}

.mw-date-picker--sm {
  --control-h: var(--size-sm-h);
  --control-font: var(--size-sm-font);
  --control-px: var(--size-sm-px);
  --control-radius: var(--size-sm-radius);
}

.mw-date-picker--lg {
  --control-h: var(--size-lg-h);
  --control-font: var(--size-lg-font);
  --control-px: var(--size-lg-px);
  --control-radius: var(--size-lg-radius);
}

.mw-date-picker--disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-date-picker--invalid {
  border-color: var(--danger);
}

.mw-date-picker__input {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  padding: var(--space-1-5) var(--control-px);
  outline: none;
}

.mw-date-picker__clear,
.mw-date-picker__dropdown {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-xs-h);
  height: var(--size-xs-h);
  border: 0;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  flex-shrink: 0;
  border-radius: var(--radius-xs);
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-date-picker__clear:hover:not(:disabled),
.mw-date-picker__dropdown:hover:not(:disabled) {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-date-picker__panel {
  border-radius: var(--radius-float);
  box-shadow: var(--shadow-floating);
  padding: var(--space-2-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  user-select: none;
}

.mw-date-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding-bottom: var(--space-1-5);
  border-bottom: var(--border-width) solid var(--border-subtle);
}

.mw-date-picker__title {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1-5);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.mw-date-picker__nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-sm-h);
  height: var(--size-sm-h);
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-item);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-date-picker__nav-btn:hover {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-date-picker__calendar {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.mw-date-picker__weekday {
  padding: var(--space-1) 0;
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
  text-align: center;
}

.mw-date-picker__day-cell {
  padding: var(--space-px);
  text-align: center;
}

.mw-date-picker__day {
  width: var(--size-md-h);
  height: var(--size-md-h);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-item);
  background: transparent;
  color: var(--text-primary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-date-picker__day:hover:not(:disabled) {
  background-color: var(--fill-default);
}

.mw-date-picker__day--other-month {
  color: var(--text-tertiary);
}

.mw-date-picker__day--today {
  font-weight: var(--weight-semibold);
  border: var(--border-width) solid var(--border-strong);
}

.mw-date-picker__day--in-range {
  background-color: var(--fill-selected);
}

.mw-date-picker__day--selected,
.mw-date-picker__day--selected:hover:not(:disabled) {
  background-color: var(--accent);
  color: var(--text-on-accent);
  font-weight: var(--weight-semibold);
}

.mw-date-picker__day--disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-date-picker__time-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding-top: var(--space-1-5);
  border-top: var(--border-width) solid var(--border-subtle);
}

.mw-date-picker__time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-0-5);
}

.mw-date-picker__time-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-xs-h);
  height: var(--icon-lg);
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-xs);
  cursor: pointer;
}

.mw-date-picker__time-btn:hover {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-date-picker__time-val {
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-variant-numeric: tabular-nums;
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.mw-date-picker__buttonbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-1-5);
  border-top: var(--border-width) solid var(--border-subtle);
}

.mw-date-picker__bar-btn {
  border: 0;
  background: transparent;
  color: var(--text-accent);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-item);
  cursor: pointer;
}

.mw-date-picker__bar-btn:hover {
  background-color: var(--fill-default);
}

@media (prefers-reduced-motion: reduce) {
  .mw-date-picker__clear,
  .mw-date-picker__dropdown,
  .mw-date-picker__nav-btn,
  .mw-date-picker__day {
    transition: none;
  }
}
</style>
