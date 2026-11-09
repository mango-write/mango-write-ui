<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, useId, watch } from "vue";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
} from "lucide-vue-next";
import { useComboPanel } from "../lib/useComboPanel";
import { uiMessages, type UiLocaleSource } from "../locale/index.js";
import Calendar from "./Calendar.vue";
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
  firstDayOfWeek: 1,
  days: undefined,
  locale: undefined,
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
const calendarRef = ref<InstanceType<typeof Calendar> | null>(null);
const focused = ref(false);

const localeKey = computed<UiLocaleSource>(() => {
  if (props.locale) {
    return props.locale.toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
  }
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang?.toLowerCase() ?? "";
    if (htmlLang.startsWith("en")) return "en-US";
  }
  return "zh-CN";
});

const copy = computed(() => uiMessages[localeKey.value].common);

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

function formatSingleDate(d: Date): string {
  if (props.timeOnly) {
    return formatTimePart(d);
  }
  const yyyy = String(d.getFullYear());
  const yy = yyyy.slice(-2);
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const fmt = props.dateFormat || "yy-mm-dd";
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
} = useComboPanel(rootEl, panelEl, { matchTriggerWidth: false });

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

function buildDateWithTime(base: Date): Date {
  const d = new Date(base.getTime());
  if (props.showTime || props.timeOnly) {
    d.setHours(currentHours.value, currentMinutes.value, 0, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function onCalendarUpdateModelValue(nextVal: Date | Array<Date | null> | null): void {
  inputText.value = formatModelValue(nextVal);
  emit("update:modelValue", nextVal);

  if (props.selectionMode === "range") {
    if (
      Array.isArray(nextVal) &&
      nextVal[0] &&
      nextVal[1] &&
      props.hideOnRangeSelection &&
      !props.showTime
    ) {
      closePanel();
    }
    return;
  }

  if (props.selectionMode === "single" && !props.showTime) {
    closePanel();
  }
}

function onCalendarDateSelect(chosen: Date): void {
  emit("date-select", chosen);
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
  calendarRef.value?.backToToday();
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

const isWideValueMode = computed(
  () =>
    props.selectionMode === "range" ||
    props.selectionMode === "multiple" ||
    props.showTime,
);

const rootClasses = computed(() => [
  "mw-date-picker",
  "mw-control",
  `mw-date-picker--${normalizedSize.value}`,
  {
    "mw-date-picker--wide": isWideValueMode.value,
    "mw-date-picker--time-only": props.timeOnly,
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
      :aria-label="copy.select.clear"
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
      :aria-label="copy.calendar.chooseDate"
      :aria-expanded="open ? 'true' : 'false'"
      tabindex="-1"
      @click="togglePanel"
    >
      <Clock v-if="timeOnly" :size="14" aria-hidden="true" />
      <CalendarIcon v-else :size="14" aria-hidden="true" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        :id="panelId"
        ref="panelEl"
        class="mw-date-picker__panel mw-frost mw-glass"
        :style="panelStyle"
        role="dialog"
        :aria-label="ariaLabel || copy.calendar.chooseDate"
      >
        <Calendar
          v-if="!timeOnly"
          ref="calendarRef"
          variant="plain"
          :model-value="modelValue"
          :selection-mode="selectionMode"
          :min-date="minDate"
          :max-date="maxDate"
          :first-day-of-week="firstDayOfWeek"
          :days="days"
          :locale="locale"
          :hours="showTime ? currentHours : 0"
          :minutes="showTime ? currentMinutes : 0"
          :disabled="disabled"
          :readonly="readonly"
          @update:model-value="onCalendarUpdateModelValue"
          @date-select="onCalendarDateSelect"
        />

        <div
          v-if="showTime || timeOnly"
          class="mw-date-picker__time-picker"
          :class="{ 'mw-date-picker__time-picker--standalone': timeOnly }"
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
            {{ copy.calendar.today }}
          </button>
          <button
            type="button"
            class="mw-date-picker__bar-btn"
            @click="onClearClick"
          >
            {{ copy.calendar.clear }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
.mw-date-picker {
  --mw-date-picker-w: calc(var(--size-lg-h) * 4.5);
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: var(--control-h);
  width: var(--mw-date-picker-w);
  max-width: 100%;
  justify-self: start;
  padding-inline-end: var(--space-1);
}

.mw-date-picker--wide {
  --mw-date-picker-w: calc(var(--size-lg-h) * 5.5);
}

.mw-date-picker--time-only {
  --mw-date-picker-w: calc(var(--size-lg-h) * 3.5);
}

.mw-date-picker--fluid {
  width: 100%;
  justify-self: stretch;
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
  font-variant-numeric: tabular-nums;
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
  width: max-content;
  max-width: calc(100vw - var(--space-4));
  border-radius: var(--radius-float);
  box-shadow: var(--shadow-floating);
  padding: var(--space-2-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  user-select: none;
}

.mw-date-picker__time-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding-top: var(--space-1-5);
  border-top: var(--border-width) solid var(--border-subtle);
}

.mw-date-picker__time-picker--standalone {
  padding-top: var(--space-0);
  padding-inline: var(--space-2);
  border-top: 0;
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
  .mw-date-picker__dropdown {
    transition: none;
  }
}
</style>
