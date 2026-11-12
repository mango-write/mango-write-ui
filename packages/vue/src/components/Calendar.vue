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
import type {
  CalendarFirstDayOfWeek,
  CalendarModelValue,
  CalendarProps,
  CalendarSelectionMode,
  CalendarVariant,
  CalendarViewRange,
} from "./calendar-defs";

export type {
  CalendarCell,
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
