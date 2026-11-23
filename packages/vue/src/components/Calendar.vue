<script setup lang="ts">
import { computed, ref, useAttrs, watch, type CSSProperties } from "vue";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-vue-next";
import {
  buildCalendarWeeks,
  getWeekdayLabels,
  isSameCalendarDay,
  parseDateValue as parseCoreDateValue,
  type CalendarCell,
} from "@mango-write/ui-core/headless/calendar-grid";
import { areaDurationMs } from "../lib/area-transition";
import { uiMessages, type UiLocaleSource } from "../locale/index.js";
import InputNumber from "./InputNumber.vue";
import Popover from "./Popover.vue";
import type {
  CalendarFirstDayOfWeek,
  CalendarModelValue,
  CalendarMonthContext,
  CalendarNavigationContext,
  CalendarProps,
  CalendarSelectionMode,
  CalendarTitleContext,
  CalendarVariant,
  CalendarViewRange,
} from "./calendar-defs";

export type {
  CalendarCell,
  CalendarFirstDayOfWeek,
  CalendarModelValue,
  CalendarMonthContext,
  CalendarNavigationContext,
  CalendarProps,
  CalendarSelectionMode,
  CalendarTitleContext,
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
  pickerAppendTo: "self",
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
  today: [date: Date];
}>();

defineSlots<{
  title?: (context: CalendarTitleContext) => unknown;
  navigation?: (context: CalendarNavigationContext) => unknown;
  weekday?: (props: { label: string; index: number }) => unknown;
  day?: (props: { cell: CalendarCell }) => unknown;
  month?: (context: CalendarMonthContext) => unknown;
  footer?: (context: CalendarTitleContext) => unknown;
}>();

const attrs = useAttrs();

function parseDateValue(val: unknown): Date | null {
  return parseCoreDateValue(val, props.hours, props.minutes);
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
const pickerYear = ref<number | null>(todayYear);
const effectivePickerYear = computed(() => Math.max(100, Math.min(9999, pickerYear.value ?? viewYear.value)));
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
  const primary = parseDateValue(props.viewDate) ?? resolvePrimarySelectedDate();
  if (primary) {
    viewYear.value = primary.getFullYear();
    viewMonth.value = primary.getMonth();
    pickerYear.value = primary.getFullYear();
  }
}

syncViewFromProps();

watch(
  () => [props.viewDate, props.modelValue, props.selected],
  () => {
    syncViewFromProps();
  },
  { deep: true },
);

const isCurrentMonth = computed<boolean>(
  () => viewYear.value === todayYear && viewMonth.value === todayMonth,
);

const calendarDate = computed(() => new Date(viewYear.value, viewMonth.value, 1));
const monthLabel = computed<string>(() => {
  return new Intl.DateTimeFormat(resolvedLocale.value, {
    year: "numeric",
    month: "long",
  }).format(calendarDate.value);
});

const titleContext = computed(() => ({ date: calendarDate.value, label: monthLabel.value }));
const showToday = computed(() => props.showTodayShortcut === "always" || (props.showTodayShortcut && !isCurrentMonth.value));
const navigationContext = computed<CalendarNavigationContext>(() => ({
  ...titleContext.value,
  disabled: props.disabled,
  showToday: showToday.value,
  previous: prevMonth,
  next: nextMonth,
  today: backToToday,
}));

const monthNames = computed<string[]>(() =>
  Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(resolvedLocale.value, { month: "short" }).format(
      new Date(2000, i, 1),
    ),
  ),
);

const weekdayLabels = computed<string[]>(() =>
  getWeekdayLabels(localeKey.value, props.firstDayOfWeek),
);

const calendarWeeks = computed<CalendarCell[][]>(() =>
  buildCalendarWeeks({
    year: viewYear.value,
    month: viewMonth.value,
    today: new Date(todayYear, todayMonth, todayDate),
    firstDayOfWeek: props.firstDayOfWeek,
    selectionMode: props.selectionMode,
    modelValue: props.modelValue,
    selected: props.selected,
    minDate: props.minDate,
    maxDate: props.maxDate,
    days: props.days,
    onlySelectableWithDays: props.onlySelectableWithDays,
    disabled: props.disabled,
    readonly: props.readonly,
    hours: props.hours,
    minutes: props.minutes,
  }),
);

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
  emit("today", new Date());
}

function setSwitcherOpen(open: boolean): void {
  if (open) pickerYear.value = viewYear.value;
  switcherOpen.value = open;
}

function pickMonth(monthIndexZeroBased: number): void {
  if (props.disabled) return;
  viewYear.value = effectivePickerYear.value;
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
        <Popover :open="switcherOpen" :append-to="pickerAppendTo" class="mw-calendar__switcher"
          :aria-label="copy.chooseMonth" @update:open="setSwitcherOpen">
          <template #trigger>
            <button type="button" class="mw-calendar__switcher-btn" :disabled="disabled">
              <span class="mw-calendar__month-label"><slot name="title" v-bind="titleContext">{{ monthLabel }}</slot></span>
              <ChevronDown :size="12" class="mw-calendar__switcher-chevron"
                :class="{ 'mw-calendar__switcher-chevron--open': switcherOpen }" aria-hidden="true" />
            </button>
          </template>
          <div class="mw-calendar__switcher-head">
            <button type="button" class="mw-calendar__nav-btn" :aria-label="copy.prevYear"
              :disabled="disabled || effectivePickerYear <= 100" @click="pickerYear = effectivePickerYear - 1">
              <ChevronLeft :size="14" aria-hidden="true" />
            </button>
            <InputNumber v-model="pickerYear" class="mw-calendar__switcher-year" :min="100" :max="9999" :use-grouping="false"
              :max-fraction-digits="0" :disabled="disabled" :aria-label="copy.year" />
            <button type="button" class="mw-calendar__nav-btn" :aria-label="copy.nextYear"
              :disabled="disabled || effectivePickerYear >= 9999" @click="pickerYear = effectivePickerYear + 1">
              <ChevronRight :size="14" aria-hidden="true" />
            </button>
          </div>
          <div class="mw-calendar__month-grid">
            <button v-for="(label, idx) in monthNames" :key="idx" type="button" class="mw-calendar__month-option"
              :aria-pressed="idx === viewMonth && effectivePickerYear === viewYear" :disabled="disabled" @click="pickMonth(idx)">
              <slot name="month" :label="label" :year="effectivePickerYear" :month="idx + 1"
                :selected="idx === viewMonth && effectivePickerYear === viewYear">{{ label }}</slot>
            </button>
          </div>
        </Popover>
      </div>
      <div class="mw-calendar__nav">
        <slot name="navigation" v-bind="navigationContext">
          <button v-if="showToday" type="button" class="mw-calendar__today-shortcut" :disabled="disabled" @click="backToToday">
            {{ copy.backToToday }}
          </button>
          <button type="button" class="mw-calendar__nav-btn" :disabled="disabled" :aria-label="copy.prevMonth" @click="prevMonth">
            <ChevronLeft :size="14" aria-hidden="true" />
          </button>
          <button type="button" class="mw-calendar__nav-btn" :disabled="disabled" :aria-label="copy.nextMonth" @click="nextMonth">
            <ChevronRight :size="14" aria-hidden="true" />
          </button>
        </slot>
      </div>
    </div>

    <div class="mw-calendar__weekdays" role="row">
      <span
        v-for="(weekday, index) in weekdayLabels"
        :key="weekday"
        role="columnheader"
        class="mw-calendar__weekday"
      >
        <slot name="weekday" :label="weekday" :index="index">{{ weekday }}</slot>
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
          <template v-for="cell in calendarWeeks.flat()" :key="cell.isoDate">
            <span v-if="hideOutsideDays && cell.otherMonth" aria-hidden="true" />
            <button
              v-else
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
              :aria-label="dayLabel?.(cell)"
              :aria-current="cell.today ? 'date' : undefined"
              :aria-selected="cell.selected ? 'true' : 'false'"
              :aria-disabled="cell.disabled ? 'true' : undefined"
              @click="onSelectDay(cell)"
            >
              <slot name="day" :cell="cell">{{ cell.day }}</slot>
            </button>
          </template>
        </div>
      </Transition>
    </div>
    <slot name="footer" v-bind="titleContext" />
  </div>
</template>
